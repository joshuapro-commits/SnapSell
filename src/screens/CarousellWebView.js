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
const COOKIE_EXTRACTION_SCRIPT = `(function(){try{var cookies=document.cookie;var url=window.location.href;var hasSessionCookie=cookies.includes('session=')||cookies.includes('access_token=')||cookies.includes('auth_token=')||cookies.includes('user_id=');var avatar=document.querySelector('[data-testid="nav-avatar"]')||document.querySelector('button[aria-label*="Profile"]')||document.querySelector('a[href*="/profile/"]')||document.querySelector('img[alt*="profile"]')||document.querySelector('[class*="avatar"]');var sellButton=document.querySelector('a[href*="/sell"]')||document.querySelector('button[aria-label*="Sell"]');var loginButton=document.querySelector('a[href*="/login"]');var userName='Carousell User';var profileLink=document.querySelector('a[href*="/u/"]');if(profileLink&&profileLink.href){var match=profileLink.href.match(/\\/u\\/([^\\/\\?]+)/);if(match&&match[1]){userName=decodeURIComponent(match[1]);}}if(userName==='Carousell User'){if(avatar&&avatar.alt){userName=avatar.alt.replace(/profile|picture|avatar/gi,'').trim();}else if(avatar&&avatar.getAttribute){var ariaLabel=avatar.getAttribute('aria-label');if(ariaLabel){userName=ariaLabel;}}}var isLoggedIn=(hasSessionCookie||avatar||sellButton)&&!loginButton;console.log('[CAROUSELL_SESSION] isLoggedIn:'+isLoggedIn+', userName:'+userName);if(isLoggedIn&&window.ReactNativeWebView&&window.ReactNativeWebView.postMessage){window.ReactNativeWebView.postMessage(JSON.stringify({type:'SESSION_ESTABLISHED',cookies:cookies,url:url,userName:userName}));}}catch(e){console.error('[CAROUSELL_SESSION] Error:'+e.message);}})();true;`;

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

// ROBUST Auto-click Sell button script with multiple fallback strategies
const AUTO_CLICK_SELL_FAB_SCRIPT = `
  (function() {
    console.log('[CAROUSELL_SELL] 🔍 Starting robust Sell button search...');
    
    let attemptCount = 0;
    const maxAttempts = 10;
    
    function findAndClickSellButton() {
      attemptCount++;
      console.log('[CAROUSELL_SELL] Attempt', attemptCount, 'of', maxAttempts);
      
      // Strategy 1: Find by href containing '/sell'
      let sellButton = document.querySelector('a[href*="/sell"]');
      if (sellButton && isVisible(sellButton)) {
        console.log('[CAROUSELL_SELL] ✅ Strategy 1: Found by href');
        clickButton(sellButton);
        return true;
      }
      
      // Strategy 2: Find by aria-label containing 'Sell'
      sellButton = document.querySelector('button[aria-label*="Sell" i], a[aria-label*="Sell" i]');
      if (sellButton && isVisible(sellButton)) {
        console.log('[CAROUSELL_SELL] ✅ Strategy 2: Found by aria-label');
        clickButton(sellButton);
        return true;
      }
      
      // Strategy 3: Find by data-testid
      sellButton = document.querySelector('[data-testid*="sell" i], [data-testid*="fab" i]');
      if (sellButton && isVisible(sellButton)) {
        console.log('[CAROUSELL_SELL] ✅ Strategy 3: Found by data-testid');
        clickButton(sellButton);
        return true;
      }
      
      // Strategy 4: Find by text content 'Sell' (case insensitive)
      const allButtons = Array.from(document.querySelectorAll('a, button'));
      sellButton = allButtons.find(el => {
        const text = el.textContent.trim().toLowerCase();
        return text === 'sell' || text.includes('sell');
      });
      if (sellButton && isVisible(sellButton)) {
        console.log('[CAROUSELL_SELL] ✅ Strategy 4: Found by text content');
        clickButton(sellButton);
        return true;
      }
      
      // Strategy 5: Find floating action button (FAB) by position
      // FABs are typically positioned at bottom-right corner
      const fabCandidates = allButtons.filter(el => {
        const rect = el.getBoundingClientRect();
        const isBottomRight = rect.bottom > window.innerHeight - 200 && 
                             rect.right > window.innerWidth - 200;
        const hasCircularShape = rect.width > 40 && rect.height > 40 && 
                                Math.abs(rect.width - rect.height) < 10;
        return isBottomRight && hasCircularShape && isVisible(el);
      });
      
      if (fabCandidates.length > 0) {
        console.log('[CAROUSELL_SELL] ✅ Strategy 5: Found FAB by position');
        clickButton(fabCandidates[0]);
        return true;
      }
      
      // Strategy 6: Find by role="button" with Sell text
      sellButton = Array.from(document.querySelectorAll('[role="button"]')).find(el => {
        const text = el.textContent.trim().toLowerCase();
        return text.includes('sell') && isVisible(el);
      });
      if (sellButton) {
        console.log('[CAROUSELL_SELL] ✅ Strategy 6: Found by role="button"');
        clickButton(sellButton);
        return true;
      }
      
      // Strategy 7: Find by SVG icon (Carousell uses SVG for FAB)
      const svgButtons = Array.from(document.querySelectorAll('button, a')).filter(el => {
        return el.querySelector('svg') && isVisible(el);
      });
      
      for (const btn of svgButtons) {
        const rect = btn.getBoundingClientRect();
        const isBottomRight = rect.bottom > window.innerHeight - 200;
        if (isBottomRight) {
          console.log('[CAROUSELL_SELL] ✅ Strategy 7: Found SVG button at bottom');
          clickButton(btn);
          return true;
        }
      }
      
      console.log('[CAROUSELL_SELL] ❌ Sell button not found in attempt', attemptCount);
      return false;
    }
    
    // Helper: Check if element is visible
    function isVisible(el) {
      if (!el) return false;
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             style.opacity !== '0' &&
             rect.width > 0 && 
             rect.height > 0;
    }
    
    // Helper: Click button with multiple methods
    function clickButton(button) {
      try {
        // Method 1: Direct click
        button.click();
        
        // Method 2: Dispatch mouse events (for React)
        button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        
        // Method 3: Dispatch touch events (for mobile)
        button.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
        button.dispatchEvent(new TouchEvent('touchend', { bubbles: true }));
        
        console.log('[CAROUSELL_SELL] ✅ Button clicked successfully');
        
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'SELL_BUTTON_CLICKED',
          success: true
        }));
      } catch (error) {
        console.error('[CAROUSELL_SELL] Click error:', error);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'SELL_BUTTON_CLICKED',
          success: false,
          error: error.message
        }));
      }
    }
    
    // Retry logic with exponential backoff
    function attemptClick() {
      const found = findAndClickSellButton();
      
      if (!found && attemptCount < maxAttempts) {
        // Exponential backoff: 500ms, 1s, 2s, 3s, 4s...
        const delay = Math.min(500 * attemptCount, 5000);
        console.log('[CAROUSELL_SELL] Retrying in', delay, 'ms...');
        setTimeout(attemptClick, delay);
      } else if (!found) {
        console.log('[CAROUSELL_SELL] ❌ Failed after', maxAttempts, 'attempts');
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'SELL_BUTTON_CLICKED',
          success: false,
          error: 'Button not found after ' + maxAttempts + ' attempts'
        }));
      }
    }
    
    // Start after initial page load delay
    setTimeout(attemptClick, 2000);
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
  const loadingTimeoutRef = useRef(null);
  
  // UI state only - minimal re-renders
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(!isPrewarmed);
  const [autoFillReady, setAutoFillReady] = useState(false);
  const [formFilled, setFormFilled] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  
  const domain = region?.domain || 'carousell.sg';
  const secureStoreKey = `carousell_session_${userId}_${region?.id || 'sg'}`;
  
  console.log('[CAROUSELL_MOUNT] Component mounted with mode:', mode, 'domain:', domain);
  console.log('[CAROUSELL_MOUNT] Pre-warmed status:', isPrewarmed ? '✅ INSTANT LOAD' : '⏳ Warming...');
  console.log('[CAROUSELL_MOUNT] Platform:', Platform.OS);
  
  useEffect(() => {
    // Reset all refs for clean state on every mount
    isVerifying.current = false;
    hasExtractedCookies.current = false;
    hasVerifiedSession.current = false;
    hasFinishedLogin.current = false;
    
    console.log('[CAROUSELL_INIT] 🚀 Using singleton WebView for instant load');
    console.log('[CAROUSELL_INIT] Domain:', domain);
    console.log('[CAROUSELL_INIT] Mode:', mode);
    console.log('[CAROUSELL_INIT] UserId:', userId);
    console.log('[CAROUSELL_INIT] Region:', region);
    console.log('[CAROUSELL_INIT] Current URL:', currentUrl);
    
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
      // CRITICAL: Longer timeout to allow OAuth to complete
      loadingTimeoutRef.current = setTimeout(() => {
        console.log('[CAROUSELL_TIMEOUT] Forcing overlay hide');
        setShowLoadingOverlay(false);
      }, 15000); // Increased from 10s to 15s for OAuth
    }
    
    if (mode === 'sell') {
      checkExistingSession();
    }
    
    // Show login prompt for Android login mode after page loads
    if (Platform.OS === 'android' && mode === 'login') {
      console.log('[CAROUSELL_PROMPT] Setting timer for login prompt...');
      const promptTimer = setTimeout(() => {
        console.log('[CAROUSELL_PROMPT] Showing login prompt NOW');
        setShowLoginPrompt(true);
      }, 3000);
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
  }, []); // Empty dependency array - run once on mount
  
  // Separate effect to check if already logged in when URL changes
  useEffect(() => {
    // Only check in login mode
    if (mode !== 'login') return;
    
    // Only check if we haven't already extracted cookies
    if (hasExtractedCookies.current || hasFinishedLogin.current) return;
    
    // Check if we're on a Carousell page (not login page)
    if (currentUrl && currentUrl.includes(domain) && !currentUrl.includes('/login')) {
      console.log('[CAROUSELL_AUTO_DETECT] 🎉 Already logged in! URL:', currentUrl);
      console.log('[CAROUSELL_AUTO_DETECT] Platform:', Platform.OS);
      console.log('[CAROUSELL_AUTO_DETECT] Extracting cookies with platform-specific delay...');
      
      hasExtractedCookies.current = true;
      hasFinishedLogin.current = true;
      
      // iOS needs longer delay for DOM to be ready
      const delay = Platform.OS === 'ios' ? 1500 : 500;
      console.log('[CAROUSELL_AUTO_DETECT] Using delay:', delay + 'ms');
      
      setTimeout(() => {
        console.log('[CAROUSELL_AUTO_DETECT] Injecting cookie extraction script NOW');
        injectJavaScript(COOKIE_EXTRACTION_SCRIPT);
      }, delay);
    }
  }, [currentUrl, mode, domain, injectJavaScript]);
  
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
    
    // CRITICAL: Hide loading overlay when ANY page finishes loading
    // This ensures we don't hide the WebView during OAuth
    if (!loading) {
      setShowLoadingOverlay(false);
    }
    
    // Skip about: URLs
    if (url.includes('about:')) return;
    
    // Only proceed when page fully loaded
    if (loading) return;
    
    // Detect successful login - ONLY ONCE
    if (mode === 'login' && !hasFinishedLogin.current) {
      const isCarousellDomain = url.includes(domain);
      const isLoginPage = url.includes('/login');
      const isSignupPage = url.includes('/signup');
      const isGoogleOAuth = url.includes('accounts.google.com');
      const isFacebookOAuth = url.includes('facebook.com');
      
      // Success indicators - user landed on main Carousell pages
      const isProfilePage = url.includes('/profile') || url.includes('/u/');
      const isSellPage = url.includes('/sell');
      const isHomePage = url === `https://www.${domain}/` || 
                        url === `https://www.${domain}` ||
                        url.match(new RegExp(`^https://www\\.${domain.replace('.', '\\.')}/?$`));
      
      // Success = on Carousell domain, on profile/sell/home page, NOT on login/signup/OAuth
      const isSuccessfulLogin = isCarousellDomain && 
                               (isProfilePage || isSellPage || isHomePage) &&
                               !isLoginPage && 
                               !isSignupPage && 
                               !isGoogleOAuth &&
                               !isFacebookOAuth;
      
      if (isSuccessfulLogin) {
        console.log('[CAROUSELL_NAV] ✅ Login success detected at:', url);
        console.log('[CAROUSELL_NAV] Extracting session immediately...');
        hasFinishedLogin.current = true;
        setShowLoginPrompt(false);
        
        // Extract immediately, no delay
        if (!hasExtractedCookies.current) {
          console.log('[CAROUSELL_NAV] Injecting cookie extraction script...');
          hasExtractedCookies.current = true;
          injectJavaScript(COOKIE_EXTRACTION_SCRIPT);
        }
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
    
    // Auto-click Sell button when on Carousell home/main page in sell mode
    if (mode === 'sell' && !url.includes('/sell/') && isCarousellMainPage(url)) {
      console.log('[CAROUSELL_NAV] 🎯 On main page, auto-clicking Sell button...');
      setTimeout(() => {
        injectJavaScript(AUTO_CLICK_SELL_FAB_SCRIPT);
      }, 1000);
    }
    
    // Detect successful listing
    if (mode === 'sell' && url.match(/\/p\/[\w-]+-\d+/)) {
      console.log('[CAROUSELL_NAV] ✅ Listing published!');
      handleListingSuccess(url);
    }
  };
  
  // Helper to check if on Carousell main page
  const isCarousellMainPage = (url) => {
    return url === `https://www.${domain}/` || 
           url === `https://www.${domain}` ||
           url.match(new RegExp(`^https://www\\.${domain.replace('.', '\\.')}/?$`));
  };
  
  // Handle WebView messages
  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('[CAROUSELL_MSG]', data.type);
      
      switch (data.type) {
        case 'SESSION_ESTABLISHED':
          const userName = data.userName || 'Carousell User';
          console.log('[CAROUSELL_MSG] ✅ Session established, saving and navigating...');
          
          // Show blur overlay immediately
          setShowLoadingOverlay(true);
          
          // Save session and connection data
          const connectionData = {
            connected: true,
            connectedAt: new Date().toISOString(),
            userName: userName,
            region: region?.id || 'ph',
            regionName: region?.name || 'Philippines',
            domain: domain,
          };
          
          await Promise.all([
            saveSession(data.cookies),
            storageService.savePlatformToken(userId, 'carousell', connectionData)
          ]);
          
          console.log('[CAROUSELL_MSG] ✅ Saved, navigating back...');
          
          // Quick navigation
          hideWebView();
          setTimeout(() => navigation.goBack(), 50);
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
          
        case 'SELL_BUTTON_CLICKED':
          if (data.success) {
            console.log('[CAROUSELL_MSG] ✅ Sell button clicked successfully');
            // Wait for sell form to load, then auto-fill
            setTimeout(() => {
              if (listingData) {
                handleAutoFill();
              }
            }, 3000);
          } else {
            console.log('[CAROUSELL_MSG] ⚠️ Sell button not found:', data.error);
            Alert.alert(
              'Manual Action Required',
              'Please tap the Sell button manually to create your listing.',
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
        </View>
      </View>
      
      {/* WebView Container - Just a placeholder, actual WebView rendered by context */}
      <View style={styles.webviewContainer}>
        {/* Blur Loading overlay */}
        {showLoadingOverlay && (
          <View style={styles.blurOverlay}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color="#D32F2F" />
              <Text style={styles.loadingText}>Connecting...</Text>
            </View>
          </View>
        )}
        
        {/* Singleton WebView rendered by CarousellWebViewProvider */}
        {/* This container is just a spacer - WebView is absolutely positioned */}
      </View>
      
      {/* Login Prompt for Android - OUTSIDE webviewContainer */}
      {Platform.OS === 'android' && mode === 'login' && showLoginPrompt && (
        <View style={styles.loginPromptOverlay} pointerEvents="box-none">
          <View style={styles.loginPromptCard} pointerEvents="auto">
            <View style={styles.loginPromptIconContainer}>
              <Ionicons name="log-in-outline" size={32} color="#D32F2F" />
            </View>
            <Text style={styles.loginPromptTitle}>Connect Your Account</Text>
            <Text style={styles.loginPromptMessage}>
              Tap the <Text style={styles.loginPromptBold}>Login</Text> button on the page to connect your Carousell account
            </Text>
            <TouchableOpacity
              style={styles.loginPromptButton}
              onPress={() => {
                console.log('[CAROUSELL_PROMPT] Dismissing prompt');
                setShowLoginPrompt(false);
              }}
            >
              <Text style={styles.loginPromptButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {console.log('[CAROUSELL_RENDER] showLoginPrompt:', showLoginPrompt, 'Platform:', Platform.OS, 'Mode:', mode)}
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

  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 32,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Montserrat_600SemiBold',
  },
  loginPromptOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 9999,
    elevation: 9999,
  },
  loginPromptCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 10000,
  },
  loginPromptIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFE8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginPromptTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  loginPromptMessage: {
    fontSize: 15,
    fontFamily: 'Montserrat_400Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  loginPromptBold: {
    fontFamily: 'Montserrat_600SemiBold',
    color: '#D32F2F',
  },
  loginPromptButton: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    width: '100%',
  },
  loginPromptButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
  },
});
