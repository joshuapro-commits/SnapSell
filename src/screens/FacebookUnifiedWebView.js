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

  // Determine initial URL based on mode
  const getInitialUrl = () => {
    if (mode === 'login') return 'https://www.facebook.com/login';
    if (mode === 'view') return route.params.viewUrl || 'https://www.facebook.com/marketplace/you/selling';
    if (mode === 'sell') return 'https://www.facebook.com/marketplace/create/item';
    return 'https://www.facebook.com';
  };

  const handleNavigationStateChange = async (navState) => {
    console.log(`[FB_${mode.toUpperCase()}] Navigation URL:`, navState.url);

    if (mode === 'login') {
      // Login mode: detect successful login
      if (
        navState.url.includes('facebook.com') &&
        !navState.url.includes('login') &&
        !navState.url.includes('checkpoint') &&
        !hasConnected
      ) {
        console.log('[FB_LOGIN] Login successful detected!');
        setHasConnected(true);

        // Save connection immediately
        const connectionData = {
          connected: true,
          connectedAt: new Date().toISOString(),
          userName: 'Facebook User',
          profilePic: '',
        };

        await storageService.savePlatformToken(userId, 'facebook', connectionData);
        console.log('[FB_LOGIN] Connection saved, redirecting back...');

        // Redirect back immediately
        navigation.goBack();
        
        // Show alert after redirect
        setTimeout(() => {
          Alert.alert(
            'Successfully Connected',
            'Your Facebook account has been connected. You can now publish listings to Facebook Marketplace.'
          );
        }, 500);

        // Try to extract profile info in background (optional)
        const injectedJS = `
          (function() {
            setTimeout(async () => {
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

                if (userName) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'UPDATE_PROFILE',
                    userName: userName.trim(),
                  }));
                }
              } catch (error) {
                console.error('[FB_INJECT] Error:', error);
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
      // Sell mode: Auto-fill form when marketplace create page loads
      if (navState.url.includes('/marketplace/create') && !formFilled && !loading) {
        console.log('[FB_SELL] Marketplace create page loaded, waiting for form...');
        setFormFilled(true);

        // ── Cool-down check: enforce 5-minute gap between listings ──────────
        // Prevents Facebook's velocity-based bot detection from triggering
        const lastPublish = await storageService.getLastPublishTime(userId);
        const elapsed = Date.now() - lastPublish;
        const COOL_DOWN_MS = 5 * 60 * 1000;
        if (elapsed < COOL_DOWN_MS) {
          const remaining = Math.ceil((COOL_DOWN_MS - elapsed) / 1000);
          Alert.alert(
            'Cool Down Active',
            `Please wait ${remaining}s before publishing another listing. This prevents account flags.`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
          return;
        }

        // Wait longer for Facebook's React to render the form
        setTimeout(() => {
          const fillFormScript = `
            (function() {
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

              // Category mapping
              const categoryMap = {
                "jewelry": "Jewelry & Accessories",
                "jewelry & accessories": "Jewelry & Accessories",
                "electronics": "Electronics",
                "furniture": "Furniture",
                "clothing": "Clothing & Shoes",
                "clothing & shoes": "Clothing & Shoes",
                "apparel": "Clothing & Shoes",
                "books": "Books & Magazines",
                "books & magazines": "Books & Magazines",
                "sporting": "Sporting Goods",
                "sporting goods": "Sporting Goods",
                "toys": "Toys & Games",
                "toys & games": "Toys & Games",
                "automotive": "Automotive",
                "beauty": "Beauty & Personal Care",
                "beauty & personal care": "Beauty & Personal Care",
                "home": "Household",
                "home & garden": "Household",
                "home goods": "Household",
                "household": "Household",
                "kitchen": "Household",
                "tools": "Tools",
                "pet": "Pet Supplies",
                "pet supplies": "Pet Supplies",
                "garden": "Garden",
                "musical": "Musical Instruments",
                "musical instruments": "Musical Instruments",
                "office": "Office Supplies",
                "other": "Other",
              };

              // Stealth-types text into an input/textarea.
              // Primary: execCommand('insertText') — triggers React's synthetic event system.
              // Fallback: native setter + manual event dispatch (for inputs where execCommand fails).
              async function stealthType(el, text) {
                el.focus();
                await wait(150 + Math.random() * 100);

                // Clear existing value first
                el.select && el.select();
                document.execCommand('selectAll', false, null);
                document.execCommand('delete', false, null);
                await wait(80 + Math.random() * 60);

                // Type character by character
                for (let i = 0; i < text.length; i++) {
                  const char = text[i];
                  const shouldTypo = Math.random() < 0.02 && i < text.length - 2 && char !== ' ';

                  if (shouldTypo) {
                    const wrong = 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
                    document.execCommand('insertText', false, wrong);
                    el.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: wrong, bubbles: true }));
                    await wait(280 + Math.random() * 180);
                    document.execCommand('delete', false, null);
                    el.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward', bubbles: true }));
                    await wait(80 + Math.random() * 80);
                  }

                  const inserted = document.execCommand('insertText', false, char);
                  if (!inserted) {
                    // execCommand failed (some inputs block it) — fall back to native setter
                    var nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')
                      || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
                    if (nativeSetter && nativeSetter.set) {
                      nativeSetter.set.call(el, el.value + char);
                    } else {
                      el.value += char;
                    }
                  }
                  el.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: char, bubbles: true }));
                  await wait(45 + Math.random() * 90);
                }

                el.dispatchEvent(new Event('change', { bubbles: true }));
                await wait(120 + Math.random() * 80);
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

                  var allOpts = Array.from(menuRoot.querySelectorAll('span, div, [role="option"], [role="listitem"]'));
                  var visibleOpts = [];
                  for (var oi = 0; oi < allOpts.length; oi++) {
                    if (allOpts[oi].offsetParent !== null) visibleOpts.push(allOpts[oi]);
                  }

                  var target = null;
                  for (var ti = 0; ti < visibleOpts.length; ti++) {
                    var elText = visibleOpts[ti].innerText ? visibleOpts[ti].innerText.trim().toLowerCase() : '';
                    if (elText && (elText === tv || elText.includes(tv) || tv.includes(elText))) {
                      target = visibleOpts[ti];
                      break;
                    }
                  }

                  if (target) {
                    // Find the exact clickable option — skip section headers (no role, parent of other options)
                    var clickEl = null;
                    var allDescendants = Array.from(target.querySelectorAll('[role="option"], span, div, li'));
                    for (var ci = 0; ci < allDescendants.length; ci++) {
                      var cel = allDescendants[ci];
                      var ct = cel.innerText ? cel.innerText.trim().toLowerCase() : '';
                      if (ct !== tv) continue;
                      // Must be a leaf or have role="option" — skip section headers
                      var isOption = cel.getAttribute('role') === 'option';
                      var isLeaf = cel.children.length === 0;
                      var isSingleWrap = cel.children.length === 1 && (!cel.children[0].innerText || cel.children[0].innerText.trim().toLowerCase() === tv);
                      if (isOption || isLeaf || isSingleWrap) { clickEl = cel; break; }
                    }
                    if (!clickEl) clickEl = target; // fallback
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
                    await wait(800 + Math.random() * 400);
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'DROPDOWN_SUCCESS', field: labelText, value: targetValue }));
                    return true;
                  }

                  if (i === 3) {
                    var sample = [];
                    for (var si = 0; si < visibleOpts.length; si++) {
                      var st = visibleOpts[si].innerText ? visibleOpts[si].innerText.trim() : '';
                      if (st && st.length > 1 && st.length < 60) sample.push(st);
                      if (sample.length >= 20) break;
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
                  if (spanTexts.length >= 20) break;
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

                  // Wait before starting (simulate human reading the page)
                  await wait(3000 + Math.random() * 2000);
                  if (killSwitchTriggered) return;

                  // Fill Title
                  await wait(500 + Math.random() * 500);
                  if (killSwitchTriggered) return;
                  if (!await fillTextField('Title', "${listingData?.name || ''}")) success = false;

                  // Random scroll (simulate reviewing)
                  if (Math.random() < 0.3) await randomScroll();
                  if (killSwitchTriggered) return;

                  // Fill Price
                  await wait(1000 + Math.random() * 500);
                  if (killSwitchTriggered) return;
                  if (!await fillTextField('Price', "${listingData?.price || ''}")) success = false;

                  // Random scroll
                  if (Math.random() < 0.3) await randomScroll();
                  if (killSwitchTriggered) return;

                  // Select Category
                  await wait(1500 + Math.random() * 500);
                  if (killSwitchTriggered) return;
                  const rawFbCategory = "${listingData?.platformData?.facebook?.category || listingData?.category || 'Household'}";
                  const fbCategory = categoryMap[rawFbCategory.toLowerCase()] || categoryMap[rawFbCategory.toLowerCase().split(' ')[0]] || rawFbCategory;
                  if (!await selectDropdown('Category', fbCategory)) success = false;

                  // Random scroll
                  if (Math.random() < 0.3) await randomScroll();
                  if (killSwitchTriggered) return;

                  // Select Condition
                  await wait(2000 + Math.random() * 500);
                  if (killSwitchTriggered) return;
                  if (!await selectDropdown('Condition', "${listingData?.platformData?.facebook?.condition || listingData?.condition || 'Used - Good'}")) success = false;

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
                  if (!await fillDescription("${listingData?.description || ''}")) success = false;

                  clearInterval(killSwitchInterval);
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'FORM_FILLED',
                    success: success,
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

      if (mode === 'login' && data.type === 'UPDATE_PROFILE') {
        // Update profile info in background
        const existingData = await storageService.getPlatformTokens(userId);
        const facebookData = existingData.facebook || {};
        
        const updatedData = {
          ...facebookData,
          userName: data.userName || facebookData.userName,
        };

        await storageService.savePlatformToken(userId, 'facebook', updatedData);
        console.log('[FB_LOGIN] Profile updated:', updatedData);
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
        console.log('[FB_SELL] Dropdown selected:', data.field, '=', data.value);
      } else if (mode === 'sell' && data.type === 'DROPDOWN_NOT_FOUND') {
        console.log('[FB_SELL] Dropdown not found:', data.field);
      } else if (mode === 'sell' && data.type === 'DROPDOWN_OPTION_NOT_FOUND') {
        console.log('[FB_SELL] Dropdown option not found:', data.field, 'looking for:', data.targetText);
        console.log('[FB_SELL] Available options:', data.availableOptions);
      } else if (mode === 'sell' && data.type === 'NEXT_CLICKED') {
        console.log('[FB_SELL] Next button clicked, waiting for Publish screen...');
        await new Promise(resolve => setTimeout(resolve, 2000));
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
