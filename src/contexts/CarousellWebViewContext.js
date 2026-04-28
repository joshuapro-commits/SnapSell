import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mobile User Agent
const USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

// Viewport injection + Cookie banner removal
const PREWARM_INJECTION = `
  (function() {
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

// Aggressive resource blocker
const RESOURCE_BLOCKLIST = [
  // Analytics & Tracking
  'googletagmanager',
  'google-analytics',
  'googleadservices',
  'googlesyndication',
  'doubleclick',
  'adservice',
  'analytics',
  'tracking',
  'telemetry',
  'metrics',
  
  // Social Media Trackers
  'facebook.net',
  'facebook.com/tr',
  'fbevents',
  'connect.facebook',
  
  // Ad Networks
  'criteo',
  'adtrafficquality',
  'advertising',
  'adsystem',
  'adnxs',
  'pubmatic',
  
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
    console.log('[PREWARM_MANAGER] Pre-warming Carousell in background...');
  }, []);
  
  const shouldBlockRequest = (url) => {
    // CRITICAL: Allow internal iOS/Android URLs
    if (url.startsWith('about:') || 
        url.startsWith('blob:') || 
        url.startsWith('data:')) {
      console.log('[PREWARM_ALLOW] Internal URL:', url.substring(0, 40));
      return true;
    }
    
    const shouldBlock = RESOURCE_BLOCKLIST.some(blocked => 
      url.toLowerCase().includes(blocked)
    );
    
    if (shouldBlock) {
      console.log('[PREWARM_BLOCKED]', url.substring(0, 60));
    }
    
    return !shouldBlock;
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
    
    if (domain !== currentDomain) {
      console.log('[PREWARM_MANAGER] 🔄 Domain changed, navigating to', domain);
      setCurrentDomain(domain);
      setIsPrewarmed(false);
      
      // Navigate to login page directly for login mode
      const targetUrl = mode === 'login' 
        ? `https://www.${domain}/login/` 
        : `https://www.${domain}`;
      
      console.log('[PREWARM_MANAGER] 🧭 Target URL:', targetUrl);
      webViewRef.current?.injectJavaScript(`window.location.href='${targetUrl}';true;`);
    } else if (mode === 'login') {
      // Same domain but need to go to login page
      const loginUrl = `https://www.${domain}/login/`;
      console.log('[PREWARM_MANAGER] 🧭 Navigating to login:', loginUrl);
      webViewRef.current?.injectJavaScript(`window.location.href='${loginUrl}';true;`);
    }
    
    setIsVisible(true);
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
      {/* CRITICAL: Proper stacking and safe area handling */}
      <View 
        style={[
          styles.prewarmContainer,
          isVisible ? styles.visible : styles.hidden
        ]}
      >
        <SafeAreaView 
          style={styles.safeArea}
          edges={isVisible ? ['top'] : []}
        >
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
        </SafeAreaView>
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
    backgroundColor: '#FFF',
    // CRITICAL: Overflow hidden to prevent WebView bleeding
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
    // Android: Respect status bar height
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  hidden: {
    opacity: 0,
    width: 0,
    height: 0,
    pointerEvents: 'none',
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
