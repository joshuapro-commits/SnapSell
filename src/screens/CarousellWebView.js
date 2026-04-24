import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { storageService } from '../services/storage';

// Mobile Safari iOS UA - forces mobile layout
const MOBILE_USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1';

export const CarousellWebView = ({ navigation, route }) => {
  const { mode, userId, region, listingData } = route.params;
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);
  const [hasConnected, setHasConnected] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [webViewVisible, setWebViewVisible] = useState(false);

  // Fallback: hide loading after 3 seconds
  useEffect(() => {
    console.log('[CAROUSELL] Component mounted, loading state:', loading);
    const timer = setTimeout(() => {
      console.log('[CAROUSELL] Timeout fallback - hiding overlay');
      setLoading(false);
      setShowOverlay(false);
    }, 3000);
    return () => {
      console.log('[CAROUSELL] Component unmounting');
      clearTimeout(timer);
    };
  }, []);

  const getInitialUrl = () => {
    const domain = region.domain;
    if (mode === 'login') {
      return `https://www.${domain}/login`;
    } else if (mode === 'sell') {
      return `https://www.${domain}/sell/new`;
    }
    return `https://www.${domain}`;
  };

  const handleLoadEnd = () => {
    console.log('[CAROUSELL] handleLoadEnd called');
    setLoading(false);
    setShowOverlay(false);
    
    if (mode === 'login' && !hasConnected) {
      setTimeout(() => {
        webViewRef.current?.injectJavaScript(`
          (function() {
            const url = window.location.href;
            const hostname = window.location.hostname;
            
            // Only check on Carousell domains (skip Google OAuth popups)
            if (!hostname.includes('carousell')) {
              console.log('[CAROUSELL_CHECK] Skipping - not on Carousell domain:', hostname);
              return;
            }
            
            const isLoginPage = url.includes('/login');
            const isSignupPage = url.includes('/signup');
            const isAuthPage = url.includes('/auth');
            
            // Check for authentication cookies
            const cookies = document.cookie;
            const hasAuthCookie = cookies.includes('access_token') || 
                                  cookies.includes('session') || 
                                  cookies.includes('auth') ||
                                  cookies.includes('user_id');
            
            // Check for logged-in UI elements
            const hasProfileButton = !!document.querySelector('[data-testid="profile-button"]');
            const hasUserMenu = !!document.querySelector('[href*="/u/"]');
            const hasLogoutButton = !!document.querySelector('[href*="/logout"]');
            
            const isLoggedIn = hasAuthCookie || hasProfileButton || hasUserMenu || hasLogoutButton;
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'CHECK_LOGIN_STATUS',
              url: url,
              isLoginRelated: isLoginPage || isSignupPage || isAuthPage,
              isLoggedIn: isLoggedIn,
              hasAuthCookie: hasAuthCookie,
              hasProfileUI: hasProfileButton || hasUserMenu || hasLogoutButton
            }));
          })();
          true;
        `);
      }, 2000);
    }
  };

  const handleNavigationStateChange = async (navState) => {
    console.log(`[CAROUSELL_${mode.toUpperCase()}] Navigation URL:`, navState.url);

    // Block Google One Tap popup navigation
    if (navState.url.includes('accounts.google.com/gsi/select')) {
      console.log('[CAROUSELL] Blocking Google One Tap popup, reloading page...');
      setTimeout(() => {
        webViewRef.current?.goBack();
      }, 100);
      return;
    }

    if (mode === 'login') {
      // Login mode: detect successful login
      const isCarousellDomain = navState.url.includes(region.domain);
      const isLoginPage = navState.url.includes('/login');
      const isSignupPage = navState.url.includes('/signup');
      const isAuthPage = navState.url.includes('/auth');
      const isGoogleAuth = navState.url.includes('accounts.google.com');
      const isFacebookAuth = navState.url.includes('facebook.com');
      
      // Success if on Carousell domain and NOT on login/signup/auth pages
      if (
        isCarousellDomain &&
        !isLoginPage &&
        !isSignupPage &&
        !isAuthPage &&
        !isGoogleAuth &&
        !isFacebookAuth &&
        !hasConnected
      ) {
        console.log('[CAROUSELL_LOGIN] Login successful detected!');
        setHasConnected(true);

        // Save connection immediately
        const connectionData = {
          connected: true,
          connectedAt: new Date().toISOString(),
          userName: 'Carousell User',
          region: region.id,
          regionName: region.name,
          domain: region.domain,
        };

        await storageService.savePlatformToken(userId, 'carousell', connectionData);
        console.log('[CAROUSELL_LOGIN] Connection saved, redirecting back...');

        // Redirect back immediately
        navigation.goBack();
        
        // Show alert after redirect
        setTimeout(() => {
          Alert.alert(
            'Successfully Connected',
            `Your Carousell ${region.name} account has been connected. You can now publish listings to Carousell.`
          );
        }, 500);

        // Try to extract profile info in background (optional)
        const injectedJS = `
          (function() {
            setTimeout(async () => {
              try {
                let userName = '';
                
                // Method 1: Profile button
                const profileBtn = document.querySelector('[data-testid="profile-button"]');
                if (profileBtn) userName = profileBtn.textContent.trim();
                
                // Method 2: Navigation links
                if (!userName) {
                  const profileLink = document.querySelector('a[href*="/u/"]');
                  if (profileLink) {
                    const match = profileLink.href.match(/\\/u\\/([^\\/]+)/);
                    if (match) userName = match[1];
                  }
                }
                
                // Method 3: Meta tags
                if (!userName) {
                  const metaTag = document.querySelector('meta[property="profile:username"]');
                  if (metaTag) userName = metaTag.content;
                }
                
                if (userName) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'UPDATE_PROFILE',
                    userName: userName.trim(),
                  }));
                }
              } catch (error) {
                console.error('[CAROUSELL_INJECT] Error:', error);
              }
            }, 2000);
          })();
          true;
        `;

        setTimeout(() => {
          webViewRef.current?.injectJavaScript(injectedJS);
        }, 1000);
      }
    } else if (mode === 'sell') {
      // Sell mode: detect successful listing creation
      if (navState.url.match(/\/p\/[\w-]+-\d+/) && !hasConnected) {
        console.log('[CAROUSELL_SELL] Listing published successfully!');
        setHasConnected(true);

        Alert.alert(
          'Published Successfully',
          'Your listing has been published to Carousell!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('ListingSuccess', {
                productName: listingData.name,
                selectedPlatforms: { carousell: true },
                publishResults: {
                  carousell: {
                    success: true,
                    listingUrl: navState.url,
                  },
                },
              }),
            },
          ]
        );
      }
    }
  };

  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log(`[CAROUSELL_${mode.toUpperCase()}] Message received:`, data);

      if (data.type === 'CHECK_LOGIN_STATUS' && mode === 'login' && !hasConnected) {
        console.log('[CAROUSELL_LOGIN] Checking login status:', data);
        
        // Only consider it success if:
        // 1. NOT on login-related pages
        // 2. Has authentication indicators (cookies OR profile UI)
        if (data.url.includes(region.domain) && 
            !data.isLoginRelated && 
            data.isLoggedIn) {
          console.log('[CAROUSELL_LOGIN] Login successful - authenticated!');
          console.log('[CAROUSELL_LOGIN] Auth cookie:', data.hasAuthCookie);
          console.log('[CAROUSELL_LOGIN] Profile UI:', data.hasProfileUI);
          setHasConnected(true);

          const connectionData = {
            connected: true,
            connectedAt: new Date().toISOString(),
            userName: 'Carousell User',
            region: region.id,
            regionName: region.name,
            domain: region.domain,
          };

          await storageService.savePlatformToken(userId, 'carousell', connectionData);
          console.log('[CAROUSELL_LOGIN] Connection saved, redirecting back...');

          navigation.goBack();
          
          setTimeout(() => {
            Alert.alert(
              'Successfully Connected',
              `Your Carousell ${region.name} account has been connected. You can now publish listings to Carousell.`
            );
          }, 500);
        } else if (!data.isLoginRelated && !data.isLoggedIn) {
          console.log('[CAROUSELL_LOGIN] Not on login page but no auth detected - waiting for auth...');
        }
      }

      if (mode === 'login' && data.type === 'UPDATE_PROFILE') {
        // Update profile info in background
        const existingData = await storageService.getPlatformTokens(userId);
        const carousellData = existingData.carousell || {};
        
        const updatedData = {
          ...carousellData,
          userName: data.userName || carousellData.userName,
        };

        await storageService.savePlatformToken(userId, 'carousell', updatedData);
        console.log('[CAROUSELL_LOGIN] Profile updated:', updatedData);
      }
    } catch (error) {
      console.error(`[CAROUSELL_${mode.toUpperCase()}] Error handling message:`, error);
    }
  };

  const getHeaderTitle = () => {
    if (mode === 'login') return `Connect Carousell ${region.name}`;
    if (mode === 'sell') return 'Publish to Carousell';
    return 'Carousell';
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
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        <TouchableOpacity 
          style={styles.reloadButton}
          onPress={() => webViewRef.current?.reload()}
        >
          <Ionicons name="reload" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {showOverlay && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#D32F2F" />
          <Text style={styles.loadingText}>Loading Carousell...</Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        <WebView
            ref={webViewRef}
            source={{ uri: getInitialUrl() }}
            userAgent={MOBILE_USER_AGENT}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            sharedCookiesEnabled={true}
            scalesPageToFit={true}
            onShouldStartLoadWithRequest={(request) => {
              console.log('[CAROUSELL] Navigation:', request.url);
              return true;
            }}
            onNavigationStateChange={handleNavigationStateChange}
            onMessage={handleMessage}
            onLoadEnd={() => {
              console.log('[CAROUSELL] Page loaded');
              setLoading(false);
              setShowOverlay(false);
              
              // Inject login detection
              if (mode === 'login' && !hasConnected) {
                setTimeout(() => {
                  webViewRef.current?.injectJavaScript(`
                    (function() {
                      const url = window.location.href;
                      const hostname = window.location.hostname;
                      
                      if (!hostname.includes('carousell')) return;
                      
                      const isLoginPage = url.includes('/login');
                      const isSignupPage = url.includes('/signup');
                      const isAuthPage = url.includes('/auth');
                      
                      const cookies = document.cookie;
                      const hasAuthCookie = cookies.includes('access_token') || 
                                            cookies.includes('session') || 
                                            cookies.includes('auth') ||
                                            cookies.includes('user_id');
                      
                      const hasProfileButton = !!document.querySelector('[data-testid="profile-button"]');
                      const hasUserMenu = !!document.querySelector('[href*="/u/"]');
                      const hasLogoutButton = !!document.querySelector('[href*="/logout"]');
                      
                      const isLoggedIn = hasAuthCookie || hasProfileButton || hasUserMenu || hasLogoutButton;
                      
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'CHECK_LOGIN_STATUS',
                        url: url,
                        isLoginRelated: isLoginPage || isSignupPage || isAuthPage,
                        isLoggedIn: isLoggedIn,
                        hasAuthCookie: hasAuthCookie,
                        hasProfileUI: hasProfileButton || hasUserMenu || hasLogoutButton
                      }));
                    })();
                    true;
                  `);
                }, 2000);
              }
            }}
            onError={(e) => console.error('[CAROUSELL] Error:', e.nativeEvent)}
            style={{ flex: 1 }}
            injectedJavaScriptBeforeContentLoaded={`
              // 1. Force mobile viewport
              (function() {
                var meta = document.createElement('meta');
                meta.name = 'viewport';
                meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                if (document.head) {
                  document.head.appendChild(meta);
                } else {
                  document.addEventListener('DOMContentLoaded', function() {
                    document.head.appendChild(meta);
                  });
                }
              })();
              true;
            `}
            injectedJavaScript={`
              (function() {
                // 2. Inject CSS to hide illustration and force full-width form
                var style = document.createElement('style');
                style.innerHTML = \`
                  /* Hide left illustration container */
                  body > div > div:first-child { display: none !important; }
                  
                  /* Force login form to full width */
                  body > div > div:last-child { 
                    width: 100% !important; 
                    max-width: 100% !important; 
                    margin: 0 !important;
                    flex: 1 !important;
                  }
                  
                  /* Hide any split-screen, illustration, or onboarding elements */
                  [class*="SplitScreen"],
                  [class*="split-screen"],
                  [class*="illustration"],
                  [class*="Illustration"],
                  [class*="onboarding"],
                  [class*="Onboarding"],
                  [data-testid*="illustration"],
                  [data-testid*="onboarding"] {
                    display: none !important;
                  }
                  
                  /* Ensure form container takes full width */
                  [class*="login"],
                  [class*="Login"],
                  [class*="auth"],
                  [class*="Auth"] {
                    width: 100% !important;
                    max-width: 100% !important;
                  }
                \`;
                document.head.appendChild(style);
                
                // 3. Programmatically hide first child if it exists
                setTimeout(function() {
                  var body = document.body;
                  if (body) {
                    var mainDiv = body.querySelector(':scope > div');
                    if (mainDiv && mainDiv.children.length >= 2) {
                      mainDiv.children[0].style.display = 'none';
                      mainDiv.children[1].style.width = '100%';
                      mainDiv.children[1].style.maxWidth = '100%';
                      console.log('[CAROUSELL] Hid illustration, showing form only');
                    }
                  }
                }, 500);
              })();
              true;
            `}
          />
      </View>
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
  reloadButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Montserrat_600SemiBold',
  },
  debugText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
  },
  webview: {
    flex: 1,
  },
});
