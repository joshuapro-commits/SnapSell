import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Alert,
  AppState,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { storageService } from '../services/storage';
import * as FileSystem from 'expo-file-system/legacy';

// Clean mobile Safari UA — no FBAN, FBAV, or Version/X.X app identifiers
// iPad UA: Facebook treats it as large-screen mobile, full marketplace access, no "Download App" nag
const MOBILE_USER_AGENT = 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1';

export const FacebookUnifiedWebView = ({ navigation, route }) => {
  const { mode, userId, listingData } = route.params;
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [hasConnected, setHasConnected] = useState(false);
  const [formFilled, setFormFilled] = useState(false);

  // Show warning on mount for sell mode
  useEffect(() => {
    if (mode === 'sell') {
      setTimeout(() => {
        Alert.alert(
          '💡 Smart Rate Limiting',
          'SnapSell automatically adjusts wait times based on your activity:\n\n• First 3 listings: 2 min wait\n• Next 2 listings: 5 min wait\n• After 5 listings: 10 min wait\n\nThis keeps your account safe!',
          [{ text: 'Got it' }]
        );
      }, 1000);
    }
  }, [mode]);

  // Determine initial URL based on mode
  const getInitialUrl = () => {
    if (mode === 'login') return 'https://www.facebook.com/login';
    if (mode === 'view') return route.params.viewUrl || 'https://www.facebook.com/marketplace/you/selling';
    if (mode === 'sell') return 'https://www.facebook.com/marketplace/create/item';
    if (mode === 'relist') {
      // Relist mode: Navigate to existing listing edit page
      const listingUrl = route.params.listingUrl;
      if (listingUrl) {
        // Extract listing ID from URL and navigate to edit page
        // Facebook edit URL format: /marketplace/item/{id}/edit
        return listingUrl.replace(/\/item\//, '/item/').replace(/\/$/, '') + '/edit';
      }
      // Fallback to marketplace home if no URL provided
      return 'https://www.facebook.com/marketplace/you/selling';
    }
    return 'https://www.facebook.com';
  };

  const handleNavigationStateChange = async (navState) => {
    console.log(`[FB_${mode.toUpperCase()}] Navigation URL:`, navState.url);

    if (mode === 'login') {
      // Login mode: detect successful login
      // More strict detection - only trigger on actual Facebook home/feed/marketplace URLs
      const isLoginSuccess = (
        navState.url.includes('facebook.com') &&
        !navState.url.includes('/login') &&
        !navState.url.includes('/checkpoint') &&
        !navState.url.includes('/recover') &&
        !navState.url.includes('/help') &&
        !navState.url.includes('/privacy') &&
        !navState.url.includes('/confirmemail') &&
        !navState.url.includes('/checkpoint/') &&
        !hasConnected &&
        // Must be on one of these authenticated pages
        (navState.url.includes('/home.php') ||
         navState.url.includes('facebook.com/?') ||
         navState.url.includes('facebook.com/#') ||
         navState.url === 'https://www.facebook.com/' ||
         navState.url === 'https://m.facebook.com/' ||
         navState.url.includes('/marketplace') ||
         navState.url.includes('/profile.php') ||
         navState.url.includes('/watch') ||
         navState.url.includes('/groups'))
      );

      if (isLoginSuccess) {
        console.log('[FB_LOGIN] Login successful detected!');
        console.log('[FB_LOGIN] Final URL:', navState.url);
        setHasConnected(true);
        
        // Extract profile immediately without verification delay
        const profileScript = `
          (function() {
            try {
              let userName = '';
              
              const profileButton = document.querySelector('div[aria-label*="Account"], div[aria-label*="Profile"]');
              if (profileButton) {
                userName = profileButton.getAttribute('aria-label') || '';
              }

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

              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PROFILE_EXTRACTED',
                userName: userName.trim() || 'Facebook User',
              }));
            } catch (error) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PROFILE_EXTRACTED',
                userName: 'Facebook User',
              }));
            }
          })();
          true;
        `;
        
        // Wait just 1 second for DOM to be ready, then extract profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        webViewRef.current?.injectJavaScript(profileScript);
      }
    } else if (mode === 'sell') {
      // Sell mode: Auto-fill form when marketplace create page loads
      if (navState.url.includes('/marketplace/create') && !formFilled && !loading) {
        console.log('[FB_SELL] Marketplace create page loaded, waiting for form...');
        setFormFilled(true);

        // Smart tiered cooldown system
        const lastPublish = await storageService.getLastPublishTime(userId);
        const publishHistory = await storageService.getPublishHistory(userId);
        const now = Date.now();
        const elapsed = now - lastPublish;
        
        // Count recent listings (last hour)
        const oneHourAgo = now - (60 * 60 * 1000);
        const recentListings = publishHistory.filter(time => time > oneHourAgo).length;
        
        // Tiered cooldown based on velocity
        let requiredGap;
        let message;
        
        if (recentListings === 0) {
          // First listing of the hour - no wait
          requiredGap = 0;
        } else if (recentListings < 3) {
          // Listings 2-3: 2 minutes
          requiredGap = 2 * 60 * 1000;
          message = 'Quick break! Wait 2 minutes between listings to keep your account safe.';
        } else if (recentListings < 5) {
          // Listings 4-5: 5 minutes
          requiredGap = 5 * 60 * 1000;
          message = 'Slow down a bit. Wait 5 minutes to avoid Facebook security checks.';
        } else {
          // 6+ listings: 10 minutes
          requiredGap = 10 * 60 * 1000;
          message = 'You\'ve posted several listings. Wait 10 minutes to prevent account restrictions.';
        }
        
        if (elapsed < requiredGap) {
          const remaining = Math.ceil((requiredGap - elapsed) / 60000);
          const seconds = Math.ceil((requiredGap - elapsed) / 1000) % 60;
          const timeStr = remaining > 0 
            ? `${remaining} minute${remaining > 1 ? 's' : ''}${seconds > 0 ? ` ${seconds}s` : ''}`
            : `${seconds} seconds`;
          
          Alert.alert(
            'Please Wait',
            `${message}\n\nTime remaining: ${timeStr}`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
          return;
        }

        // Wait longer for Facebook's React to render the form
        setTimeout(() => {
          const listingName = (listingData?.name || '').replace(/"/g, '\\"').replace(/\n/g, ' ');
          const fbDescription = (listingData?.descriptions?.facebook || listingData?.description || '').replace(/"/g, '\\"').replace(/\n/g, ' ');
          const fbPrice = String(listingData?.platformData?.facebook?.price || listingData?.price || '');
          const fbCategoryId = String(listingData?.platformData?.facebook?.categoryId || '536');
          const fbCategoryName = String(listingData?.platformData?.facebook?.categoryName || 'Home & garden');
          const fbHierarchy = JSON.stringify(listingData?.platformData?.facebook?.hierarchy || null);
          const fbCondition = String(listingData?.platformData?.facebook?.condition || listingData?.condition || 'Good');
          const fbTags = JSON.stringify(listingData?.platformData?.facebook?.tags || []);
          const fbAttributes = JSON.stringify(listingData?.attributes || {});
          const hasVerification = !!listingData?.verification;
          
          const fillFormScript = `
            (function() {
              // Debug: Log the listing data we received
              console.log('[FB_FILL] Listing name:', "${listingName}");
              console.log('[FB_FILL] FB Description:', "${fbDescription.substring(0, 100)}");
              console.log('[FB_FILL] Has verification:', ${hasVerification});
              
              const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

              // ── Kill switch: stop everything if Facebook challenges the user ────────
              // Polls every 2s. If "Confirm it's you" appears, halts and alerts.
              // No proxy fetch — all network goes through the device's native stack.
              let killSwitchTriggered = false;
              const killSwitchInterval = setInterval(() => {
                const bodyText = document.body ? document.body.innerText : '';
                if (bodyText.includes("Confirm it's you") || bodyText.includes('Confirm your identity')) {
                  killSwitchTriggered = true;
                  clearInterval(killSwitchInterval);
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'KILL_SWITCH' }));
                }
              }, 2000);

              // ── Shadow DOM piercing query ─────────────────────────────────────
              // Recursively searches through shadow roots to find elements
              // that standard querySelector cannot reach
              function querySelectorDeep(selector, root) {
                root = root || document;
                const found = root.querySelector(selector);
                if (found) return found;
                const all = root.querySelectorAll('*');
                for (var i = 0; i < all.length; i++) {
                  if (all[i].shadowRoot) {
                    const result = querySelectorDeep(selector, all[i].shadowRoot);
                    if (result) return result;
                  }
                }
                return null;
              }

              function querySelectorAllDeep(selector, root) {
                root = root || document;
                const results = Array.from(root.querySelectorAll(selector));
                const all = root.querySelectorAll('*');
                for (var i = 0; i < all.length; i++) {
                  if (all[i].shadowRoot) {
                    const nested = querySelectorAllDeep(selector, all[i].shadowRoot);
                    for (var j = 0; j < nested.length; j++) results.push(nested[j]);
                  }
                }
                return results;
              }

              // ── Priority-based input finder ───────────────────────────────────
              // 1st: aria-label exact match (most reliable, pierces shadow DOM)
              // 2nd: placeholder match
              // 3rd: recursive text search — find label text node, walk up DOM to input
              function findInput(labelText) {
                // Priority 1: aria-label
                var el = querySelectorDeep('[aria-label="' + labelText + '"]');
                if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return el;

                // Priority 2: placeholder
                el = querySelectorDeep('input[placeholder="' + labelText + '"], textarea[placeholder="' + labelText + '"]');
                if (el) return el;

                // Priority 3: find visible label text node, traverse up to find input
                var allNodes = querySelectorAllDeep('span, label, div, p');
                for (var n = 0; n < allNodes.length; n++) {
                  var node = allNodes[n];
                  // Only match leaf-level text to avoid false positives on container divs
                  var directText = '';
                  for (var c = 0; c < node.childNodes.length; c++) {
                    if (node.childNodes[c].nodeType === Node.TEXT_NODE) {
                      directText += node.childNodes[c].textContent.trim();
                    }
                  }
                  if (directText !== labelText) continue;

                  // Walk up max 6 parent levels to find associated input/textarea
                  var parent = node.parentElement;
                  for (var i = 0; i < 6; i++) {
                    if (!parent) break;
                    var input = parent.querySelector('input, textarea, [contenteditable="true"], [role="textbox"]');
                    if (input) return input;
                    // Also check shadow roots on the way up
                    var children = parent.querySelectorAll('*');
                    for (var k = 0; k < children.length; k++) {
                      if (children[k].shadowRoot) {
                        var shadowInput = children[k].shadowRoot.querySelector('input, textarea, [contenteditable="true"]');
                        if (shadowInput) return shadowInput;
                      }
                    }
                    parent = parent.parentElement;
                  }
                }
                return null;
              }

              // ── Marketplace-scoped dropdown trigger finder ────────────────────
              // Finds the label text node, then walks UP to its closest clickable
              // container. Scoped to the main form to avoid matching the notification
              // bell or nav bar which share similar generic roles.
              function findDropdownTrigger(labelText) {
                // Priority 1: aria-label directly on a combobox/button inside the form
                var formRoot = document.querySelector('[role="main"]') || document.querySelector('form') || document.body;
                var el = formRoot.querySelector('[aria-label="' + labelText + '"][role="combobox"], [aria-label="' + labelText + '"][aria-expanded]');
                if (el) return el;

                // Priority 2: find the exact label text node, walk up to closest button
                var allNodes = Array.from(formRoot.querySelectorAll('span, label, div'));
                for (var n = 0; n < allNodes.length; n++) {
                  var node = allNodes[n];
                  if (node.innerText && node.innerText.trim() === labelText && node.children.length === 0) {
                    // Walk up — find closest [role="button"] or [role="combobox"]
                    var parent = node.parentElement;
                    for (var i = 0; i < 8; i++) {
                      if (!parent) break;
                      var r = parent.getAttribute('role');
                      if (r === 'button' || r === 'combobox') return parent;
                      parent = parent.parentElement;
                    }
                  }
                }
                return null;
              }

              // ── Bézier curve pointer movement ──────────────────────────────
              // Moves the pointer from (x0,y0) to (x1,y1) along a cubic Bézier
              // curve with two randomized control points, dispatching mousemove
              // events at each step. Prevents straight-line movement signatures.
              async function bezierMove(x0, y0, x1, y1) {
                var cp1x = x0 + (Math.random() * (x1 - x0) * 0.5);
                var cp1y = y0 + (Math.random() - 0.5) * 120;
                var cp2x = x0 + (Math.random() * (x1 - x0) * 0.8 + (x1 - x0) * 0.2);
                var cp2y = y1 + (Math.random() - 0.5) * 120;
                var steps = 8 + Math.floor(Math.random() * 6); // 8-13 steps
                for (var s = 0; s <= steps; s++) {
                  var t = s / steps;
                  var mt = 1 - t;
                  var x = mt*mt*mt*x0 + 3*mt*mt*t*cp1x + 3*mt*t*t*cp2x + t*t*t*x1;
                  var y = mt*mt*mt*y0 + 3*mt*mt*t*cp1y + 3*mt*t*t*cp2y + t*t*t*y1;
                  document.dispatchEvent(new MouseEvent('mousemove', {
                    bubbles: true, cancelable: true,
                    clientX: Math.round(x), clientY: Math.round(y)
                  }));
                  await wait(10 + Math.random() * 20);
                }
              }

              // ── Trust event simulation ─────────────────────────────────────────
              // Full touchstart → delay → touchend → focus sequence.
              // Never uses .click() directly — bare click() is a bot signal.
              async function humanTouch(el) {
                var rect = el.getBoundingClientRect();
                // Randomize tap point within the middle 40% of the element
                var x = rect.left + rect.width  * (0.3 + Math.random() * 0.4);
                var y = rect.top  + rect.height * (0.3 + Math.random() * 0.4);

                // Move pointer to element along a Bézier curve first
                var fromX = x + (Math.random() - 0.5) * 200;
                var fromY = y + (Math.random() - 0.5) * 200;
                await bezierMove(fromX, fromY, x, y);

                var touch = new Touch({
                  identifier: Math.floor(Math.random() * 9999),
                  target: el,
                  clientX: x, clientY: y,
                  radiusX: 10 + Math.random() * 15,
                  radiusY: 10 + Math.random() * 15,
                  force: 0.5 + Math.random() * 0.5,
                  rotationAngle: Math.random() * 360,
                });

                el.dispatchEvent(new TouchEvent('touchstart', {
                  bubbles: true, cancelable: true,
                  touches: [touch], targetTouches: [touch], changedTouches: [touch],
                }));

                await wait(40 + Math.random() * 60); // 40-100ms hold

                el.dispatchEvent(new TouchEvent('touchend', {
                  bubbles: true, cancelable: true,
                  touches: [], targetTouches: [], changedTouches: [touch],
                }));

                await wait(20 + Math.random() * 30);
                el.focus();
                await wait(80 + Math.random() * 120);
              }

              // Category mapping - maps our app categories to Facebook's ACTUAL dropdown options
              const categoryMap = {
                "electronics": "Electronics",
                "clothing": "Clothing & Shoes",
                "apparel": "Clothing & Shoes",
                "furniture": "Furniture",
                "books": "Books, films & music",
                "entertainment": "Entertainment",
                "sporting": "Sporting Goods",
                "sporting goods": "Sporting Goods",
                "toys": "Toys & Games",
                "toys & games": "Toys & Games",
                "home": "Household",
                "home goods": "Household",
                "home & garden": "Home & garden",
                "household": "Household",
                "automotive": "Vehicles",
                "vehicles": "Vehicles",
                "beauty": "Beauty & Personal Care",
                "jewelry": "Jewelry & Accessories",
                "musical": "Musical Instruments",
                "musical instruments": "Musical Instruments",
                "pet": "Pet Supplies",
                "pet supplies": "Pet Supplies",
                "office": "Office Supplies",
                "tools": "Tools",
                "garden": "Garden",
                "appliances": "Appliances",
                "other": "Household",
              };

              // Stealth-types text into an input/textarea/contenteditable.
              // Implements all anti-bot detection techniques:
              // 1. Focus first (real users click before typing)
              // 2. Character-by-character with randomized delays (40-200ms jitter)
              // 3. Dispatch keydown + input events per character (React state sync)
              // 4. Typo simulation (3% chance)
              // 5. Variable typing speed (faster for common words, slower for complex)
              // 6. Micro-pauses between words (200-400ms)
              // 7. Occasional hesitation mid-sentence (5% chance, 500-1000ms)
              async function stealthType(el, text, skipClear = false) {
                // Always focus first — real users click the field
                el.focus();
                await wait(150 + Math.random() * 100);

                // Clear existing value first (unless skipClear is true)
                if (!skipClear) {
                  if (el.isContentEditable) {
                    el.select && el.select();
                    document.execCommand('selectAll', false, null);
                    document.execCommand('delete', false, null);
                  } else {
                    el.select && el.select();
                    document.execCommand('selectAll', false, null);
                    document.execCommand('delete', false, null);
                  }
                  await wait(80 + Math.random() * 60);
                }

                // Type character by character with human-like rhythm
                for (let i = 0; i < text.length; i++) {
                  const char = text[i];
                  
                  // Micro-pause between words (space character)
                  if (char === ' ' && i > 0) {
                    await wait(200 + Math.random() * 200); // 200-400ms pause between words
                  }
                  
                  // Occasional hesitation mid-sentence (5% chance)
                  if (Math.random() < 0.05 && i > 5 && i < text.length - 5) {
                    await wait(500 + Math.random() * 500); // 500-1000ms thinking pause
                  }
                  
                  // Typo simulation: 3% chance, not on last 2 chars or spaces
                  const shouldTypo = Math.random() < 0.03 && i < text.length - 2 && char !== ' ';

                  if (shouldTypo) {
                    const wrong = 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
                    // Dispatch keydown for wrong character
                    el.dispatchEvent(new KeyboardEvent('keydown', { key: wrong, bubbles: true }));
                    document.execCommand('insertText', false, wrong);
                    el.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: wrong, bubbles: true }));
                    await wait(280 + Math.random() * 180);
                    // Realize mistake, backspace
                    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
                    document.execCommand('delete', false, null);
                    el.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward', bubbles: true }));
                    await wait(80 + Math.random() * 80);
                  }

                  // Dispatch keydown event BEFORE inserting character (real browser behavior)
                  el.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
                  
                  const inserted = document.execCommand('insertText', false, char);
                  if (!inserted) {
                    // execCommand failed — fall back based on element type
                    if (el.isContentEditable) {
                      const textNode = document.createTextNode(char);
                      const selection = window.getSelection();
                      if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        range.deleteContents();
                        range.insertNode(textNode);
                        range.setStartAfter(textNode);
                        range.setEndAfter(textNode);
                        selection.removeAllRanges();
                        selection.addRange(range);
                      } else {
                        el.textContent += char;
                      }
                    } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                      var descriptor = Object.getOwnPropertyDescriptor(
                        el.tagName === 'INPUT' ? window.HTMLInputElement.prototype : window.HTMLTextAreaElement.prototype,
                        'value'
                      );
                      if (descriptor && descriptor.set) {
                        descriptor.set.call(el, el.value + char);
                      } else {
                        el.value += char;
                      }
                    } else {
                      el.textContent += char;
                    }
                  }
                  
                  // Dispatch input event (React state sync)
                  el.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: char, bubbles: true }));
                  
                  // Randomized delay: 40-200ms per character (human typing speed)
                  // Faster for common characters (vowels, space), slower for numbers/symbols
                  let baseDelay = 60;
                  if (/[0-9!@#$%^&*()]/.test(char)) {
                    baseDelay = 100; // Slower for numbers/symbols
                  } else if (/[aeiou ]/.test(char.toLowerCase())) {
                    baseDelay = 40; // Faster for vowels and spaces
                  } else if (/[A-Z]/.test(char)) {
                    baseDelay = 80; // Slightly slower for capitals (shift key)
                  }
                  await wait(baseDelay + Math.random() * 140);
                }

                // Dispatch change event after typing completes
                el.dispatchEvent(new Event('change', { bubbles: true }));
                await wait(120 + Math.random() * 80);
                
                // Blur the field (user moves to next field)
                el.dispatchEvent(new Event('blur', { bubbles: true }));
                el.blur();
              }

              async function fillTextField(ariaLabel, value) {
                const input = findInput(ariaLabel);
                if (!input) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FIELD_NOT_FOUND', field: ariaLabel }));
                  return false;
                }
                input.scrollIntoView({ block: 'center' });
                await wait(300 + Math.random() * 200);
                await humanTouch(input);
                await wait(300 + Math.random() * 200);
                await stealthType(input, value);
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FIELD_FILLED', field: ariaLabel }));
                return true;
              }

              async function expandMoreDetails() {
                var buttons = Array.from(document.querySelectorAll('div[role="button"], span, a'));
                var btn = null;
                for (var bi = 0; bi < buttons.length; bi++) {
                  var bt = buttons[bi].innerText ? buttons[bi].innerText.trim().toLowerCase() : '';
                  if (bt === 'more details' || bt === 'additional details') { btn = buttons[bi]; break; }
                }
                if (!btn) return false;
                btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await wait(800);
                btn.click();
                // Wait for accordion CSS animation
                await wait(2000);
                // Scroll to bottom — forces mobile browser to lazy-render Description field
                window.scrollTo(0, document.body.scrollHeight);
                await wait(2000);
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MORE_DETAILS_CLICKED' }));
                return true;
              }

              async function fillDescription(text) {
                // Ensure More details is expanded before polling for Description field
                var ceCheck = document.querySelector('div[aria-label="Description"][role="textbox"], textarea[aria-label="Description"], [name="description"]');
                if (!ceCheck) {
                  await expandMoreDetails();
                }
                var desc = null;
                for (var attempt = 0; attempt < 10; attempt++) {
                  // Re-scroll to bottom each attempt — forces lazy render
                  window.scrollTo(0, document.body.scrollHeight);
                  await wait(1000);

                  // Priority 1: explicit aria-label
                  desc = document.querySelector('div[aria-label="Description"][role="textbox"]')
                    || document.querySelector('textarea[aria-label="Description"]')
                    || document.querySelector('[name="description"]');

                  // Priority 2: find by label text — walk up to contenteditable sibling/child
                  if (!desc) {
                    var allNodes = Array.from(document.querySelectorAll('span, label, div'));
                    for (var ni = 0; ni < allNodes.length; ni++) {
                      var nd = allNodes[ni];
                      if (nd.children.length === 0 && nd.innerText && nd.innerText.trim() === 'Description') {
                        var par = nd.parentElement;
                        for (var pi = 0; pi < 6; pi++) {
                          if (!par) break;
                          var ce = par.querySelector('[contenteditable="true"], textarea');
                          if (ce) { desc = ce; break; }
                          par = par.parentElement;
                        }
                        if (desc) break;
                      }
                    }
                  }

                  // Priority 3: pick the LAST contenteditable (bottommost = Description)
                  if (!desc) {
                    var editables = Array.from(document.querySelectorAll('div[contenteditable="true"], textarea'));
                    if (editables.length > 0) desc = editables[editables.length - 1];
                  }

                  // On attempt 3, log what contenteditable elements exist for diagnosis
                  if (!desc && attempt === 2) {
                    var ceAll = Array.from(document.querySelectorAll('[contenteditable], textarea, [role="textbox"]'));
                    var ceInfo = [];
                    for (var ci = 0; ci < ceAll.length; ci++) {
                      ceInfo.push(ceAll[ci].tagName + '|' + ceAll[ci].getAttribute('aria-label') + '|' + ceAll[ci].getAttribute('role'));
                    }
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'DESC_DEBUG', elements: ceInfo }));
                  }

                  if (desc) break;
                }

                if (!desc) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FIELD_NOT_FOUND', field: 'Description' }));
                  return false;
                }

                desc.scrollIntoView({ block: 'center' });
                await wait(500);
                await humanTouch(desc);
                await wait(300);
                await stealthType(desc, text);
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FIELD_FILLED', field: 'Description' }));
                return true;
              }

              // ── MutationObserver: watch for dynamic fields after category selection ──
              function watchForDynamicFields(callback) {
                const observer = new MutationObserver((mutations) => {
                  for (const mutation of mutations) {
                    if (mutation.addedNodes.length > 0) {
                      const newInputs = Array.from(mutation.addedNodes)
                        .filter(node => node.nodeType === 1)
                        .flatMap(node => [
                          ...Array.from(node.querySelectorAll('input, textarea, select, [role="combobox"]')),
                          node.matches && node.matches('input, textarea, select, [role="combobox"]') ? node : null
                        ])
                        .filter(Boolean);
                      
                      if (newInputs.length > 0) {
                        callback(newInputs);
                      }
                    }
                  }
                });
                
                observer.observe(document.body, {
                  childList: true,
                  subtree: true,
                });
                
                return observer;
              }

              // ── Scroll dropdown container to load lazy-rendered options ──
              async function scrollDropdownToLoadAll(menuRoot) {
                const scrollable = menuRoot.querySelector('[role="listbox"]') || menuRoot;
                const initialHeight = scrollable.scrollHeight;
                let lastHeight = initialHeight;
                let stableCount = 0;
                
                for (let i = 0; i < 10; i++) {
                  scrollable.scrollTop = scrollable.scrollHeight;
                  await wait(300);
                  
                  const newHeight = scrollable.scrollHeight;
                  if (newHeight === lastHeight) {
                    stableCount++;
                    if (stableCount >= 2) break; // Height stable for 2 checks = all loaded
                  } else {
                    stableCount = 0;
                  }
                  lastHeight = newHeight;
                }
                
                // Scroll back to top
                scrollable.scrollTop = 0;
                await wait(200);
              }

              // ── Select dropdown by text matching (value="no-value" on all FB options) ──
              // All matching is case-insensitive. Returns the exact matched text on
              // success (truthy), or false on failure.
              async function selectDropdownByValue(labelText, _ignored, targetName, fallbackName, allowHeaderClick) {
                const trigger = findDropdownTrigger(labelText);
                if (!trigger) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'DROPDOWN_BUTTON_NOT_FOUND', field: labelText }));
                  return false;
                }

                // Normalize to lowercase once — prevents 'Home & Garden' vs 'Home & garden' mismatches
                const nameLower = targetName.trim().toLowerCase();
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'DROPDOWN_FOUND', field: labelText, targetName, nameLower }));

                const beforeTap = Array.from(document.querySelectorAll('[role="dialog"], [role="listbox"]'));

                trigger.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await wait(800);
                await humanTouch(trigger);
                trigger.click();
                await wait(2000); // Increased wait for menu to fully open

                for (let attempt = 0; attempt < 15; attempt++) { // Increased attempts from 10 to 15
                  await wait(600); // Increased wait between attempts

                  const afterTap = Array.from(document.querySelectorAll('[role="dialog"], [role="listbox"]'));
                  let menuRoot = null;
                  for (const dialog of afterTap) {
                    if (!beforeTap.includes(dialog)) { menuRoot = dialog; break; }
                  }
                  if (!menuRoot && afterTap.length > 0) menuRoot = afterTap[afterTap.length - 1];
                  if (!menuRoot) {
                    // Menu not found yet, try clicking trigger again
                    if (attempt === 3 || attempt === 7) {
                      trigger.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      await wait(500);
                      await humanTouch(trigger);
                      trigger.click();
                      await wait(1500);
                    }
                    continue;
                  }

                  // Guard: wrong panel opened
                  const menuText = menuRoot.innerText || '';
                  if (menuText.toLowerCase().includes('notifications') || menuText.toLowerCase().includes('unread')) {
                    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
                    await wait(500);
                    trigger.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    await wait(800);
                    await humanTouch(trigger);
                    trigger.click();
                    await wait(1500);
                    continue;
                  }

                  // Scroll to load all lazy-rendered options
                  await scrollDropdownToLoadAll(menuRoot);

                  // Pool: prefer [role="option"], fall back to leaf text nodes
                  const roleOpts = Array.from(menuRoot.querySelectorAll('[role="option"]'));
                  const pool = roleOpts.length > 0
                    ? roleOpts
                    : Array.from(menuRoot.querySelectorAll('div, span, li')).filter(el => el.children.length === 0);

                  // Debug: log what we found in the pool
                  if (pool.length === 0) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'DROPDOWN_POOL_EMPTY',
                      field: labelText,
                      attempt: attempt,
                      menuRootTag: menuRoot.tagName,
                      menuRootRole: menuRoot.getAttribute('role'),
                      allDivs: Array.from(menuRoot.querySelectorAll('div')).length,
                      allSpans: Array.from(menuRoot.querySelectorAll('span')).length,
                      menuInnerText: menuRoot.innerText ? menuRoot.innerText.substring(0, 200) : '',
                    }));
                    // Pool is empty, wait longer and retry
                    await wait(1000);
                    continue;
                  }

                  // Match priority: exact → option-text-includes-target → target-includes-option-text
                  const matched =
                    pool.find(el => el.textContent.trim().toLowerCase() === nameLower) ||
                    pool.find(el => el.textContent.trim().toLowerCase().includes(nameLower)) ||
                    pool.find(el => nameLower.includes(el.textContent.trim().toLowerCase()) && el.textContent.trim().length > 2);

                  if (!matched && attempt === 2) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'DROPDOWN_OPTIONS_DEBUG',
                      field: labelText,
                      targetName,
                      poolSize: pool.length,
                      sample: pool.slice(0, 60).map(el => el.textContent.trim()).filter(t => t.length > 1 && t.length < 60),
                    }));
                  }

                  if (matched) {
                    // Check if matched element is actually clickable or just a section header.
                    // Section headers have no pointer cursor and no interactive role.
                    const isClickable = (el) => {
                      const role = el.getAttribute('role');
                      if (role === 'option' || role === 'menuitem' || role === 'button') return true;
                      const style = window.getComputedStyle(el);
                      return style.cursor === 'pointer';
                    };

                    let target = matched;
                    if (!isClickable(matched) && !allowHeaderClick) {
                      // It's a section header — search within its section (up to next header)
                      // for an exact text match rather than blindly picking the first child.
                      const matchedIdx = pool.indexOf(matched);
                      // Find where the next non-clickable header starts (bounds the section)
                      let sectionEnd = matchedIdx + 1;
                      while (sectionEnd < pool.length && sectionEnd < matchedIdx + 15) {
                        if (!isClickable(pool[sectionEnd])) break; // next header found
                        sectionEnd++;
                      }
                      const sectionItems = pool.slice(matchedIdx + 1, sectionEnd);
                      // Priority 1: exact leaf match
                      const exactInSection = sectionItems.find(
                        el => el.textContent.trim().toLowerCase() === nameLower && isClickable(el)
                      );
                      // Priority 2: fallback leaf (e.g. 'Household' when 'Kitchen & dining' not rendered)
                      const fallbackLower = (fallbackName || '').toLowerCase();
                      const fallbackInSection = fallbackLower
                        ? sectionItems.find(el => el.textContent.trim().toLowerCase() === fallbackLower && isClickable(el))
                        : null;

                      const chosen = exactInSection || fallbackInSection;
                      if (chosen) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'DROPDOWN_HEADER_SKIP',
                          header: matched.textContent.trim(),
                          usedInstead: chosen.textContent.trim(),
                          wasFallback: !exactInSection,
                        }));
                        target = chosen;
                      } else {
                        // Neither exact nor fallback found — log section contents and retry
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'DROPDOWN_HEADER_NO_MATCH',
                          header: matched.textContent.trim(),
                          targetName,
                          fallbackName: fallbackLower,
                          sectionOptions: sectionItems.map(el => el.textContent.trim()).filter(t => t.length > 1),
                        }));
                        continue;
                      }
                    }

                    const matchedText = target.textContent.trim();
                    target.scrollIntoView({ block: 'center' });
                    await wait(200 + Math.random() * 150);

                    target.click();
                    target.dispatchEvent(new Event('input',  { bubbles: true }));
                    target.dispatchEvent(new Event('change', { bubbles: true }));

                    await wait(800 + Math.random() * 400);
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'DROPDOWN_SUCCESS',
                      field: labelText,
                      matchedText,
                      targetName,
                    }));
                    return matchedText;
                  }
                }

                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'DROPDOWN_OPTION_NOT_FOUND', field: labelText, targetName }));
                return false;
              }

              // ── Category drill-down: iterates through each level of the hierarchy ──
              // hierarchy = { parentName, leafName } → levels = [parentName, leafName]
              // hierarchy = null → levels = [fpcName]  (top-level, single click)
              async function selectCategoryHierarchy(fpcId, fpcName, hierarchy) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CATEGORY_HIERARCHY', fpcId, fpcName, hierarchy }));

                const levels = hierarchy && hierarchy.parentName
                  ? [hierarchy.parentName.toLowerCase(), hierarchy.leafName.toLowerCase()]
                  : [fpcName.toLowerCase()];

                for (let i = 0; i < levels.length; i++) {
                  const levelName = levels[i];
                  const isParentLevel = (i === 0 && levels.length > 1);
                  const fallback = (i === levels.length - 1 && hierarchy && hierarchy.fallbackLeaf)
                    ? hierarchy.fallbackLeaf : null;
                  
                  window.ReactNativeWebView.postMessage(JSON.stringify({ 
                    type: 'CATEGORY_LEVEL', 
                    level: i, 
                    target: levelName,
                    isParent: isParentLevel,
                    fallback: fallback
                  }));

                  const matched = await selectDropdownByValue('Category', null, levelName, fallback, isParentLevel);
                  if (!matched) {
                    // If this is level 1 (sub-category) and it failed, check if parent was already selected
                    if (i === 1) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({ 
                        type: 'CATEGORY_SUBCATEGORY_SKIP', 
                        reason: 'Sub-category not found in mobile UI, using parent category',
                        parent: levels[0],
                        attemptedLeaf: levelName
                      }));
                      // Parent category is already selected, so we're done
                      return true;
                    }
                    
                    window.ReactNativeWebView.postMessage(JSON.stringify({ 
                      type: 'CATEGORY_LEVEL_FAILED', 
                      level: i, 
                      target: levelName 
                    }));
                    return false;
                  }

                  // If more levels remain: menu closed after parent click, need to re-open it
                  if (i < levels.length - 1) {
                    await wait(2000); // Wait for FB to update state
                    
                    // Check if the Category dropdown still exists (might have navigated away)
                    const stillExists = findDropdownTrigger('Category');
                    if (!stillExists) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({ 
                        type: 'CATEGORY_DROPDOWN_GONE', 
                        reason: 'Category dropdown no longer exists after parent selection',
                        selectedParent: levelName
                      }));
                      // Dropdown is gone, parent selection was final
                      return true;
                    }
                    
                    window.ReactNativeWebView.postMessage(JSON.stringify({ 
                      type: 'CATEGORY_REOPENING', 
                      afterLevel: i,
                      nextTarget: levels[i + 1]
                    }));
                  }
                }
                return true;
              }

              async function selectDropdown(labelText, targetValue) {
                // Anchor to the label text node, walk up to closest [role="button"].
                // .closest() cannot escape the form container — notification bell
                // is never a parent of the word "Category" or "Condition".
                var allSpans = Array.from(document.querySelectorAll('span, div, label'));
                var labelNode = null;
                for (var ni = 0; ni < allSpans.length; ni++) {
                  var el = allSpans[ni];
                  if (el.children.length === 0 && el.innerText && el.innerText.trim() === labelText) {
                    labelNode = el;
                    break;
                  }
                }

                if (!labelNode) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'DROPDOWN_BUTTON_NOT_FOUND', field: labelText }));
                  return false;
                }

                var trigger = labelNode.closest('[role="button"]') || labelNode.closest('[role="combobox"]') || labelNode.parentElement;
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'DROPDOWN_FOUND', field: labelText }));

                // Snapshot existing dialogs BEFORE tapping — new ones after tap = the portal menu
                var beforeTap = Array.from(document.querySelectorAll('[role="dialog"], [role="listbox"]'));

                trigger.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await wait(800);
                // Use both humanTouch AND .click() — some FB buttons only respond to one
                await humanTouch(trigger);
                trigger.click();
                await wait(1500);

                var tv = targetValue.toLowerCase();

                for (var i = 0; i < 10; i++) {
                  await wait(500);

                  // Find dialogs that didn't exist before the tap — that's the marketplace portal
                  var afterTap = Array.from(document.querySelectorAll('[role="dialog"], [role="listbox"]'));
                  var menuRoot = null;
                  for (var di = 0; di < afterTap.length; di++) {
                    if (beforeTap.indexOf(afterTap[di]) === -1) { menuRoot = afterTap[di]; break; }
                  }
                  if (!menuRoot && afterTap.length > 0) menuRoot = afterTap[afterTap.length - 1];
                  if (!menuRoot) continue;

                  // Guard: wrong panel opened — close and retry
                  var menuText = menuRoot.innerText || '';
                  if (menuText.toLowerCase().includes('notifications') || menuText.toLowerCase().includes('unread')) {
                    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
                    await wait(500);
                    trigger.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    await wait(800);
                    await humanTouch(trigger);
                    trigger.click();
                    await wait(1500);
                    continue;
                  }

                  // Find all potential option elements - prefer leaf nodes with exact text match
                  var allOpts = Array.from(menuRoot.querySelectorAll('span, div, [role="option"], [role="listitem"]'));
                  var visibleOpts = [];
                  for (var oi = 0; oi < allOpts.length; oi++) {
                    if (allOpts[oi].offsetParent !== null) visibleOpts.push(allOpts[oi]);
                  }

                  // Filter to leaf nodes only (no children or only one text-only child)
                  var leafOpts = [];
                  for (var li = 0; li < visibleOpts.length; li++) {
                    var opt = visibleOpts[li];
                    var isLeaf = opt.children.length === 0 || 
                                 (opt.children.length === 1 && opt.children[0].children.length === 0);
                    if (isLeaf) leafOpts.push(opt);
                  }

                  // Try to find exact match in leaf nodes first
                  var target = null;
                  for (var ti = 0; ti < leafOpts.length; ti++) {
                    var elText = leafOpts[ti].innerText ? leafOpts[ti].innerText.trim().toLowerCase() : '';
                    // Normalize en-dash to hyphen for comparison
                    var normalizedElText = elText.replace(/\u2013/g, '-').replace(/\u2014/g, '-');
                    var normalizedTv = tv.replace(/\u2013/g, '-').replace(/\u2014/g, '-');
                    if (normalizedElText === normalizedTv) {
                      target = leafOpts[ti];
                      break;
                    }
                  }

                  // If no exact match, try partial match in leaf nodes (but avoid matching "New" when looking for "Like new")
                  if (!target) {
                    for (var ti = 0; ti < leafOpts.length; ti++) {
                      var elText = leafOpts[ti].innerText ? leafOpts[ti].innerText.trim().toLowerCase() : '';
                      var normalizedElText = elText.replace(/\u2013/g, '-').replace(/\u2014/g, '-');
                      var normalizedTv = tv.replace(/\u2013/g, '-').replace(/\u2014/g, '-');
                      // Only match if target contains element text (not the other way around)
                      // This prevents "New" from matching when we're looking for "Like new"
                      if (normalizedTv.includes(normalizedElText) && normalizedElText.length > 2) {
                        target = leafOpts[ti];
                        break;
                      }
                    }
                  }

                  if (target) {
                    // Find the exact clickable option — skip section headers (no role, parent of other options)
                    var clickEl = target;
                    
                    // If target has role="option", use it directly
                    if (target.getAttribute('role') === 'option') {
                      clickEl = target;
                    } else {
                      // Otherwise, look for a clickable parent or child with role="option"
                      var parent = target.parentElement;
                      for (var pi = 0; pi < 3; pi++) {
                        if (!parent) break;
                        if (parent.getAttribute('role') === 'option') {
                          clickEl = parent;
                          break;
                        }
                        parent = parent.parentElement;
                      }
                    }
                    
                    clickEl.scrollIntoView({ block: 'center' });
                    await wait(200 + Math.random() * 150);
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'DROPDOWN_CLICKING',
                      field: labelText,
                      tag: clickEl.tagName,
                      role: clickEl.getAttribute('role'),
                      text: clickEl.innerText ? clickEl.innerText.trim().substring(0, 50) : '',
                      childCount: clickEl.children.length,
                    }));
                    clickEl.click();
                    clickEl.dispatchEvent(new Event('input',  { bubbles: true }));
                    clickEl.dispatchEvent(new Event('change', { bubbles: true }));
                    await wait(800 + Math.random() * 400);
                    const clickedText = clickEl.innerText ? clickEl.innerText.trim() : targetValue;
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'DROPDOWN_SUCCESS', field: labelText, matchedText: clickedText, targetName: targetValue }));
                    return true;
                  }

                  if (i === 3) {
                    var sample = [];
                    for (var si = 0; si < leafOpts.length; si++) {
                      var st = leafOpts[si].innerText ? leafOpts[si].innerText.trim() : '';
                      if (st && st.length > 1 && st.length < 60) sample.push(st);
                      if (sample.length >= 100) break;
                    }
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'DROPDOWN_VISIBLE_OPTIONS', field: labelText, sample: sample }));
                  }
                }

                var diagMenus = Array.from(document.querySelectorAll('[role="dialog"], [role="listbox"]'));
                var diagRoot = diagMenus.length > 0 ? diagMenus[diagMenus.length - 1] : document.body;
                var diagSpans = Array.from(diagRoot.querySelectorAll('span'));
                var spanTexts = [];
                for (var li = 0; li < diagSpans.length; li++) {
                  var lt = diagSpans[li].innerText ? diagSpans[li].innerText.trim() : '';
                  if (lt && lt.length > 1 && lt.length < 80) spanTexts.push(lt);
                  if (spanTexts.length >= 100) break;
                }
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'DROPDOWN_OPTION_NOT_FOUND',
                  field: labelText,
                  targetValue: targetValue,
                  availableOptions: spanTexts,
                }));
                return false;
              }

              // Random scroll function to simulate reviewing the form
              async function randomScroll() {
                const scrollAmount = Math.random() > 0.5 
                  ? -(50 + Math.random() * 100)  // Scroll up
                  : (50 + Math.random() * 100);   // Scroll down
                
                window.scrollBy({
                  top: scrollAmount,
                  behavior: 'smooth'
                });
                
                await wait(500 + Math.random() * 500);
              }

              async function fillAllFields() {
                try {
                  let success = true;
                  let failedFields = [];

                  // Behavioral stealth: simulate human reading + scrolling before starting
                  // Real users orient themselves to the page first
                  await wait(3000 + Math.random() * 2000); // 3-5 seconds initial pause
                  
                  // Random scroll to simulate reviewing the form (anti-static-session detection)
                  const scrollAmount = Math.random() > 0.5 ? 100 + Math.random() * 150 : -(100 + Math.random() * 150);
                  window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
                  await wait(1200 + Math.random() * 800); // 1.2-2 seconds watching scroll
                  
                  // Scroll back to top
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  await wait(1500 + Math.random() * 1000); // 1.5-2.5 seconds
                  if (killSwitchTriggered) return;

                  // Fill Title - with longer pre-field pause
                  await wait(800 + Math.random() * 700); // 0.8-1.5s thinking before first field
                  if (killSwitchTriggered) return;
                  if (!await fillTextField('Title', "${listingName}")) {
                    success = false;
                    failedFields.push('Title');
                  }

                  // Random scroll (simulate reviewing) - 40% chance
                  if (Math.random() < 0.4) await randomScroll();
                  if (killSwitchTriggered) return;

                  // Fill Price - variable delay between fields
                  await wait(1200 + Math.random() * 800); // 1.2-2 seconds between fields
                  if (killSwitchTriggered) return;
                  if (!await fillTextField('Price', "${fbPrice}")) {
                    success = false;
                    failedFields.push('Price');
                  }

                  // Random scroll - 40% chance
                  if (Math.random() < 0.4) await randomScroll();
                  if (killSwitchTriggered) return;

                  // Select Category - longer pause before dropdown interaction
                  await wait(2000 + Math.random() * 1000); // 2-3 seconds
                  if (killSwitchTriggered) return;
                  const fpcId = "${fbCategoryId}";
                  const fpcName = "${fbCategoryName}";
                  const fpcHierarchy = ${fbHierarchy};
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CATEGORY_MAPPING', fpcId, fpcName, fpcHierarchy }));

                  // Start MutationObserver to watch for dynamic fields (Brand, Size, etc.)
                  const fieldObserver = watchForDynamicFields((newFields) => {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'DYNAMIC_FIELDS_DETECTED',
                      count: newFields.length,
                      fields: newFields.map(f => f.getAttribute('aria-label') || f.getAttribute('name') || f.tagName).slice(0, 10),
                    }));
                  });

                  if (!await selectCategoryHierarchy(fpcId, fpcName, fpcHierarchy)) {
                    success = false;
                    failedFields.push('Category');
                  }

                  // Poll up to 3s for dynamic fields injected by FB after category selection
                  // (e.g. Brand, Model for Electronics; Size, Color for Clothing)
                  const dynamicLabels = ['Brand', 'Model', 'Size', 'Color', 'Gender'];
                  const attributes = ${fbAttributes};
                  let dynamicWait = 0;
                  while (dynamicWait < 3000) {
                    await wait(400);
                    dynamicWait += 400;
                    let filled = false;
                    for (const label of dynamicLabels) {
                      const el = findInput(label);
                      if (el && !el.dataset.snapFilled) {
                        const val = attributes[label.toLowerCase()] || attributes[label] || '';
                        if (val) {
                          el.dataset.snapFilled = '1';
                          await stealthType(el, val);
                          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'DYNAMIC_FIELD_FILLED', field: label, value: val }));
                          filled = true;
                        }
                      }
                    }
                    // Stop polling once stable (no new fields for 800ms)
                    if (!filled && dynamicWait > 800) break;
                  }
                  fieldObserver.disconnect();

                  // Human thinking pause before Condition (300–800ms jitter)
                  await wait(300 + Math.random() * 500);

                  // Random scroll
                  if (Math.random() < 0.3) await randomScroll();
                  if (killSwitchTriggered) return;

                  // Select Condition
                  await wait(2000 + Math.random() * 500);
                  if (killSwitchTriggered) return;
                  if (!await selectDropdown('Condition', "${fbCondition}")) {
                    success = false;
                    failedFields.push('Condition');
                  }

                  // Random scroll
                  if (Math.random() < 0.3) await randomScroll();
                  if (killSwitchTriggered) return;

                  // Expand hidden fields — FB lazy-loads Description behind "More details" accordion
                  await wait(1000 + Math.random() * 500);
                  await expandMoreDetails();
                  if (killSwitchTriggered) return;

                  // Fill Description
                  await wait(2000 + Math.random() * 500);
                  if (killSwitchTriggered) return;
                  if (!await fillDescription("${fbDescription}")) {
                    success = false;
                    failedFields.push('Description');
                  }

                  // Fill Product Tags with Total Interception script
                  await wait(1500 + Math.random() * 500);
                  if (killSwitchTriggered) return;
                  const tags = ${fbTags};
                  if (tags && tags.length > 0) {
                    // Install continuous monitoring script that re-binds on every FB re-render
                    const tagInterceptionScript = '(function() { function forceTag(input) { if (input.dataset.tagHooked) return; input.dataset.tagHooked = "true"; input.addEventListener("input", function(e) { const val = e.target.value; if (val.endsWith(",") || val.endsWith(" ")) { e.target.value = val.slice(0, -1); ["keydown", "keypress", "keyup"].forEach(type => { const event = new KeyboardEvent(type, { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true, cancelable: true }); e.target.dispatchEvent(event); }); setTimeout(function() { e.target.blur(); setTimeout(function() { e.target.focus(); }, 50); }, 10); } }); } setInterval(function() { const tagInput = document.querySelector("input[placeholder*=Tag]") || document.querySelector("label[aria-label*=Tag] input") || document.querySelector("[role=textbox][aria-label*=Tag]"); if (tagInput) forceTag(tagInput); }, 1000); })();';
                    
                    // Inject the interception script first
                    eval(tagInterceptionScript);
                    await wait(500);
                    
                    const tagInput = findInput('Product tags') || findInput('Tags');
                    if (tagInput) {
                      // Vary number of tags occasionally (anti-identical-footprint)
                      const tagsToUse = tags.length > 5 && Math.random() < 0.3 
                        ? tags.slice(0, Math.floor(tags.length * 0.7))
                        : tags;
                      
                      for (let i = 0; i < tagsToUse.length; i++) {
                        const tag = tagsToUse[i];
                        
                        // Focus the input
                        tagInput.focus();
                        await wait(200 + Math.random() * 200);
                        
                        // Type tag character-by-character
                        for (let charIdx = 0; charIdx < tag.length; charIdx++) {
                          const char = tag[charIdx];
                          
                          // Typo simulation: 2% chance
                          const shouldTypo = Math.random() < 0.02 && charIdx < tag.length - 2 && char !== ' ';
                          if (shouldTypo) {
                            const wrong = 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
                            tagInput.dispatchEvent(new KeyboardEvent('keydown', { key: wrong, bubbles: true }));
                            document.execCommand('insertText', false, wrong);
                            tagInput.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: wrong, bubbles: true }));
                            await wait(280 + Math.random() * 180);
                            tagInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
                            document.execCommand('delete', false, null);
                            tagInput.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward', bubbles: true }));
                            await wait(80 + Math.random() * 80);
                          }
                          
                          // Insert character
                          tagInput.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
                          const inserted = document.execCommand('insertText', false, char);
                          if (!inserted) {
                            if (tagInput.isContentEditable) {
                              tagInput.textContent += char;
                            } else if (tagInput.tagName === 'INPUT' || tagInput.tagName === 'TEXTAREA') {
                              const descriptor = Object.getOwnPropertyDescriptor(
                                tagInput.tagName === 'INPUT' ? window.HTMLInputElement.prototype : window.HTMLTextAreaElement.prototype,
                                'value'
                              );
                              if (descriptor && descriptor.set) {
                                descriptor.set.call(tagInput, tagInput.value + char);
                              } else {
                                tagInput.value += char;
                              }
                            } else {
                              tagInput.textContent += char;
                            }
                          }
                          
                          tagInput.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: char, bubbles: true }));
                          
                          let baseDelay = 50;
                          if (/[0-9!@#$%^&*()]/.test(char)) {
                            baseDelay = 80;
                          } else if (/[aeiou ]/.test(char.toLowerCase())) {
                            baseDelay = 40;
                          }
                          await wait(baseDelay + Math.random() * 100);
                        }
                        
                        // Force commit via multiple strategies
                        await wait(100);
                        
                        // Strategy 1: Send Enter key BEFORE comma (most reliable)
                        ['keydown', 'keypress', 'keyup'].forEach(type => {
                          tagInput.dispatchEvent(new KeyboardEvent(type, {
                            key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
                            bubbles: true, cancelable: true
                          }));
                        });
                        await wait(150);
                        
                        // Strategy 2: Clear the input value (force React to process)
                        const descriptor = Object.getOwnPropertyDescriptor(
                          tagInput.tagName === 'INPUT' ? window.HTMLInputElement.prototype : window.HTMLTextAreaElement.prototype,
                          'value'
                        );
                        if (descriptor && descriptor.set) {
                          descriptor.set.call(tagInput, '');
                        } else {
                          tagInput.value = '';
                        }
                        tagInput.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward', bubbles: true }));
                        tagInput.dispatchEvent(new Event('change', { bubbles: true }));
                        await wait(100);
                        
                        // Strategy 3: Blur/focus cycle to ensure React processes
                        tagInput.blur();
                        await wait(100);
                        tagInput.focus();
                        await wait(200);
                        
                        // Human-like variable delay between tags
                        let baseDelay = 400;
                        if (i < 2) {
                          baseDelay = 600;
                        } else if (i >= tagsToUse.length - 2) {
                          baseDelay = 700;
                        }
                        
                        if (i < tagsToUse.length - 1) {
                          await wait(baseDelay + Math.random() * 500);
                        }
                      }
                      window.ReactNativeWebView.postMessage(JSON.stringify({ 
                        type: 'FIELD_FILLED', 
                        field: 'Product tags', 
                        count: tagsToUse.length
                      }));
                    } else {
                      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FIELD_NOT_FOUND', field: 'Product tags' }));
                    }
                  }

                  clearInterval(killSwitchInterval);
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'FORM_FILLED',
                    success: success,
                    failedFields: failedFields,
                    filledCount: 6 - failedFields.length,
                  }));
                } catch (error) {
                  clearInterval(killSwitchInterval);
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'ERROR',
                    message: error.toString(),
                  }));
                }
              }

              fillAllFields();
            })();
            true;
          `;

          webViewRef.current?.injectJavaScript(fillFormScript);
        }, 5000); // Wait 5 seconds for page to fully render
      }

      // Sell mode: detect successful listing creation
      if (navState.url.includes('/marketplace/item/') && !hasConnected) {
        console.log('[FB_SELL] Listing published successfully!');
        setHasConnected(true);
        await storageService.setLastPublishTime(userId);

        Alert.alert(
          'Published Successfully',
          'Your listing has been published to Facebook Marketplace!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('ListingSuccess', {
                productName: listingData.name,
                selectedPlatforms: { facebook: true },
                publishResults: {
                  facebook: {
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
      console.log(`[FB_${mode.toUpperCase()}] Message received:`, data);

      if (data.type === 'PROFILE_EXTRACTED') {
        console.log('[FB_LOGIN] Profile extracted:', data.userName);
        
        // Save connection with profile info
        const connectionData = {
          connected: true,
          connectedAt: new Date().toISOString(),
          userName: data.userName,
          profilePic: '',
        };

        await storageService.savePlatformToken(userId, 'facebook', connectionData);
        console.log('[FB_LOGIN] Connection saved with profile data');

        // Navigate back
        navigation.goBack();
        
        // Show success alert
        setTimeout(() => {
          Alert.alert(
            'Successfully Connected',
            `Connected as ${data.userName}\n\nYou can now publish listings to Facebook Marketplace.`,
            [{ text: 'OK' }]
          );
        }, 500);
      } else if (mode === 'sell' && data.type === 'DEBUG_INPUTS') {
        console.log('[FB_SELL] Available inputs:', data.inputs);
      } else if (mode === 'sell' && data.type === 'FIELD_FILLED') {
        console.log('[FB_SELL] Field filled:', data.field);
      } else if (mode === 'sell' && data.type === 'FIELD_NOT_FOUND') {
        console.log('[FB_SELL] Field not found:', data.field);
      } else if (mode === 'sell' && data.type === 'MORE_DETAILS_CLICKED') {
        console.log('[FB_SELL] More details expanded');
      } else if (mode === 'sell' && data.type === 'DESC_DEBUG') {
        console.log('[FB_SELL] Contenteditable elements after expansion:', data.elements);
      } else if (mode === 'sell' && data.type === 'DROPDOWN_VISIBLE_OPTIONS') {
        console.log('[FB_SELL] Visible options in menu for', data.field, ':', data.sample);
      } else if (mode === 'sell' && data.type === 'DROPDOWN_DEBUG') {
        console.log('[FB_SELL] Dropdown debug — roles in DOM:', data.rolesFound);
        console.log('[FB_SELL] Body snippet:', data.bodySnippet);
      } else if (mode === 'sell' && data.type === 'DROPDOWN_FOUND') {
        console.log('[FB_SELL] Dropdown found:', data.field);
      } else if (mode === 'sell' && data.type === 'DROPDOWN_CLICKING') {
        console.log('[FB_SELL] Clicking option:', data.field, '| tag:', data.tag, '| role:', data.role, '| text:', data.text, '| children:', data.childCount);
      } else if (mode === 'sell' && data.type === 'DROPDOWN_SUCCESS') {
        console.log('[FB_SELL] Dropdown selected:', data.field, '=', data.matchedText, '(target:', data.targetName, ')');
      } else if (mode === 'sell' && data.type === 'DROPDOWN_NOT_FOUND') {
        console.log('[FB_SELL] Dropdown not found:', data.field);
      } else if (mode === 'sell' && data.type === 'DROPDOWN_OPTION_NOT_FOUND') {
        console.log('[FB_SELL] Dropdown option not found:', data.field, 'looking for:', data.targetText);
        console.log('[FB_SELL] Available options:', data.availableOptions);
      } else if (mode === 'sell' && data.type === 'DROPDOWN_POOL_EMPTY') {
        console.log('[FB_SELL] Dropdown pool empty for:', data.field);
        console.log('[FB_SELL] Menu root:', data.menuRootTag, 'role:', data.menuRootRole);
        console.log('[FB_SELL] Divs:', data.allDivs, 'Spans:', data.allSpans);
        console.log('[FB_SELL] Menu text:', data.menuInnerText);
      } else if (mode === 'sell' && data.type === 'DROPDOWN_OPTIONS_DEBUG') {
        console.log('[FB_SELL] Dropdown options debug for:', data.field);
        console.log('[FB_SELL] Target:', data.targetName, 'Pool size:', data.poolSize);
        console.log('[FB_SELL] Sample options:', data.sample);
      } else if (mode === 'sell' && data.type === 'CATEGORY_SUBCATEGORY_SKIP') {
        console.log('[FB_SELL] Skipping sub-category:', data.reason);
        console.log('[FB_SELL] Using parent:', data.parent, '(attempted leaf:', data.attemptedLeaf, ')');
      } else if (mode === 'sell' && data.type === 'CATEGORY_DROPDOWN_GONE') {
        console.log('[FB_SELL] Category dropdown disappeared:', data.reason);
        console.log('[FB_SELL] Selected parent:', data.selectedParent);
      } else if (mode === 'sell' && data.type === 'NEXT_CLICKED') {
        console.log('[FB_SELL] Next button clicked, checking for group selection or Publish screen...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check if group selection dialog appeared
        const groupSelectionScript = `
          (function() {
            const dialog = document.querySelector('[role="dialog"]');
            if (!dialog) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'NO_GROUP_DIALOG' }));
              return;
            }
            
            const dialogText = dialog.innerText || '';
            if (dialogText.includes('List in more places') || dialogText.includes('Share to groups')) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'GROUP_DIALOG_FOUND' }));
            } else {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'NO_GROUP_DIALOG' }));
            }
          })();
          true;
        `;
        webViewRef.current?.injectJavaScript(groupSelectionScript);
      } else if (mode === 'sell' && data.type === 'GROUP_DIALOG_FOUND') {
        console.log('[FB_SELL] Group selection dialog detected');
        
        // Show helpful tip instead of auto-selecting
        Alert.alert(
          '💡 Boost Your Reach',
          'Facebook is asking if you want to share to groups.\n\nTip: Select 3-5 relevant groups to get more views!\n\nTap "Skip" if you want to post without groups.',
          [{ text: 'Got it' }]
        );
        
        // User handles group selection manually
        // App will detect when they click Next and proceed to Publish screen
      } else if (mode === 'sell' && data.type === 'NO_GROUP_DIALOG') {
        console.log('[FB_SELL] No group dialog, proceeding to Publish screen...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const publishScript = `
          (async function() {
            try {
              // Poll for Publish button (up to 10 attempts = 20s)
              for (var attempt = 0; attempt < 10; attempt++) {
                await new Promise(r => setTimeout(r, 2000));
                var buttons = Array.from(document.querySelectorAll('[role="button"], button, span'));
                var publishBtn = buttons.find(function(btn) {
                  var t = btn.innerText ? btn.innerText.trim() : '';
                  return t === 'Publish' || btn.getAttribute('aria-label') === 'Publish';
                });

                if (!publishBtn) continue;

                var isDisabled = publishBtn.getAttribute('aria-disabled') === 'true' || publishBtn.disabled;
                if (isDisabled) continue;

                // Human jitter: 2–4s pause mimicking final review
                var jitter = Math.floor(Math.random() * 2000) + 2000;
                await new Promise(r => setTimeout(r, jitter));

                publishBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await new Promise(r => setTimeout(r, 800));

                ['mousedown', 'mouseup', 'click'].forEach(function(evt) {
                  publishBtn.dispatchEvent(new MouseEvent(evt, { view: window, bubbles: true, cancelable: true, buttons: 1 }));
                });
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PUBLISH_CLICKED' }));

                // Post-publish verification: poll for button disappearance (up to 10s)
                for (var vi = 0; vi < 10; vi++) {
                  await new Promise(r => setTimeout(r, 1000));
                  var stillThere = Array.from(document.querySelectorAll('[role="button"], button, span'))
                    .find(function(btn) { return btn.innerText && btn.innerText.trim() === 'Publish'; });
                  if (!stillThere) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PUBLISH_CONFIRMED' }));
                    return;
                  }
                }
                // Publish button still visible after 10s — likely blocked
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PUBLISH_BLOCKED' }));
                return;
              }

              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PUBLISH_TIMEOUT' }));
            } catch(e) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PUBLISH_ERROR', reason: e.toString() }));
            }
          })();
          true;
        `;
        webViewRef.current?.injectJavaScript(publishScript);
      } else if (mode === 'sell' && data.type === 'GROUP_SCAN_COMPLETE') {
        console.log('[FB_SELL] Found', data.totalGroups, 'groups to scan');
      } else if (mode === 'sell' && data.type === 'GROUP_SELECTION_PLAN') {
        console.log('[FB_SELL] 🎲 Found', data.totalRelevant, 'relevant groups, randomly selecting', data.willSelect, 'groups');
      } else if (mode === 'sell' && data.type === 'GROUPS_SELECTED') {
        console.log('[FB_SELL] Auto-selected', data.count, 'relevant groups:', data.groups);
      } else if (mode === 'sell' && data.type === 'GROUP_NEXT_CLICKED') {
        console.log('[FB_SELL] Group selection complete, proceeding to Publish...');
      } else if (mode === 'sell' && data.type === 'GROUP_NEXT_NOT_FOUND') {
        console.warn('[FB_SELL] Next button not found after group selection');
        Alert.alert('Groups Selected', 'Tap Next manually to continue.', [{ text: 'OK' }]);
      } else if (mode === 'sell' && data.type === 'GROUP_SELECTION_ERROR') {
        console.error('[FB_SELL] Group selection error:', data.error);
      } else if (mode === 'sell' && data.type === 'GROUP_SELECTION_FAILED') {
        console.warn('[FB_SELL] Group selection failed:', data.reason);
      } else if (mode === 'sell' && data.type === 'PUBLISH_CLICKED') {
        console.log('[FB_SELL] Publish button clicked, verifying...');
      } else if (mode === 'sell' && data.type === 'PUBLISH_CONFIRMED') {
        console.log('[FB_SELL] Listing confirmed live');
        await storageService.setLastPublishTime(userId);
        navigation.navigate('ListingSuccess', {
          productName: listingData.name,
          selectedPlatforms: { facebook: true },
          publishResults: { facebook: { success: true } },
        });
      } else if (mode === 'sell' && data.type === 'PUBLISH_BLOCKED') {
        console.warn('[FB_SELL] Publish button still visible after 10s — likely blocked');
        Alert.alert('Listing May Be Blocked', 'Facebook did not confirm the listing. Check Marketplace manually.', [{ text: 'OK' }]);
      } else if (mode === 'sell' && data.type === 'PUBLISH_TIMEOUT') {
        console.warn('[FB_SELL] Publish button never appeared');
        Alert.alert('Publish Screen Not Found', 'Tap Publish manually to complete the listing.', [{ text: 'OK' }]);
      } else if (mode === 'sell' && data.type === 'PUBLISH_ERROR') {
        console.error('[FB_SELL] Publish error:', data.reason);
      } else if (mode === 'sell' && data.type === 'NEXT_DISABLED') {
        console.log('[FB_SELL] Next button disabled, attempt:', data.attempt);
      } else if (mode === 'sell' && data.type === 'NEXT_NOT_FOUND') {
        console.log('[FB_SELL] Next button not found, attempt:', data.attempt);
      } else if (mode === 'sell' && data.type === 'NEXT_TIMEOUT') {
        console.warn('[FB_SELL] Next button never became enabled');
        Alert.alert('Almost There', 'Form is filled but Next button stayed disabled. Tap it manually to publish.', [{ text: 'OK' }]);
      } else if (mode === 'sell' && data.type === 'NEXT_ERROR') {
        console.error('[FB_SELL] Next click error:', data.reason);
      } else if (mode === 'sell' && data.type === 'PHOTO_UPLOADED') {
        console.log('[FB_SELL] Photo injected successfully');
        // Wait 3s for FB to process image, then attempt to click Next
        await new Promise(resolve => setTimeout(resolve, 3000));
        const nextScript = `
          (async function() {
            try {
              // Blur active field — forces FB form validation
              document.body.click();
              await new Promise(r => setTimeout(r, 1000));

              // Poll for enabled Next button (up to 15 attempts = 30s)
              for (var attempt = 0; attempt < 15; attempt++) {
                var buttons = Array.from(document.querySelectorAll('[role="button"], button'));
                var nextBtn = buttons.find(function(btn) {
                  var t = btn.innerText ? btn.innerText.trim() : '';
                  return t === 'Next' || btn.getAttribute('aria-label') === 'Next';
                });

                if (!nextBtn) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'NEXT_NOT_FOUND', attempt: attempt }));
                  await new Promise(r => setTimeout(r, 2000));
                  continue;
                }

                var isDisabled = nextBtn.getAttribute('aria-disabled') === 'true' || nextBtn.disabled;
                if (isDisabled) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'NEXT_DISABLED', attempt: attempt }));
                  await new Promise(r => setTimeout(r, 2000));
                  continue;
                }

                // Button is enabled — scroll then click
                nextBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await new Promise(r => setTimeout(r, 1000));
                ['mousedown', 'mouseup', 'click'].forEach(function(evt) {
                  nextBtn.dispatchEvent(new MouseEvent(evt, { view: window, bubbles: true, cancelable: true, buttons: 1 }));
                });
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'NEXT_CLICKED' }));
                return;
              }

              // Exhausted all attempts
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'NEXT_TIMEOUT' }));
            } catch(e) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'NEXT_ERROR', reason: e.toString() }));
            }
          })();
          true;
        `;
        webViewRef.current?.injectJavaScript(nextScript);
      } else if (mode === 'sell' && data.type === 'PHOTO_FAILED') {
        console.warn('[FB_SELL] Photo injection failed:', data.reason);
        Alert.alert('Form Ready', 'Fields filled but photo upload failed — add it manually, then tap Next.', [{ text: 'Got it' }]);
      } else if (mode === 'sell' && data.type === 'KILL_SWITCH') {
        Alert.alert(
          '⚠️ Identity Check Detected',
          'Facebook is asking you to confirm your identity. Automation has been stopped. Please complete the verification manually.',
          [{ text: 'OK' }]
        );
      } else if (mode === 'sell' && data.type === 'FORM_FILLED') {
        setFormFilled(true);
        
        // Show user feedback about form fill results
        if (!data.success && data.failedFields && data.failedFields.length > 0) {
          console.warn('[FB_SELL] Some fields failed:', data.failedFields);
          Alert.alert(
            'Partial Fill',
            `Filled ${data.filledCount}/6 fields. Please manually fill: ${data.failedFields.join(', ')}`,
            [{ text: 'OK' }]
          );
        }
        
        // Inject image automatically after form fill
        const imageUri = listingData?.imageUri;
        if (!imageUri) {
          Alert.alert('Form Ready', 'Fields filled. Add your photo manually then tap Next.', [{ text: 'Got it' }]);
          return;
        }
        try {
          const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
          // Jitter: inject a canvas brightness tweak (+1) to change file hash
          const jitter = Math.floor(Math.random() * 3) + 1;
          const imageScript = `
            (async function() {
              try {
                // Decode Base64 via atob (CSP-safe, no fetch)
                const b64 = "${base64}";
                const binary = atob(b64);
                const bytes = new Uint8Array(binary.length);
                for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

                // Jitter brightness by ${jitter}% via canvas to change file hash
                const blob0 = new Blob([bytes], { type: 'image/jpeg' });
                const url0 = URL.createObjectURL(blob0);
                const img = new Image();
                await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url0; });
                const canvas = document.createElement('canvas');
                canvas.width = img.width; canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.filter = 'brightness(${100 + jitter}%)';
                ctx.drawImage(img, 0, 0);
                URL.revokeObjectURL(url0);
                const jitteredBlob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.92));

                const file = new File([jitteredBlob], 'listing_photo.jpg', { type: 'image/jpeg' });
                const fileInput = document.querySelector('input[type="file"][accept*="image"]') ||
                                  document.querySelector('input[type="file"]');
                if (!fileInput) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PHOTO_FAILED', reason: 'No file input found' }));
                  return;
                }
                const dt = new DataTransfer();
                dt.items.add(file);
                fileInput.files = dt.files;
                fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                fileInput.dispatchEvent(new Event('input', { bubbles: true }));
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PHOTO_UPLOADED' }));
              } catch(e) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PHOTO_FAILED', reason: e.toString() }));
              }
            })();
            true;
          `;
          await new Promise(resolve => setTimeout(resolve, 1000));
          webViewRef.current?.injectJavaScript(imageScript);
        } catch (e) {
          console.error('[FB_SELL] Image read error:', e);
          Alert.alert('Form Ready', 'Fields filled. Add your photo manually then tap Next.', [{ text: 'Got it' }]);
        }
      }
    } catch (error) {
      console.error(`[FB_${mode.toUpperCase()}] Error handling message:`, error);
    }
  };

  const getHeaderTitle = () => {
    if (mode === 'login') return 'Connect Facebook';
    if (mode === 'sell') return 'Publish to Facebook';
    if (mode === 'relist') return 'Relist on Facebook';
    if (mode === 'view') return 'Your Listing';
    return 'Facebook';
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
        source={{ uri: getInitialUrl() }}
        userAgent={MOBILE_USER_AGENT}
        // Session persistence
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        incognito={false}
        // JS & storage
        javaScriptEnabled={true}
        domStorageEnabled={true}
        // Media — prevents photo upload from hanging
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        // Hardware acceleration (Android) — passes Facebook's WebGL/Canvas fingerprint checks
        androidHardwareAccelerationDisabled={false}
        // Prevent Facebook from blocking redirects
        originWhitelist={['*']}
        // Android-specific: critical for tag chip creation
        setSupportMultipleWindows={false}
        mixedContentMode="always"
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
