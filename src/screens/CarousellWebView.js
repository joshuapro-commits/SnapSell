import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { storageService } from '../services/storage';
import { useCarousellWebView } from '../contexts/CarousellWebViewContext';

// Mobile User Agent - ensures Carousell serves mobile-optimized layout
// Using iPhone Safari to get the best mobile experience
const USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

// Viewport injection - forces correct mobile scaling
const VIEWPORT_INJECTION = `
  (function() {
    // Remove any existing viewport meta tags
    const existingMeta = document.querySelector('meta[name="viewport"]');
    if (existingMeta) {
      existingMeta.remove();
    }
    
    // Inject correct mobile viewport
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'viewport');
    meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
    document.getElementsByTagName('head')[0].appendChild(meta);
    
    console.log('[CAROUSELL_VIEWPORT] Mobile viewport injected');
  })();
`;

// Cookie extraction script - runs after successful login
const COOKIE_EXTRACTION_SCRIPT = `
  (function() {
    const cookies = document.cookie;
    const url = window.location.href;
    
    // Check for session indicators
    const hasSessionCookie = cookies.includes('session=') || 
                            cookies.includes('access_token=') ||
                            cookies.includes('auth_token=') ||
                            cookies.includes('user_id=');
    
    // Check for logged-in UI elements
    const avatar = document.querySelector('[data-testid="nav-avatar"]') ||
                   document.querySelector('button[aria-label*="Profile"]') ||
                   document.querySelector('a[href*="/profile/"]');
    
    const loginButton = document.querySelector('a[href*="/login"]');
    const isLoggedIn = hasSessionCookie && avatar && !loginButton;
    
    console.log('[CAROUSELL_SESSION] Cookie check:', {
      url: url,
      hasSessionCookie: hasSessionCookie,
      hasAvatar: !!avatar,
      hasLoginButton: !!loginButton,
      isLoggedIn: isLoggedIn,
      cookieCount: cookies.split(';').length
    });
    
    if (isLoggedIn) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'SESSION_ESTABLISHED',
        cookies: cookies,
        url: url
      }));
    }
  })();
  true;
`;

// Session verification script - checks if user is still logged in
const SESSION_VERIFICATION_SCRIPT = `
  (function() {
    const cookies = document.cookie;
    const url = window.location.href;
    
    const hasSessionCookie = cookies.includes('session=') || 
                            cookies.includes('access_token=') ||
                            cookies.includes('auth_token=');
    
    const avatar = document.querySelector('[data-testid="nav-avatar"]') ||
                   document.querySelector('button[aria-label*="Profile"]') ||
                   document.querySelector('a[href*="/profile/"]');
    
    const loginButton = document.querySelector('a[href*="/login"]');
    const isOnLoginPage = url.includes('/login');
    
    const isLoggedIn = hasSessionCookie && avatar && !loginButton && !isOnLoginPage;
    
    console.log('[CAROUSELL_VERIFY] Session status:', {
      isLoggedIn: isLoggedIn,
      hasSessionCookie: hasSessionCookie,
      hasAvatar: !!avatar,
      isOnLoginPage: isOnLoginPage
    });
    
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'SESSION_VERIFIED',
      isLoggedIn: isLoggedIn,
      url: url
    }));
  })();
  true;
`;

// Auto-fill listing script - Semi-Auto approach (user taps final submit)
const getAutoFillScript = (listingData) => `
  (function() {
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const randomDelay = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Human-like typing simulation
    async function humanType(element, text) {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      ).set || Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
      ).set;
      
      element.focus();
      await wait(randomDelay(200, 400));
      
      let currentValue = '';
      for (let i = 0; i < text.length; i++) {
        currentValue += text[i];
        nativeSetter.call(element, currentValue);
        element.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Variable typing speed (40-120ms per character)
        await wait(randomDelay(40, 120));
        
        // Occasional pause (simulates thinking)
        if (i > 0 && i % 15 === 0 && Math.random() < 0.3) {
          await wait(randomDelay(300, 600));
        }
      }
      
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.blur();
    }
    
    // Find input by label text
    function findFieldByLabel(labelText) {
      const labels = Array.from(document.querySelectorAll('label, span, div'));
      for (const label of labels) {
        const text = label.textContent.trim().toLowerCase();
        if (text.includes(labelText.toLowerCase())) {
          let parent = label.parentElement;
          for (let i = 0; i < 5; i++) {
            if (!parent) break;
            const input = parent.querySelector('input, textarea');
            if (input) return input;
            parent = parent.parentElement;
          }
        }
      }
      return null;
    }
    
    // Select dropdown option
    async function selectDropdown(labelText, optionText) {
      const labels = Array.from(document.querySelectorAll('label, span, div'));
      for (const label of labels) {
        const text = label.textContent.trim().toLowerCase();
        if (text.includes(labelText.toLowerCase())) {
          let parent = label.parentElement;
          for (let i = 0; i < 5; i++) {
            if (!parent) break;
            const trigger = parent.querySelector('button, [role="button"], select, [role="combobox"]');
            if (trigger) {
              trigger.click();
              await wait(randomDelay(800, 1200));
              
              const options = Array.from(document.querySelectorAll('[role="option"], option, li'));
              for (const option of options) {
                if (option.textContent.trim().toLowerCase().includes(optionText.toLowerCase())) {
                  option.click();
                  await wait(randomDelay(400, 600));
                  return true;
                }
              }
              return false;
            }
            parent = parent.parentElement;
          }
        }
      }
      return false;
    }
    
    async function fillForm() {
      try {
        console.log('[CAROUSELL_AUTO] Starting form fill...');
        
        // Wait for page to fully load
        await wait(randomDelay(2000, 3000));
        
        // 1. Fill Title
        const titleInput = findFieldByLabel('title') || 
                          document.querySelector('input[placeholder*="title" i]');
        if (titleInput) {
          console.log('[CAROUSELL_AUTO] Filling title...');
          await humanType(titleInput, ${JSON.stringify(listingData.title)});
          await wait(randomDelay(1000, 1500));
        }
        
        // 2. Select Category
        if (${JSON.stringify(listingData.category)}) {
          console.log('[CAROUSELL_AUTO] Selecting category...');
          await selectDropdown('category', ${JSON.stringify(listingData.category)});
          await wait(randomDelay(1000, 1500));
        }
        
        // 3. Select Condition
        if (${JSON.stringify(listingData.condition)}) {
          console.log('[CAROUSELL_AUTO] Selecting condition...');
          await selectDropdown('condition', ${JSON.stringify(listingData.condition)});
          await wait(randomDelay(1000, 1500));
        }
        
        // 4. Fill Price
        const priceInput = findFieldByLabel('price') || 
                          document.querySelector('input[type="number"]');
        if (priceInput) {
          console.log('[CAROUSELL_AUTO] Filling price...');
          await humanType(priceInput, ${JSON.stringify(String(listingData.price))});
          await wait(randomDelay(1000, 1500));
        }
        
        // 5. Fill Description
        const descInput = findFieldByLabel('description') || 
                         document.querySelector('textarea');
        if (descInput) {
          console.log('[CAROUSELL_AUTO] Filling description...');
          await humanType(descInput, ${JSON.stringify(listingData.description)});
          await wait(randomDelay(1000, 1500));
        }
        
        console.log('[CAROUSELL_AUTO] Form filled successfully!');
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'FORM_FILLED',
          success: true
        }));
        
      } catch (error) {
        console.error('[CAROUSELL_AUTO] Error:', error);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'FORM_FILLED',
          success: false,
          error: error.message
        }));
      }
    }
    
    fillForm();
  })();
  true;
`;

export const CarousellWebView = ({ navigation, route }) => {
  const { mode, userId, region, listingData } = route.params || {};
  const { 
    showWebView, 
    hideWebView, 
    registerMessageHandler, 
    unregisterMessageHandler,
    registerNavigationHandler,
    unregisterNavigationHandler,
    injectJavaScript,
    reload,
    isPrewarmed,
    currentUrl,
  } = useCarousellWebView();
  
  // CRITICAL: State locks to prevent infinite loops - these NEVER trigger re-renders
  const isVerifying = useRef(false);
  const hasExtractedCookies = useRef(false);
  const hasVerifiedSession = useRef(false);
  const hasFinishedLogin = useRef(false);
  const hasInitialized = useRef(false);
  const loadingTimeoutRef = useRef(null);
  
  // UI state only - minimal re-renders
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(!isPrewarmed);
  const [autoFillReady, setAutoFillReady] = useState(false);
  const [formFilled, setFormFilled] = useState(false);
  
  const domain = region?.domain || 'carousell.sg';
  const secureStoreKey = `carousell_session_${userId}_${region?.id || 'sg'}`;
  
  // Remove initialUrl - using singleton WebView
  // Remove handleLoadStart, handleLoadEnd, handleHttpError - handled by singleton
  // Remove handleShouldStartLoadWithRequest - handled by singleton
  
  console.log('[CAROUSELL_MOUNT] Component mounted with mode:', mode, 'domain:', domain);
  console.log('[CAROUSELL_MOUNT] Pre-warmed status:', isPrewarmed ? '✅ INSTANT LOAD' : '⏳ Warming...');
  
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    console.log('[CAROUSELL_INIT] 🚀 Using singleton WebView for instant load');
    console.log('[CAROUSELL_INIT] Domain:', domain);
    
    // Register handlers for this screen
    registerMessageHandler(handleMessage);
    registerNavigationHandler(handleNavigationStateChange);
    
    // Show the singleton WebView with mode parameter
    showWebView(domain, mode);
    
    // Hide loading overlay if already pre-warmed
    if (isPrewarmed) {
      console.log('[CAROUSELL_INIT] ⚡ WebView pre-warmed, instant display!');
      setShowLoadingOverlay(false);
    } else {
      loadingTimeoutRef.current = setTimeout(() => {
        console.log('[CAROUSELL_TIMEOUT] Forcing overlay hide');
        setShowLoadingOverlay(false);
      }, 10000);
    }
    
    if (mode === 'sell') {
      checkExistingSession();
    }
    
    return () => {
      console.log('[CAROUSELL_CLEANUP] Unregistering handlers and hiding WebView');
      unregisterMessageHandler();
      unregisterNavigationHandler();
      hideWebView();
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);
  
  const checkExistingSession = async () => {
    try {
      const savedSession = await loadSession();
      if (!savedSession) {
        console.log('[CAROUSELL_INIT] No session found, redirecting to login...');
        Alert.alert(
          'Session Required',
          'Please connect your Carousell account first.',
          [
            {
              text: 'Connect Now',
              onPress: () => navigation.replace('CarousellWebView', {
                mode: 'login',
                userId,
                region
              })
            },
            { text: 'Cancel', onPress: () => navigation.goBack() }
          ]
        );
      } else {
        console.log('[CAROUSELL_INIT] Found saved session');
      }
    } catch (error) {
      console.error('[CAROUSELL_INIT] Error:', error);
    }
  };
  
  // Load session from SecureStore
  const loadSession = async () => {
    try {
      const sessionData = await SecureStore.getItemAsync(secureStoreKey);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        console.log('[CAROUSELL_SESSION] Loaded session:', {
          domain: session.domain,
          cookieCount: session.cookies?.split(';').length || 0,
          savedAt: session.savedAt
        });
        return session;
      }
      return null;
    } catch (error) {
      console.error('[CAROUSELL_SESSION] Load error:', error);
      return null;
    }
  };
  
  // Save session to SecureStore with Android cookie flush
  const saveSession = async (cookies) => {
    try {
      const sessionData = {
        domain: domain,
        cookies: cookies,
        savedAt: new Date().toISOString()
      };
      
      await SecureStore.setItemAsync(secureStoreKey, JSON.stringify(sessionData));
      console.log('[CAROUSELL_SESSION] Session saved to SecureStore');
      
      // CRITICAL: Force Android to flush cookies immediately (not on 5-min cycle)
      if (Platform.OS === 'android') {
        console.log('[CAROUSELL_SESSION] Flushing cookies on Android...');
        // Note: With sharedCookiesEnabled={true}, cookies are automatically synced
        // Additional manual flush can be done with @react-native-cookies/cookies if needed
        // For now, relying on native WebView cookie management
      }
      
      return true;
    } catch (error) {
      console.error('[CAROUSELL_SESSION] Save error:', error);
      return false;
    }
  };
  
  // Clear session
  const clearSession = async () => {
    try {
      await SecureStore.deleteItemAsync(secureStoreKey);
      await storageService.removePlatformToken(userId, 'carousell');
      console.log('[CAROUSELL_SESSION] Session cleared');
    } catch (error) {
      console.error('[CAROUSELL_SESSION] Clear error:', error);
    }
  };
  
  // Handle navigation state changes
  const handleNavigationStateChange = (navState) => {
    const { url, loading } = navState;
    
    console.log('[CAROUSELL_NAV]', {
      url: url.substring(0, 80),
      loading: loading,
      mode: mode,
    });
    
    // Skip about: URLs
    if (url.includes('about:')) return;
    
    // Only proceed when page fully loaded
    if (loading) return;
    
    // Detect successful login - ONLY ONCE
    if (mode === 'login' && !hasFinishedLogin.current) {
      const isCarousellDomain = url.includes(domain);
      const isLoginPage = url.includes('/login');
      const isSignupPage = url.includes('/signup');
      
      // Normalize URL - handle trailing slashes
      const normalizedUrl = url.replace(/\/$/, '');
      const isHomepage = normalizedUrl === `https://www.${domain}` || 
                        normalizedUrl === `https://${domain}` ||
                        url.includes('/profile');
      
      if (isCarousellDomain && isHomepage && !isLoginPage && !isSignupPage) {
        console.log('[CAROUSELL_NAV] ✅ Login success detected');
        hasFinishedLogin.current = true;
        
        setTimeout(() => {
          if (!hasExtractedCookies.current) {
            console.log('[CAROUSELL_NAV] Extracting cookies...');
            hasExtractedCookies.current = true;
            injectJavaScript(COOKIE_EXTRACTION_SCRIPT);
          }
        }, 2000);
      }
    }
    
    // Detect sell page
    if (mode === 'sell' && url.includes('/sell/') && !hasVerifiedSession.current) {
      console.log('[CAROUSELL_NAV] ✅ On sell page, verifying session...');
      hasVerifiedSession.current = true;
      
      setTimeout(() => {
        injectJavaScript(SESSION_VERIFICATION_SCRIPT);
      }, 2000);
    }
    
    // Detect successful listing
    if (mode === 'sell' && url.match(/\/p\/[\w-]+-\d+/)) {
      console.log('[CAROUSELL_NAV] ✅ Listing published!');
      handleListingSuccess(url);
    }
  };
  
  // Handle WebView messages
  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('[CAROUSELL_MSG]', data.type);
      
      switch (data.type) {
        case 'SESSION_ESTABLISHED':
          // Hide loading overlay
          setShowLoadingOverlay(false);
          
          saveSession(data.cookies).then(async (saved) => {
            if (saved) {
              // Save connection to platform tokens
              const connectionData = {
                connected: true,
                connectedAt: new Date().toISOString(),
                userName: 'Carousell User',
                region: region.id,
                regionName: region.name,
                domain: domain,
              };
              
              await storageService.savePlatformToken(userId, 'carousell', connectionData);
              console.log('[CAROUSELL_MSG] Connection saved to platform tokens:', connectionData);
              
              Alert.alert(
                'Connected Successfully',
                `Your Carousell ${region.name} account is now connected!\n\nYou can now publish listings to Carousell.`,
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack()
                  }
                ]
              );
            }
          });
          break;
          
        case 'SESSION_VERIFIED':
          if (data.isLoggedIn) {
            console.log('[CAROUSELL_MSG] ✅ Session verified');
            setAutoFillReady(true);
            setShowLoadingOverlay(false);
          } else {
            console.log('[CAROUSELL_MSG] ❌ Session expired');
            await clearSession();
            Alert.alert(
              'Session Expired',
              'Your Carousell session has expired. Please reconnect.',
              [
                {
                  text: 'Reconnect',
                  onPress: () => navigation.replace('CarousellWebView', {
                    mode: 'login',
                    userId,
                    region
                  })
                },
                { text: 'Cancel', onPress: () => navigation.goBack() }
              ]
            );
          }
          break;
          
        case 'FORM_FILLED':
          if (data.success) {
            setFormFilled(true);
            Alert.alert(
              '✅ Form Filled',
              'Review your listing and tap "List Now" to publish.',
              [{ text: 'OK' }]
            );
          } else {
            Alert.alert(
              'Auto-Fill Failed',
              'Please fill the form manually.',
              [{ text: 'OK' }]
            );
          }
          break;
      }
    } catch (error) {
      console.error('[CAROUSELL_MSG] Error:', error);
    }
  };
  
  // Handle successful listing
  const handleListingSuccess = (listingUrl) => {
    Alert.alert(
      'Published Successfully',
      'Your listing is now live on Carousell!',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('ListingSuccess', {
            productName: listingData?.title || 'Product',
            selectedPlatforms: { carousell: true },
            publishResults: {
              carousell: {
                success: true,
                listingUrl: listingUrl
              }
            }
          })
        }
      ]
    );
  };
  
  // Auto-fill listing form
  const handleAutoFill = () => {
    if (!listingData || formFilled) return;
    
    const autoFillData = {
      title: listingData.name || listingData.title || '',
      price: listingData.suggestedPrice || listingData.price || 0,
      description: listingData.descriptions?.carousell || listingData.description || '',
      category: listingData.category || 'Electronics',
      condition: listingData.condition || 'Used - Good'
    };
    
    console.log('[CAROUSELL_AUTO] Starting auto-fill with:', autoFillData);
    injectJavaScript(getAutoFillScript(autoFillData));
  };
  
  const handleReload = () => {
    console.log('[CAROUSELL_UI] Manual reload triggered');
    reload();
  };
  
  const getHeaderTitle = () => {
    if (mode === 'login') return `Connect Carousell ${region?.name || ''}`;
    if (mode === 'sell') return 'Publish to Carousell';
    return 'Carousell';
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* StatusBar Configuration - Forces Android to draw below status bar */}
      <StatusBar 
        translucent={false} 
        backgroundColor="#FFF" 
        barStyle="dark-content" 
      />
      
      {/* Custom Header - Fixed height with strict stacking context */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color="#000" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        
        <View style={styles.headerRight}>
          {mode === 'sell' && autoFillReady && !formFilled && (
            <TouchableOpacity
              style={styles.autoFillButton}
              onPress={handleAutoFill}
            >
              <Ionicons name="flash" size={18} color="#FFF" />
              <Text style={styles.autoFillText}>Fill</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleReload}
          >
            <Ionicons name="refresh" size={22} color="#D32F2F" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* WebView Container - Just a placeholder, actual WebView rendered by context */}
      <View style={styles.webviewContainer}>
        {/* Loading overlay */}
        {showLoadingOverlay && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#D32F2F" />
            <Text style={styles.loadingText}>
              {isPrewarmed ? 'Loading...' : 'Pre-warming Carousell...'}
            </Text>
            {!isPrewarmed && (
              <Text style={styles.loadingSubtext}>First load optimized for speed</Text>
            )}
          </View>
        )}
        
        {/* Singleton WebView rendered by CarousellWebViewProvider */}
        {/* This container is just a spacer - WebView is absolutely positioned */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    // Android: Ensure proper padding below status bar
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    height: 60,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    // CRITICAL: Strict stacking context for Android
    zIndex: 10,
    elevation: 10, // Android requires elevation to stay above WebView
    position: 'relative', // Ensures z-index works
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  webviewContainer: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },
  autoFillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D32F2F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  autoFillText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  loadingSubtext: {
    marginTop: 8,
    fontSize: 13,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
});
