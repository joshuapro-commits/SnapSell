import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Text, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { platformService } from '../services/platforms';

export const FacebookWebViewScreen = ({ navigation, route }) => {
  const { listingData, userId } = route.params;
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [showFillButton, setShowFillButton] = useState(true);
  const [imageBase64, setImageBase64] = useState(null);
  const hasDetectedSuccess = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [facebookUserId, setFacebookUserId] = useState(null);

  // Stable URL - only changes when Facebook user changes
  const stableUrl = React.useMemo(() => {
    // Start with neutral home page for cookie handshake
    return 'https://www.facebook.com/?_rdc=1&_rdr';
  }, [facebookUserId]);

  // Stable key - only changes when Facebook user changes
  const stableKey = React.useMemo(() => {
    return `fb-sell-${facebookUserId || userId}`;
  }, [facebookUserId, userId]);

  useEffect(() => {
    const loadFacebookUserId = async () => {
      try {
        const tokens = await platformService.getPlatformTokens(userId);
        if (tokens.facebook) {
          console.log('[FACEBOOK_WEBVIEW] Facebook user ID:', tokens.facebook.userId);
          setFacebookUserId(tokens.facebook.userId);
        } else {
          console.log('[FACEBOOK_WEBVIEW] No Facebook token found');
        }
      } catch (error) {
        console.log('[FACEBOOK_WEBVIEW] Error loading Facebook user ID:', error);
      }
      setIsReady(true);
    };
    loadFacebookUserId();
  }, [userId]);

  // Convert image to Base64 on mount
  useEffect(() => {
    const convertImageToBase64 = async () => {
      try {
        const base64 = await FileSystem.readAsStringAsync(listingData.imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setImageBase64(`data:image/jpeg;base64,${base64}`);
      } catch (error) {
        console.error('Error converting image to Base64:', error);
      }
    };
    convertImageToBase64();
  }, [listingData.imageUri]);



  const getFacebookAutoFillScript = () => {
    const categoryMap = {
      'Electronics': 'Electronics & Computers',
      'Clothing': 'Clothing & Accessories',
      'Furniture': 'Furniture',
      'Books': 'Books, Films & Music',
      'Sporting Goods': 'Sports & Outdoors',
      'Toys': 'Toys & Games',
      'Home': 'Home & Garden',
      'Automotive': 'Vehicles',
      'Beauty': 'Health & Beauty',
      'Jewelry': 'Jewelry & Watches',
      'Other': 'Miscellaneous'
    };

    const productData = {
      title: listingData.name,
      price: listingData.platformData.facebook.price.toString(),
      description: listingData.descriptions.facebook,
      category: categoryMap[listingData.category] || 'Miscellaneous',
      condition: listingData.condition || 'Used - Like New',
      tags: listingData.platformData.facebook.hashtags || []
    };
    
    return `
      (function() {
        const sleep = (ms) => new Promise(res => setTimeout(res, ms));
        const productData = ${JSON.stringify(productData)};
        
        function findFieldByText(searchText) {
          const elements = Array.from(document.querySelectorAll('span, label, div'));
          const targetLabel = elements.find(el => 
            el.innerText.trim() === searchText && el.children.length === 0
          );
          if (targetLabel) {
            let parent = targetLabel.parentElement;
            for (let i = 0; i < 5; i++) {
              const input = parent.querySelector('input, textarea');
              if (input) return input;
              parent = parent.parentElement;
              if (!parent) break;
            }
          }
          return null;
        }
        
        async function typeWithEffect(element, text) {
          element.focus({ preventScroll: true });
          const nativeSetter = Object.getOwnPropertyDescriptor(
            element.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
            'value'
          ).set;
          
          nativeSetter.call(element, '');
          for (let i = 0; i < text.length; i++) {
            nativeSetter.call(element, text.substring(0, i + 1));
            element.dispatchEvent(new Event('input', { bubbles: true }));
            await sleep(Math.random() * 40 + 40);
          }
          element.dispatchEvent(new Event('change', { bubbles: true }));
          element.blur();
        }

        async function autoPressNext() {
          // Wait for Facebook's validation to enable the button - human-like delay
          await sleep(4000 + Math.random() * 2000); // 4-6 seconds
          
          console.log('Searching for Next/Publish button...');
          
          // Strategy 1: Look for button using aria-label
          let nextBtn = document.querySelector('div[role="button"][aria-label="Next"], button[aria-label="Next"]');
          
          // Strategy 2: Fallback to text search
          if (!nextBtn) {
            const allButtons = Array.from(document.querySelectorAll('div[role="button"], button'));
            nextBtn = allButtons.find(b => {
              const text = b.innerText ? b.innerText.trim() : '';
              return text === 'Next' || text === 'Publish';
            });
          }
          
          // Strategy 3: Search by span text and find parent button
          if (!nextBtn) {
            const spans = Array.from(document.querySelectorAll('span'));
            const nextSpan = spans.find(s => s.innerText && (s.innerText.trim() === 'Next' || s.innerText.trim() === 'Publish'));
            if (nextSpan) {
              nextBtn = nextSpan.closest('div[role="button"]') || nextSpan.closest('button');
            }
          }
          
          if (nextBtn) {
            console.log('Found button:', nextBtn.innerText?.trim() || 'Next', '- force clicking...');
            
            // Scroll into view to ensure it's visible
            nextBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await sleep(500);
            
            // Simulate full mouse event sequence (mousedown, mouseup, click)
            const events = ['mousedown', 'mouseup', 'click'];
            events.forEach(eventType => {
              nextBtn.dispatchEvent(new MouseEvent(eventType, {
                view: window,
                bubbles: true,
                cancelable: true,
                buttons: 1
              }));
            });
            
            // Fallback: Try clicking the span inside the button
            await sleep(300);
            const innerSpan = nextBtn.querySelector('span');
            if (innerSpan) {
              innerSpan.click();
            }
            
            window.__bridge.postMessage(JSON.stringify({ 
              type: 'button_clicked',
              buttonText: nextBtn.innerText?.trim() || 'Next'
            }));
            return true;
          } else {
            console.log('Next/Publish button not found');
            // Debug: Log all button texts
            const allButtons = Array.from(document.querySelectorAll('div[role="button"], button'));
            const buttonTexts = allButtons
              .map(b => b.innerText ? b.innerText.trim() : '')
              .filter(t => t.length > 0 && t.length < 50);
            window.__bridge.postMessage(JSON.stringify({ 
              type: 'button_debug',
              availableButtons: buttonTexts.slice(0, 15)
            }));
            return false;
          }
        }

        async function injectProductTags(tagsArray) {
          if (!tagsArray || tagsArray.length === 0) return true;
          
          // Find the Tags input field
          const tagInput = document.querySelector('input[aria-label="Tags"], input[aria-label="Product tags"]');
          
          if (!tagInput) {
            console.log('Tags field not found - checking for hidden options');
            // Try to find and click 'Additional listing options' or similar
            const spans = Array.from(document.querySelectorAll('span'));
            const moreOptions = spans.find(s => 
              s.innerText.includes('listing options') || 
              s.innerText.includes('Additional details')
            );
            if (moreOptions) {
              moreOptions.click();
              await sleep(1000);
              // Try again after expanding
              const tagInputRetry = document.querySelector('input[aria-label="Tags"], input[aria-label="Product tags"]');
              if (!tagInputRetry) return false;
              return await injectProductTags(tagsArray); // Recursive call
            }
            return false;
          }
          
          console.log('Tags field found, injecting', tagsArray.length, 'tags');
          
          // Loop through each tag and commit with Enter key
          for (let tag of tagsArray) {
            tagInput.focus({ preventScroll: true });
            
            // Set the value using native setter
            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeSetter.call(tagInput, tag);
            
            // Dispatch input event for React state update
            tagInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            await sleep(200);
            
            // Simulate pressing Enter to commit the tag
            tagInput.dispatchEvent(new KeyboardEvent('keydown', {
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              which: 13,
              bubbles: true
            }));
            
            tagInput.dispatchEvent(new KeyboardEvent('keyup', {
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              which: 13,
              bubbles: true
            }));
            
            // Pause between tags to avoid UI glitches
            await sleep(400 + Math.random() * 200); // 400-600ms
          }
          
          tagInput.blur();
          console.log('Tags injection complete');
          return true;
        }

        async function selectDropdownOption(labelText, optionText) {
          console.log('Attempting to select:', labelText, '=', optionText);
          
          // Save current scroll position to prevent snap-back
          const currentScroll = window.scrollY;
          
          // Ensure clean state
          if (document.activeElement) {
            document.activeElement.blur();
          }
          await sleep(400 + Math.random() * 200); // 400-600ms
          
          // Find the label span
          const spans = Array.from(document.querySelectorAll('span'));
          const labelSpan = spans.find(s => s.innerText.trim() === labelText);
          
          if (!labelSpan) {
            console.log(labelText + ' label not found');
            return false;
          }
          
          // Find the trigger button (the clickable element that opens the dropdown)
          const trigger = labelSpan.closest('div[role="button"]') || labelSpan.parentElement;
          if (!trigger) {
            console.log(labelText + ' trigger not found');
            return false;
          }
          
          console.log(labelText + ' trigger found, clicking...');
          trigger.click();
          
          // Force scroll back if it jumped
          if (window.scrollY !== currentScroll) {
            window.scrollTo(0, currentScroll);
          }
          
          // CRITICAL: Wait for menu animation to complete
          await sleep(1100 + Math.random() * 300); // 1100-1400ms
          
          // Search for the option in the now-visible menu
          const menuItems = Array.from(document.querySelectorAll('span, div[role="option"]'));
          const visibleOptions = menuItems.filter(el => {
            const text = (el.textContent || '').trim();
            return text.length > 0 && text.length < 100;
          });
          
          console.log(labelText + ' visible options:', visibleOptions.length);
          const sampleTexts = visibleOptions.slice(0, 10).map(el => (el.textContent || '').trim());
          window.__bridge.postMessage(JSON.stringify({
            type: 'dropdown_debug',
            field: labelText,
            step: 'menu_opened',
            optionCount: visibleOptions.length,
            sampleOptions: sampleTexts
          }));
          
          // Find the target option (case-insensitive partial match)
          const target = visibleOptions.find(el => {
            const text = (el.textContent || '').trim().toLowerCase();
            return text.includes(optionText.toLowerCase());
          });
          
          if (target) {
            console.log(labelText + ' found option:', target.textContent.trim());
            target.click();
            await sleep(400 + Math.random() * 200); // 400-600ms
            return true;
          }
          
          console.log(labelText + ' option not found:', optionText);
          const foundNames = visibleOptions.map(el => (el.textContent || '').trim()).filter(t => t.length > 0);
          window.__bridge.postMessage(JSON.stringify({
            type: 'dropdown_debug',
            field: labelText,
            step: 'option_not_found',
            searchTerm: optionText,
            availableOptions: foundNames.slice(0, 15)
          }));
          return false;
        }

        async function startAutoFill() {
          // Brief delay to ensure page is ready
          await sleep(500);
          
          console.log('Starting auto-fill sequence...');
          
          // Try multiple strategies to find Title field
          let titleEl = findFieldByText('Title');
          if (!titleEl) {
            // Fallback: Find by placeholder or aria-label
            titleEl = document.querySelector('input[placeholder*="Title"], input[aria-label*="Title"]');
          }
          if (!titleEl) {
            // Fallback: Find first input in the form
            const allInputs = document.querySelectorAll('input[type="text"]');
            titleEl = allInputs[0];
          }
          
          if (titleEl) {
            console.log('Filling Title:', productData.title);
            await typeWithEffect(titleEl, productData.title);
            titleEl.blur();
          } else {
            console.log('Title field not found');
          }
          
          await sleep(600 + Math.random() * 400); // 600-1000ms
          
          const priceEl = findFieldByText('Price');
          if (priceEl) {
            console.log('Filling Price:', productData.price);
            await typeWithEffect(priceEl, productData.price);
            priceEl.blur();
          } else {
            console.log('Price field not found');
          }
          
          await sleep(700 + Math.random() * 400); // 700-1100ms
          
          // Sequential timing with proper delays between actions
          const catSuccess = await selectDropdownOption('Category', productData.category);
          await sleep(1200 + Math.random() * 500); // 1200-1700ms - Wait for Category menu to fully close
          
          const condSuccess = await selectDropdownOption('Condition', productData.condition);
          await sleep(1200 + Math.random() * 500); // 1200-1700ms - Wait for Condition menu to fully close
          
          await sleep(500 + Math.random() * 300); // 500-800ms
          
          // Description field - target textarea with typewriter effect
          const descField = document.querySelector('textarea[aria-label="Description"], textarea');
          if (descField) {
            await typeWithEffect(descField, productData.description);
          }
          
          await sleep(800 + Math.random() * 400); // 800-1200ms
          
          // Product tags - inject with Enter key simulation
          const tagsSuccess = await injectProductTags(productData.tags);
          if (tagsSuccess) {
            console.log('Product tags added successfully');
          } else {
            console.log('Product tags field not found or failed');
          }
          
          window.__bridge.postMessage(JSON.stringify({ 
            type: 'autofill_complete',
            results: { category: catSuccess, condition: condSuccess }
          }));
        }

        startAutoFill();
      })();
      true;
    `;
  };

  const getImageInjectionScript = (base64Data, autofillResults) => {
    return `
      (async function() {
        const sleep = (ms) => new Promise(res => setTimeout(res, ms));
        
        try {
          const base64String = '${base64Data}'.split(',')[1];
          const binaryString = atob(base64String);
          const bytes = new Uint8Array(binaryString.length);
          
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          const blob = new Blob([bytes], { type: 'image/jpeg' });
          const file = new File([blob], 'product.jpg', { type: 'image/jpeg' });
          const fileInput = document.querySelector('input[type="file"]');
          
          if (fileInput) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));
            
            window.__bridge.postMessage(JSON.stringify({ 
              type: 'image_uploaded',
              results: ${JSON.stringify(autofillResults)}
            }));
          }
        } catch (error) {
          console.error('Image injection error:', error);
        }
      })();
      true;
    `;
  };

  const injectedJavaScript = `
    (function() {
      // Auto-click "Continue as..." button if it appears
      const clickContinue = () => {
        const buttons = Array.from(document.querySelectorAll('div[role="button"], button'));
        const continueBtn = buttons.find(b => {
          const text = (b.innerText || '').toLowerCase();
          return text.includes('continue');
        });
        if (continueBtn) {
          console.log('[AUTO_CONTINUE] Clicking Continue button');
          continueBtn.click();
          return true;
        }
        return false;
      };
      
      // Try clicking Continue immediately and retry
      if (!clickContinue()) {
        const interval = setInterval(() => {
          if (clickContinue()) {
            clearInterval(interval);
          }
        }, 500);
        setTimeout(() => clearInterval(interval), 5000);
      }
      
      // Clear storage but preserve cookies
      try {
        window.localStorage.clear();
        window.sessionStorage.clear();
        console.log('[STORAGE_CLEAR] localStorage and sessionStorage cleared');
        
        if (window.indexedDB && window.indexedDB.databases) {
          window.indexedDB.databases().then(dbs => {
            dbs.forEach(db => window.indexedDB.deleteDatabase(db.name));
          });
        }
      } catch (e) {
        console.log('[STORAGE_CLEAR] Error:', e.message);
      }
      
      // Handshake: If on home page and logged in, navigate to marketplace
      if (window.location.hostname === 'www.facebook.com' && !window.location.href.includes('marketplace')) {
        // Check if we're logged in (not on login page)
        if (!window.location.href.includes('/login')) {
          console.log('[HANDSHAKE] On home page, navigating to marketplace...');
          setTimeout(() => {
            window.location.href = 'https://www.facebook.com/marketplace/create/item';
          }, 1500);
        }
      }
      
      const bridge = window.ReactNativeWebView.postMessage.bind(window.ReactNativeWebView);
      delete window.ReactNativeWebView;
      delete window.webkit;
      window.__bridge = { postMessage: bridge };
      
      Object.defineProperty(window, 'webkit', {
        get: function() { return undefined; },
        set: function() {},
        configurable: false
      });
      
      Object.defineProperty(window, 'ReactNativeWebView', {
        get: function() { return undefined; },
        set: function() {},
        configurable: false
      });
      
      function forceScrollable() {
        const style = document.createElement('style');
        style.textContent = \`
          html, body {
            overflow: visible !important;
            overflow-y: scroll !important;
            -webkit-overflow-scrolling: touch !important;
            height: auto !important;
            min-height: 100vh !important;
          }
          body > div {
            overflow: visible !important;
          }
        \`;
        document.head.appendChild(style);
      }
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceScrollable);
      } else {
        forceScrollable();
      }
      
      setTimeout(forceScrollable, 1000);
      setTimeout(forceScrollable, 2000);
    })();
    true;
  `;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'dropdown_debug') {
        if (data.step === 'option_not_found' && data.availableOptions) {
          console.log(`[${data.field}] Available options:`, data.availableOptions);
          console.log(`[${data.field}] Searched for:`, data.searchTerm);
        } else {
          console.log(`[${data.field}] ${data.step}:`, data.optionCount || '', data.sampleOptions || '');
        }
      } else if (data.type === 'button_clicked') {
        console.log('Button clicked:', data.buttonText);
      } else if (data.type === 'button_disabled') {
        console.log('Button disabled:', data.message);
      } else if (data.type === 'button_debug') {
        console.log('Available buttons:', data.availableButtons);
      } else if (data.type === 'autofill_complete') {
        console.log('Auto-fill complete:', data.results);
        if (imageBase64) {
          setTimeout(() => {
            const script = getImageInjectionScript(imageBase64, data.results);
            webViewRef.current?.injectJavaScript(script);
          }, 1000);
        }
      } else if (data.type === 'next_button_clicked') {
        console.log('Next button clicked successfully');
      } else if (data.type === 'next_button_debug') {
        console.log('Available buttons:', data.availableButtons);
      } else if (data.type === 'next_clicked_after_image') {
        console.log('Next button clicked after image upload');
      } else if (data.type === 'image_uploaded') {
        console.log('Image uploaded successfully');
        // Wait 3-5 seconds before clicking Next (human-like delay)
        const delay = 3000 + Math.random() * 2000;
        console.log(`Waiting ${Math.round(delay/1000)}s before clicking Next...`);
        setTimeout(() => {
          const clickNextScript = `
            (async function() {
              const sleep = (ms) => new Promise(res => setTimeout(res, ms));
              
              const nextBtn = document.querySelector('div[role="button"][aria-label="Next"], button[aria-label="Next"]') ||
                             Array.from(document.querySelectorAll('div[role="button"], button')).find(b => 
                               b.innerText && (b.innerText.trim() === 'Next' || b.innerText.trim() === 'Publish')
                             );
              
              if (nextBtn) {
                console.log('Clicking Next button after delay...');
                nextBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await sleep(800 + Math.random() * 400);
                
                const events = ['mousedown', 'mouseup', 'click'];
                events.forEach(eventType => {
                  nextBtn.dispatchEvent(new MouseEvent(eventType, {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    buttons: 1
                  }));
                });
                
                await sleep(300);
                const innerSpan = nextBtn.querySelector('span');
                if (innerSpan) innerSpan.click();
                
                window.__bridge.postMessage(JSON.stringify({ type: 'next_clicked_after_image' }));
              }
            })();
            true;
          `;
          webViewRef.current?.injectJavaScript(clickNextScript);
        }, delay);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  const handleFillForm = () => {
    if (!imageBase64) {
      Alert.alert('Please Wait', 'Image is still being processed.');
      return;
    }
    
    setShowFillButton(false);
    webViewRef.current?.injectJavaScript(getFacebookAutoFillScript());
  };

  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    
    console.log('Navigation URL:', navState.url);
    
    // Multiple patterns to detect successful listing
    const isPublished = navState.url.match(/\/marketplace\/item\/\d+/) || 
                        navState.url.includes('/marketplace/you/item/') ||
                        navState.url.includes('/marketplace/you/selling') ||
                        navState.url.includes('/marketplace/item/') ||
                        navState.url.match(/\/item\/\d+/);
    
    if (isPublished && !hasDetectedSuccess.current) {
      hasDetectedSuccess.current = true;
      console.log('Success detected! Navigating to success screen...');
      navigation.replace('ListingSuccess', {
        productName: listingData.name,
        selectedPlatforms: { facebook: true },
        publishResults: {
          facebook: {
            success: true,
            listingId: `fb_${Date.now()}`,
            listingUrl: navState.url,
            platform: 'facebook',
            publishedAt: new Date().toISOString(),
          },
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (canGoBack) {
              webViewRef.current?.goBack();
            } else {
              navigation.goBack();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Facebook Marketplace</Text>
        
        <View style={{ width: 24 }} />
      </View>

      {isReady && (
        <WebView
          key={stableKey}
          ref={webViewRef}
          source={{ uri: stableUrl }}
          injectedJavaScript={injectedJavaScript}
          onMessage={handleMessage}
          onNavigationStateChange={handleNavigationStateChange}
          userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          javaScriptEnabled={true}
          domStorageEnabled={true}
          thirdPartyCookiesEnabled={true}
          sharedCookiesEnabled={true}
          incognito={false}
          cacheEnabled={false}
          cacheMode="LOAD_NO_CACHE"
          onLoadStart={() => {
            setLoading(true);
          }}
          onLoadEnd={() => setLoading(false)}
          onShouldStartLoadWithRequest={(req) => {
            if (req.url.includes('fb://') || req.url.includes('fbauth://')) {
              return false;
            }
            return true;
          }}
          style={styles.webview}
        />
      )}

      {showFillButton && (
        <View style={styles.fillButtonContainer}>
          <TouchableOpacity 
            style={styles.fillButton}
            onPress={handleFillForm}
          >
            <Ionicons name="flash" size={20} color="#FFF" />
            <Text style={styles.fillButtonText}>Fill Listing Info</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading Facebook...</Text>
        </View>
      )}
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
  webview: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  fillButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  fillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fillButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: 'Montserrat_700Bold',
  },
});
