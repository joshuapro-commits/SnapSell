import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { platformService } from '../services/platforms';
import { CustomAlert } from '../components/CustomAlert';

export const FacebookLoginWebView = ({ navigation, route }) => {
  const { userId, isReconnecting } = route.params;
  const webViewRef = useRef(null);
  const [showTimeout, setShowTimeout] = useState(false);
  const hasConnected = useRef(false);
  const hasForcedLogout = useRef(false);
  const [isReadyForNewLogin, setIsReadyForNewLogin] = useState(false);
  const lastUrl = useRef('');
  const timeoutRef = useRef(null);
  const [webViewKey, setWebViewKey] = useState(Date.now());
  const [showConnectButton, setShowConnectButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);
  const loadingTimeoutRef = useRef(null);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const showSuccessAlert = () => {
    setAlertConfig({
      visible: true,
      title: 'Successfully Connected',
      message: 'Your Facebook account has been successfully connected. You can now publish listings directly to Facebook Marketplace.',
      icon: 'checkmark-circle',
      iconColor: '#10B981',
      iconBackground: '#ECFDF5',
      buttons: [{ text: 'OK', onPress: () => setAlertConfig({ ...alertConfig, visible: false }) }],
    });
  };

  React.useEffect(() => {
    const setupWebView = async () => {
      // Reset all state flags when component mounts
      hasConnected.current = false;
      hasForcedLogout.current = false;
      setIsReadyForNewLogin(false);
      lastUrl.current = '';
      
      // Android: Clear cache if available
      if (Platform.OS === 'android' && webViewRef.current) {
        try {
          webViewRef.current.clearCache(true);
          console.log('[WEBVIEW] Android cache cleared');
        } catch (error) {
          console.log('[WEBVIEW] Cache clear not available:', error.message);
        }
      }
      
      // Generate unique key to force fresh WebView instance
      setWebViewKey(`fb-${Platform.OS}-${Date.now()}`);
      setIsReady(true);
      
      console.log('[WEBVIEW] Setup complete - Platform:', Platform.OS, 'isReconnecting:', isReconnecting);
    };
    setupWebView();
  }, [isReconnecting]);

  const handleNavigationStateChange = useCallback(async (navState) => {
    const url = navState.url;
    
    console.log('[WEBVIEW] URL:', url);
    console.log('[WEBVIEW] State - isReconnecting:', isReconnecting, 'hasForcedLogout:', hasForcedLogout.current, 'isReadyForNewLogin:', isReadyForNewLogin, 'hasConnected:', hasConnected.current);
    
    if (url === lastUrl.current) return;
    lastUrl.current = url;
    
    if (hasConnected.current) return;
    
    // Skip logout/checkpoint/recover pages during navigation
    if (url.includes('/logout') || url.includes('/checkpoint') || url.includes('/recover') || url.includes('/reg') || url.includes('?next=')) {
      console.log('[WEBVIEW] Skipping auth/redirect page');
      
      // But if we see checkpoint or login-related pages, we're ready for new login
      if ((url.includes('/checkpoint') || url.includes('/login')) && !isReadyForNewLogin) {
        console.log('[WEBVIEW] STEP 2: Login-related page detected - READY FOR NEW LOGIN');
        setIsReadyForNewLogin(true);
        setShowLogoutPrompt(false);
      }
      return;
    }
    
    // STEP 1: DETECT STALE SESSION (Lock the connection)
    const isStaleSession = (url.includes('/home.php') || url === 'https://www.facebook.com/');
    if (isReconnecting && !hasForcedLogout.current && isStaleSession) {
      console.log('[WEBVIEW] STEP 1: STALE SESSION DETECTED - Forcing hard logout');
      hasForcedLogout.current = true;
      setIsReadyForNewLogin(false); // LOCK - only unlock when we see /login
      setShowLogoutPrompt(true);
      
      if (webViewRef.current) {
        // BRUTE FORCE: Manually delete all cookies and storage
        const hardLogoutJS = `
          (function() {
            window.stop();
            
            // 1. Clear all cookies
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i];
              const eqPos = cookie.indexOf("=");
              const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
              document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.facebook.com";
              document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.m.facebook.com";
              document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            }
            
            // 2. Clear Local Storage and Session Storage
            try {
              localStorage.clear();
              sessionStorage.clear();
            } catch(e) {}
            
            // 3. Clear IndexedDB
            try {
              if (window.indexedDB && window.indexedDB.databases) {
                window.indexedDB.databases().then(dbs => {
                  dbs.forEach(db => window.indexedDB.deleteDatabase(db.name));
                });
              }
            } catch(e) {}
            
            console.log('[WEBVIEW_JS] All cookies and storage cleared');
            
            // 4. Redirect to login page
            window.location.replace('https://www.facebook.com/login/');
          })();
          true;
        `;
        webViewRef.current.injectJavaScript(hardLogoutJS);
      }
      return;
    }
    
    // STEP 2: WAIT FOR LOGIN SCREEN (ONLY place to unlock)
    // Accept ANY login-related page as "ready" (including save-device, checkpoint, etc.)
    const isLoginPage = url.includes('/login') || 
                        url.includes('/checkpoint') || 
                        url.includes('target=account') ||
                        url.includes('/save-device/');
    
    if (isLoginPage && !isReadyForNewLogin) {
      console.log('[WEBVIEW] STEP 2: LOGIN PAGE VISIBLE - User must now type credentials');
      setIsReadyForNewLogin(true); // UNLOCK - This is the ONLY place this becomes true
      setShowLogoutPrompt(false);
      return;
    }
    
    // Auto-click "Not Now" on save-device screen
    if (url.includes('/save-device/') && webViewRef.current) {
      console.log('[WEBVIEW] Auto-clicking Save Device button...');
      setTimeout(() => {
        webViewRef.current?.injectJavaScript(`
          (function() {
            const buttons = document.querySelectorAll('button, a, [role="button"]');
            for (let btn of buttons) {
              const text = btn.textContent.toLowerCase();
              if (text.includes('not now') || text.includes('ok') || text.includes('continue')) {
                console.log('[WEBVIEW_JS] Clicking:', btn.textContent);
                btn.click();
                break;
              }
            }
          })();
          true;
        `);
      }, 800);
    }
    
    // STEP 3: VALIDATE REAL FRESH LOGIN (including save-device as success)
    const isLoggedIn = 
      url.includes('/save-device/') || // Post-login intermediate screen = SUCCESS
      ((url.includes('facebook.com') && !url.includes('/login')) &&
       (url.includes('/marketplace') || url.includes('/home.php') || url === 'https://www.facebook.com/' || url.includes('/profile')));
    
    if (isLoggedIn) {
      console.log('[WEBVIEW] SUCCESS PAGE DETECTED:', url);
      
      // Only connect if:
      // - Not reconnecting (first time), OR
      // - Reconnecting AND ready for new login (saw login screen)
      const canConnect = !isReconnecting || (isReconnecting && isReadyForNewLogin);
      
      if (canConnect && !hasConnected.current) {
        console.log('[WEBVIEW] STEP 3: REAL FRESH LOGIN VALIDATED - Connecting');
        hasConnected.current = true;
        setShowConnectButton(false);
        setShowLogoutPrompt(false);
        
        // If on save-device, navigate to home before connecting
        if (url.includes('/save-device/') && webViewRef.current) {
          console.log('[WEBVIEW] Navigating from save-device to home...');
          webViewRef.current.injectJavaScript(`
            window.location.href = 'https://www.facebook.com/';
            true;
          `);
        }
        
        const result = await platformService.connectFacebook(userId);
        
        if (result.success) {
          // CRITICAL: Wait 3 seconds for iOS to flush cookies to disk
          console.log('[WEBVIEW] Waiting for iOS to write cookies to disk...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          navigation.goBack();
          setTimeout(showSuccessAlert, 300);
        }
      } else {
        console.log('[WEBVIEW] Blocking connection - not ready for new login yet (isReadyForNewLogin:', isReadyForNewLogin, ')');
      }
    }
  }, [userId, navigation, isReconnecting, isReadyForNewLogin]);

  const handleManualConnect = async () => {
    if (hasConnected.current) return;
    
    hasConnected.current = true;
    setShowConnectButton(false);
    
    const result = await platformService.connectFacebook(userId);
    
    if (result.success) {
      // Add delay to allow iOS to flush cookies to disk
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigation.goBack();
      setTimeout(showSuccessAlert, 300);
    }
  };

  const handleWebViewMessage = useCallback(async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('[WEBVIEW] Message received:', data);
      
      // Handle RE_CHECK_LOGIN or LOGIN_CHECK with save-device URL
      if (data.type === 'RE_CHECK_LOGIN' || data.type === 'LOGIN_CHECK') {
        const isSaveDevicePage = data.url && data.url.includes('/save-device/');
        const isLoggedInPage = data.isLoggedIn || isSaveDevicePage;
        
        console.log('[WEBVIEW] Message check - isLoggedIn:', data.isLoggedIn, 'isSaveDevice:', isSaveDevicePage);
        
        // If gate is open and we're logged in (or on save-device), connect!
        if (isReadyForNewLogin && !hasConnected.current && isLoggedInPage) {
          console.log('[WEBVIEW] MESSAGE SUCCESS: Connecting now');
          hasConnected.current = true;
          setShowConnectButton(false);
          setShowLogoutPrompt(false);
          
          const result = await platformService.connectFacebook(userId);
          
          if (result.success) {
            // Add delay to allow iOS to flush cookies to disk
            await new Promise(resolve => setTimeout(resolve, 1000));
            navigation.goBack();
            setTimeout(showSuccessAlert, 300);
          }
        }
        return;
      }
    } catch (error) {
      console.log('[WEBVIEW] Message error:', error);
    }
  }, [userId, navigation, isReconnecting, isReadyForNewLogin]);

  const handleLoadEnd = useCallback(() => {
    console.log('[WEBVIEW] Load ended');
    setIsLoading(false);
    
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        (function() {
          const currentUrl = window.location.href;
          const isLoginPage = currentUrl.includes('/login');
          const isSaveDevicePage = currentUrl.includes('/save-device/');
          const hasSession = document.cookie.includes('c_user=') || 
                            document.querySelector('[data-sigil="m-profile-header"]') !== null ||
                            document.querySelector('[data-sigil="MTopBlueBarHeader"]') !== null;
          
          // Save-device page = logged in
          if (isSaveDevicePage) {
            console.log('[WEBVIEW_JS] On save-device page - reporting logged in');
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'LOGIN_CHECK',
              isLoggedIn: true,
              url: currentUrl
            }));
          }
          // If on login page, DO NOT report logged in even if cookie exists (stale cookie)
          else if (isLoginPage) {
            console.log('[WEBVIEW_JS] On login page - reporting NOT logged in');
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'LOGIN_CHECK',
              isLoggedIn: false
            }));
          } else if (hasSession) {
            console.log('[WEBVIEW_JS] Session detected - reporting logged in');
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'LOGIN_CHECK',
              isLoggedIn: true
            }));
          } else {
            console.log('[WEBVIEW_JS] No session - reporting NOT logged in');
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'LOGIN_CHECK',
              isLoggedIn: false
            }));
          }
        })();
        true;
      `);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connect Facebook</Text>
        <View style={{ width: 24 }} />
      </View>

      {!isReady ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1877F2" />
          <Text style={styles.loadingText}>Preparing login...</Text>
        </View>
      ) : (
        <>
          <View style={styles.instructionsBanner}>
            <Ionicons name="information-circle" size={20} color="#1877F2" />
            <Text style={styles.instructionsText}>
              {showLogoutPrompt 
                ? 'Clearing old session...' 
                : 'Log in to Facebook to connect your account'}
            </Text>
          </View>
        </>
      )}

      {isReady && (
        <WebView
          key={webViewKey}
          ref={webViewRef}
          source={{ uri: 'https://www.facebook.com/login/' }}
          onNavigationStateChange={handleNavigationStateChange}
          onMessage={handleWebViewMessage}
          onLoadEnd={handleLoadEnd}
          onLoadStart={() => {
            console.log('[WEBVIEW] Load started');
            setIsLoading(true);
            
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
            }
            loadingTimeoutRef.current = setTimeout(() => {
              console.log('[WEBVIEW] Loading timeout');
              setShowTimeout(true);
              setIsLoading(false);
            }, 15000);
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.log('[WEBVIEW] Error:', nativeEvent);
            
            // Android: If error during logout, manually navigate to login
            if (Platform.OS === 'android' && hasForcedLogout.current && !isReadyForNewLogin) {
              console.log('[WEBVIEW] Android error during logout - manually navigating to login');
              setTimeout(() => {
                if (webViewRef.current) {
                  webViewRef.current.injectJavaScript(`
                    window.location.href = 'https://www.facebook.com/login/';
                    true;
                  `);
                }
              }, 1000);
              return;
            }
            
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
            }
            setShowTimeout(true);
            setIsLoading(false);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.log('[WEBVIEW] HTTP Error:', nativeEvent.statusCode, nativeEvent.url);
            
            // Android: Handle redirect errors during logout
            if (Platform.OS === 'android' && hasForcedLogout.current && !isReadyForNewLogin) {
              console.log('[WEBVIEW] Android HTTP error during logout - recovering');
              setTimeout(() => {
                if (webViewRef.current) {
                  webViewRef.current.injectJavaScript(`
                    window.location.href = 'https://www.facebook.com/login/';
                    true;
                  `);
                }
              }, 1000);
            }
          }}
          startInLoadingState={false}
          incognito={false}
          // Android Strategy: Aggressive cache control
          cacheEnabled={false}
          cacheMode={Platform.OS === 'android' ? 'LOAD_NO_CACHE' : undefined}
          // Shared props
          sharedCookiesEnabled={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          thirdPartyCookiesEnabled={true}
          setSupportMultipleWindows={false}
          originWhitelist={['*']}
          userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          style={styles.webview}
          mixedContentMode="always"
          allowsInlineMediaPlayback={true}
        />
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1877F2" />
          <Text style={styles.loadingText}>Loading Facebook...</Text>
        </View>
      )}

      {showTimeout && (
        <View style={styles.loadingOverlay}>
          <Ionicons name="alert-circle" size={48} color="#FF6B35" />
          <Text style={styles.loadingText}>Connection Issue</Text>
          <Text style={styles.loadingSubtext}>Facebook is taking longer than usual</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              console.log('[WEBVIEW] Reload');
              setShowTimeout(false);
              setIsLoading(true);
              webViewRef.current?.reload();
            }}
          >
            <Text style={styles.retryButtonText}>Reload Page</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: '#666', marginTop: 10 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
        iconBackground={alertConfig.iconBackground}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
    color: '#000',
  },
  instructionsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  instructionsText: {
    flex: 1,
    fontSize: 13,
    color: '#1877F2',
    fontFamily: 'Montserrat_500Medium',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#000',
    fontFamily: 'Montserrat_600SemiBold',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 13,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#1877F2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  manualConnectContainer: {
    padding: 16,
    backgroundColor: '#F0F8FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  manualConnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  manualConnectText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
});
