import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';

// Use iOS Safari User Agent for both platforms to ensure consistent login options
// Carousell serves different login options based on User Agent
// iOS Safari UA gets Google Sign-In, Android Chrome UA does not
const USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

// Viewport injection + Cookie banner removal + UA verification
const PREWARM_INJECTION = `
  (function() {
    // Log User Agent for debugging
    console.log('[PREWARM] User Agent:', navigator.userAgent);
    
    // Inject mobile viewport
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'viewport');
    meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
    document.getElementsByTagName('head')[0].appendChild(meta);
    
    // Hide cookie consent banners and "Open in App" popups
    const hideAnnoyances = () => {
      // Cookie consent selectors
      const selectors = [
        '[class*="cookie"]',
        '[class*="consent"]',
        '[class*="banner"]',
        '[id*="cookie"]',
        '[id*="consent"]',
        '[class*="modal"]',
        '[class*="popup"]',
        '[class*="overlay"]',
        'div[role="dialog"]',
        '[class*="app-download"]',
        '[class*="download-app"]'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const text = el.textContent.toLowerCase();
          if (text.includes('cookie') || 
              text.includes('consent') || 
              text.includes('open in app') ||
              text.includes('download app')) {
            el.style.display = 'none';
            console.log('[PREWARM] Hidden annoyance:', selector);
          }
        });
      });
    };
    
    // Run immediately and after DOM loads
    hideAnnoyances();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', hideAnnoyances);
    }
    
    // Run periodically to catch dynamically added popups
    setInterval(hideAnnoyances, 2000);
    
    console.log('[PREWARM] Carousell pre-warming initialized');
  })();
`;

// Aggressive resource blocker with OAuth whitelist
const RESOURCE_BLOCKLIST = [
  // Analytics & Tracking (but NOT OAuth)
  'googletagmanager',
  'google-analytics',
  'doubleclick',
  'adservice',
  'analytics.js',
  'tracking',
  'telemetry',
  'metrics',
  
  // Social Media Trackers (but NOT OAuth)
  'facebook.com/tr',
  'fbevents',
  
  // Ad Networks
  'criteo',
  'adtrafficquality',
  'advertising',
  'adsystem',
  'adnxs',
  'pubmatic',
  'googlesyndication',
  'googleadservices',
  
  // Third-party Services
  'segment.io',
  'mixpanel',
  'hotjar',
  'clarity.ms',
  'newrelic',
  'sentry.io',
  'bugsnag',
  'amplitude',
  'heap',
  'fullstory',
  
  // CDN Trackers
  'cdn.segment',
  'cdn.mxpnl',
  'static.criteo',
];

// Whitelist for OAuth and authentication services
const OAUTH_WHITELIST = [
  'accounts.google.com',
  'oauth.googleusercontent.com',
  'gstatic.com/firebasejs',
  'apis.google.com',
  'accounts.facebook.com',
  'facebook.com/login',
  'facebook.com/v',
  'connect.facebook.net',
  'graph.facebook.com',
];

const CarousellWebViewContext = createContext(null);

export const CarousellWebViewProvider = ({ children }) => {
  const webViewRef = useRef(null);
  const messageHandlerRef = useRef(null);
  const navigationHandlerRef = useRef(null);
  const [isPrewarmed, setIsPrewarmed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentDomain, setCurrentDomain] = useState('carousell.sg');
  const [currentUrl, setCurrentUrl] = useState('');
  
  useEffect(() => {
    console.log('[PREWARM_MANAGER] 🚀 Singleton WebView initializing...');
    console.log('[PREWARM_MANAGER] Platform:', Platform.OS);
    console.log('[PREWARM_MANAGER] User Agent: iOS Safari (consistent across platforms)');
    console.log('[PREWARM_MANAGER] Pre-warming Carousell in background...');
  }, []);
  
  const shouldBlockRequest = (url) => {
    // CRITICAL: Allow internal iOS/Android URLs
    if (url.startsWith('about:') || 
        url.startsWith('blob:') || 
        url.startsWith('data:')) {
      return true;
    }
    
    // CRITICAL: Whitelist OAuth and authentication services
    const isOAuthUrl = OAUTH_WHITELIST.some(whitelisted => 
      url.toLowerCase().includes(whitelisted.toLowerCase())
    );
    
    if (isOAuthUrl) {
      console.log('[PREWARM_OAUTH_ALLOWED]', url.substring(0, 60));
      return true;
    }
    
    // Block analytics and trackers
    const shouldBlock = RESOURCE_BLOCKLIST.some(blocked => 
      url.toLowerCase().includes(blocked.toLowerCase())
    );
    
    if (shouldBlock) {
      console.log('[PREWARM_BLOCKED]', url.substring(0, 60));
      return false;
    }
    
    return true;
  };
  
  const handleLoadEnd = () => {
    console.log('[PREWARM_MANAGER] ✅ Pre-warming complete for', currentDomain);
    console.log('[PREWARM_MANAGER] WebView ready for instant display');
    setIsPrewarmed(true);
  };
  
  const handleLoadStart = () => {
    console.log('[PREWARM_MANAGER] 🔄 Loading:', currentDomain);
  };
  
  const handleNavigationStateChange = (navState) => {
    setCurrentUrl(navState.url);
    if (navigationHandlerRef.current) {
      navigationHandlerRef.current(navState);
    }
  };
  
  const handleMessage = (event) => {
    if (messageHandlerRef.current) {
      messageHandlerRef.current(event);
    }
  };
  
  const showWebView = (domain = 'carousell.sg', mode = 'login') => {
    console.log('[PREWARM_MANAGER] 👁️ Showing WebView for', domain, 'mode:', mode);
    console.log('[PREWARM_MANAGER] 📱 Platform:', Platform.OS);
    console.log('[PREWARM_MANAGER] 📏 StatusBar height:', StatusBar.currentHeight);
    
    const targetUrl = mode === 'login' 
      ? `https://www.${domain}/login/` 
      : `https://www.${domain}`;
    
    console.log('[PREWARM_MANAGER] 🧭 Target URL:', targetUrl);
    
    // Always navigate to target URL when showing WebView
    if (domain !== currentDomain) {
      console.log('[PREWARM_MANAGER] 🔄 Domain changed, forcing reload');
      setCurrentDomain(domain);
      setIsPrewarmed(false);
      
      // Force reload when domain changes
      setIsVisible(true);
      setTimeout(() => {
        console.log('[PREWARM_MANAGER] 🔄 Reloading WebView for domain change');
        webViewRef.current?.reload();
        
        // Navigate after reload
        setTimeout(() => {
          console.log('[PREWARM_MANAGER] 🚀 Navigating to:', targetUrl);
          webViewRef.current?.injectJavaScript(`
            console.log('[WEBVIEW_INJECT] Navigating to: ${targetUrl}');
            window.location.href='${targetUrl}';
            true;
          `);
        }, 500);
      }, 100);
    } else {
      // Same domain, just navigate
      setIsVisible(true);
      console.log('[PREWARM_MANAGER] ✅ WebView visibility set to TRUE');
      
      setTimeout(() => {
        console.log('[PREWARM_MANAGER] 🚀 Navigating to:', targetUrl);
        webViewRef.current?.injectJavaScript(`
          console.log('[WEBVIEW_INJECT] Navigating to: ${targetUrl}');
          window.location.href='${targetUrl}';
          true;
        `);
      }, 100);
    }
  };
  
  const hideWebView = () => {
    console.log('[PREWARM_MANAGER] 🙈 Hiding WebView');
    setIsVisible(false);
  };
  
  const getWebViewRef = () => webViewRef;
  
  const registerMessageHandler = (handler) => {
    messageHandlerRef.current = handler;
  };
  
  const unregisterMessageHandler = () => {
    messageHandlerRef.current = null;
  };
  
  const registerNavigationHandler = (handler) => {
    navigationHandlerRef.current = handler;
  };
  
  const unregisterNavigationHandler = () => {
    navigationHandlerRef.current = null;
  };
  
  const injectJavaScript = (script) => {
    webViewRef.current?.injectJavaScript(script);
  };
  
  const reload = () => {
    console.log('[PREWARM_MANAGER] 🔄 Reloading WebView');
    webViewRef.current?.reload();
  };
  
  const navigateToUrl = (url) => {
    console.log('[PREWARM_MANAGER] 🧭 Navigating to:', url);
    webViewRef.current?.injectJavaScript(`window.location.href='${url}';true;`);
  };
  
  return (
    <CarousellWebViewContext.Provider 
      value={{ 
        showWebView, 
        hideWebView, 
        getWebViewRef,
        registerMessageHandler,
        unregisterMessageHandler,
        registerNavigationHandler,
        unregisterNavigationHandler,
        injectJavaScript,
        reload,
        navigateToUrl,
        isPrewarmed,
        isVisible,
        currentUrl,
      }}
    >
      {children}
      
      {/* Singleton Pre-warmed WebView - Always mounted, visibility controlled */}
      {/* CRITICAL: Absolutely positioned overlay that renders OVER the screen */}
      <View 
        style={[
          styles.prewarmContainer,
          isVisible ? styles.visible : styles.hidden
        ]}
      >
        {/* Add top margin to push WebView below the screen's header */}
        {/* The screen renders: SafeAreaView + StatusBar + Header (60px) */}
        <View style={{
          marginTop: 60, // Just the header height - screen handles status bar
          flex: 1,
          backgroundColor: '#FFF',
        }}>
          <WebView
            ref={webViewRef}
            source={{ uri: `https://www.${currentDomain}` }}
            userAgent={USER_AGENT}
            
            // JavaScript & Storage
            javaScriptEnabled={true}
            domStorageEnabled={true}
            
            // Cookie & Session Management (CRITICAL for iOS)
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
            incognito={false}
            
            // Caching (CRITICAL)
            cacheEnabled={true}
            cacheMode="LOAD_DEFAULT"
            
            // Android Hardware Acceleration
            androidLayerType="hardware"
            androidHardwareAccelerationDisabled={false}
            
            // iOS Optimizations
            allowsInlineMediaPlayback={true}
            allowsBackForwardNavigationGestures={true}
            
            // Media Optimization
            setSupportMultipleWindows={false}
            mediaPlaybackRequiresUserAction={true}
            javaScriptCanOpenWindowsAutomatically={false}
            
            // Security
            originWhitelist={['*']}
            
            // CRITICAL: Use injectedJavaScriptBeforeContentLoaded for iOS
            injectedJavaScriptBeforeContentLoaded={PREWARM_INJECTION}
            
            // Resource blocking
            onShouldStartLoadWithRequest={(request) => shouldBlockRequest(request.url)}
            
            // Events
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onNavigationStateChange={handleNavigationStateChange}
            onMessage={handleMessage}
            onError={(e) => {
              console.error('[PREWARM_MANAGER] ❌ Error:', e.nativeEvent.description);
            }}
            
            style={styles.webview}
          />
        </View>
      </View>
    </CarousellWebViewContext.Provider>
  );
};

export const useCarousellWebView = () => {
  const context = useContext(CarousellWebViewContext);
  if (!context) {
    throw new Error('useCarousellWebView must be used within CarousellWebViewProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  prewarmContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999, // CRITICAL: Android requires elevation for z-index to work
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  hidden: {
    display: 'none', // CRITICAL: Use display:none instead of opacity/size for Android
  },
  visible: {
    opacity: 1,
    width: '100%',
    height: '100%',
    pointerEvents: 'auto',
  },
  webview: {
    flex: 1,
    backgroundColor: '#FFF',
  },
});
