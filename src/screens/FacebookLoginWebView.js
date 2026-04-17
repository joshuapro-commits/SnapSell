import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { storageService } from '../services/storage';

const DESKTOP_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export const FacebookLoginWebView = ({ navigation }) => {
  const webViewRef = useRef(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasConnected, setHasConnected] = useState(false);

  const handleNavigationStateChange = async (navState) => {
    console.log('[FB_LOGIN] Navigation URL:', navState.url);

    // Success detection: URL contains facebook.com but NOT login or checkpoint
    if (
      navState.url.includes('facebook.com') &&
      !navState.url.includes('login') &&
      !navState.url.includes('checkpoint') &&
      !hasConnected
    ) {
      console.log('[FB_LOGIN] Login successful detected!');
      setHasConnected(true);

      // Inject JavaScript to grab user profile info
      // Wait for DOM to be fully ready before extracting
      const injectedJS = `
        (function() {
          // Wait for page to be fully loaded
          const waitForElement = (selector, timeout = 10000) => {
            return new Promise((resolve) => {
              if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
              }

              const observer = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                  observer.disconnect();
                  resolve(document.querySelector(selector));
                }
              });

              observer.observe(document.body, {
                childList: true,
                subtree: true
              });

              setTimeout(() => {
                observer.disconnect();
                resolve(null);
              }, timeout);
            });
          };

          // Wait a bit for page to settle, then extract
          setTimeout(async () => {
            try {
              let userName = '';
              let profilePic = '';

              // Wait for navigation or profile elements to appear
              await waitForElement('[role="navigation"], [role="banner"], a[aria-label]', 5000);

              // Method 1: Try to find from profile menu button
              const profileButton = document.querySelector('div[aria-label*="Account"], div[aria-label*="Profile"]');
              if (profileButton) {
                userName = profileButton.getAttribute('aria-label') || '';
              }

              // Method 2: Look for profile link in navigation
              if (!userName) {
                const profileLinks = document.querySelectorAll('a[href*="/profile"], a[href*="/user"]');
                for (let link of profileLinks) {
                  const ariaLabel = link.getAttribute('aria-label');
                  if (ariaLabel && ariaLabel.length > 0 && ariaLabel.length < 50) {
                    userName = ariaLabel;
                    break;
                  }
                }
              }

              // Method 3: Look for any text in navigation that might be the name
              if (!userName) {
                const navSpans = document.querySelectorAll('[role="navigation"] span, [role="banner"] span');
                for (let span of navSpans) {
                  const text = span.textContent?.trim();
                  if (text && text.length > 2 && text.length < 50 && !text.includes('Facebook')) {
                    userName = text;
                    break;
                  }
                }
              }

              // Method 4: Profile picture
              const profileImgs = document.querySelectorAll('img[alt], image[href]');
              for (let img of profileImgs) {
                const alt = img.getAttribute('alt') || '';
                const href = img.getAttribute('href') || img.src || '';
                if (alt.length > 0 && alt.length < 50 && href.includes('profile')) {
                  profilePic = href;
                  userName = userName || alt;
                  break;
                }
              }

              console.log('[FB_INJECT] Extracted - userName:', userName, 'profilePic:', profilePic);

              // Send data back to React Native
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PROFILE_DATA',
                userName: userName.trim(),
                profilePic: profilePic,
              }));
            } catch (error) {
              console.error('[FB_INJECT] Error:', error);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PROFILE_ERROR',
                error: error.message,
              }));
            }
          }, 3000); // Wait 3 seconds for page to fully render
        })();
        true;
      `;

      // Inject after navigation completes
      setTimeout(() => {
        webViewRef.current?.injectJavaScript(injectedJS);
      }, 1000);
    }
  };

  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('[FB_LOGIN] Message received:', data);

      if (data.type === 'PROFILE_DATA') {
        // Save connection status with user profile info
        const connectionData = {
          connected: true,
          connectedAt: new Date().toISOString(),
          userName: data.userName || 'Facebook User',
          profilePic: data.profilePic || '',
        };

        await storageService.savePlatformToken(user.id, 'facebook', connectionData);
        
        console.log('[FB_LOGIN] Connection saved:', connectionData);

        // Show success and navigate back
        Alert.alert(
          'Successfully Connected',
          `Connected as: ${connectionData.userName}\n\nYou can now publish listings to Facebook Marketplace.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else if (data.type === 'PROFILE_ERROR') {
        console.error('[FB_LOGIN] Profile extraction error:', data.error);
        
        // Still save connection even if profile extraction failed
        const connectionData = {
          connected: true,
          connectedAt: new Date().toISOString(),
          userName: 'Facebook User',
          profilePic: '',
        };

        await storageService.savePlatformToken(user.id, 'facebook', connectionData);

        Alert.alert(
          'Successfully Connected',
          'Your Facebook account has been connected. You can now publish listings to Facebook Marketplace.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('[FB_LOGIN] Error handling message:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connect Facebook</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1877F2" />
          <Text style={styles.loadingText}>Loading Facebook...</Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: 'https://www.facebook.com/login' }}
        userAgent={DESKTOP_USER_AGENT}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        domStorageEnabled={true}
        javaScriptEnabled={true}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        style={styles.webview}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Montserrat_700Bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Montserrat_600SemiBold',
  },
  webview: {
    flex: 1,
  },
});
