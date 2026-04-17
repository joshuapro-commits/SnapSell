# Anti-Bot Detection Measures Checklist

## User Agent Strategy
- [ ] Use iPad UA — avoids "Download FB App" nag, treated as large-screen mobile
  - `Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1`
- [ ] Never switch UA between WebViews — UA change triggers Facebook security invalidation
- [ ] Use same UA for both login and sell WebViews

## Session Persistence (iOS)
- [ ] `sharedCookiesEnabled={true}` — syncs cookies via WKProcessPool
- [ ] `domStorageEnabled={true}` — required for localStorage/sessionStorage
- [ ] `thirdPartyCookiesEnabled={true}` — supports Facebook's cross-domain security
- [ ] `incognito={false}` — cookies write to disk, not just memory
- [ ] `originWhitelist={['*']}` — prevents Facebook from blocking redirects
- [ ] Dual WebView mounted simultaneously (login + sell) — no unmounting = no cookie loss
- [ ] Hidden warm-up WebView in App.js — session ready before user taps Sell

## Human-Like Form Filling
- [ ] Typewriter effect per character — 40–80ms random delay per keystroke
- [ ] Sequential field delays — 800–1500ms between each field
- [ ] Never instant-fill — triggers bot detection
- [ ] Dispatch `input` and `change` events with `bubbles: true` — required for React state
- [ ] Use native input setter (`Object.getOwnPropertyDescriptor`) — bypasses React's synthetic event system

## DOM Interaction (Avoiding Obfuscated Selectors)
- [ ] Find fields by visible label text, not class names or IDs — class names are dynamic/obfuscated
- [ ] Traverse up DOM tree (max 5 parent levels) to find associated input/textarea
- [ ] For dropdowns: find `[aria-expanded]` or `[role="combobox"]` triggers only — avoids generic DIVs
- [ ] Wait 1200ms after opening dropdown before searching for options
- [ ] Match options by exact text on spans with `children.length === 0` (leaf nodes only)
- [ ] Use `MutationObserver` to wait for DOM elements before extracting — avoids timing failures

## Image Upload (CSP Bypass)
- [ ] Convert image to Base64 in React Native via `expo-file-system/legacy`
- [ ] Use `atob()` in WebView to decode Base64 — bypasses CSP that blocks `fetch()`
- [ ] Convert binary string to `Uint8Array` byte-by-byte
- [ ] Create `Blob` → `File` object with proper MIME type
- [ ] Use `DataTransfer` API to assign file to input — bypasses browser security on direct assignment
- [ ] Dispatch `change` + `input` events with `bubbles: true` after file assignment
- [ ] Inject image 1 second after form fill completes — avoids race conditions

## Cookie & Session Management
- [ ] Brute-force cookie deletion on reconnect — `logout.php` is ignored by Facebook in WebViews
  - Delete all cookies for `.facebook.com` and `.m.facebook.com`
  - Clear `localStorage`, `sessionStorage`, and `IndexedDB`
  - Redirect to `/login/` after cleanup
- [ ] iOS reconnect: use `incognito={true}` for clean room approach
- [ ] Android reconnect: `cacheEnabled={false}`, `cacheMode='LOAD_NO_CACHE'`, manual cache clearing
- [ ] Flush cookies after login success with `window.location.href` trick
- [ ] Wait 3 seconds total (2s flush + 1s sync) before switching to sell WebView

## State Machine Guards (Preventing False Positives)
- [ ] `hasForcedLogout` ref — tracks if logout script has been injected (prevents double injection)
- [ ] `isReadyForNewLogin` state — only `true` when `/login` page is visible (LOCK/UNLOCK)
- [ ] `hasConnected` ref — prevents duplicate connection attempts on rapid navigation
- [ ] 3-step validation: detect stale session → wait for login page → validate fresh login

## Success & Navigation Detection
- [ ] Monitor `onNavigationStateChange` for URL patterns — not DOM events
- [ ] Sell success: detect `/marketplace/item/\d+` regex match
- [ ] Login success: URL contains `facebook.com` but NOT `/login` or `/checkpoint`
- [ ] Save-device screen (`/login/save-device/`): treat as success, auto-click "Not Now"
- [ ] Auto-reload sell WebView once if `/login` appears — silent cookie sync retry

## Profile Extraction (Post-Login)
- [ ] 3-second delay after navigation before extracting — DOM not ready immediately
- [ ] `MutationObserver` waits up to 5 seconds for elements
- [ ] Multiple fallback extraction methods in order:
  1. Profile/Account button `aria-label`
  2. Profile links (`/profile`, `/user`)
  3. Text content in navigation/banner spans
  4. Profile picture `alt` text

## Memory Management
- [ ] Unmount login WebView after listing published — reduces RAM
- [ ] Keep sell WebView mounted with active session
- [ ] Hidden warm-up WebView is 1x1px — invisible to user, minimal resource use

## Human Rhythm Succession (Cadence & Irregularity)

> Fixed intervals between actions create a "digital signature" that is trivially flagged. Every delay must be variable and nonlinear.

### Step 1 — Idle Warm-up (Before Creating Listing)
- [ ] Load Marketplace home feed first — do NOT navigate straight to Create Listing
- [ ] Spend 15–30 seconds on the feed before proceeding
- [ ] Perform 2–3 random scrolls on the feed
- [ ] Simulate touch-hold (hover) over 1–2 random items — signals browsing intent

### Step 2 — Navigation Gap (After Page Load)
- [ ] Wait 3–5 seconds after Create Listing page loads before touching the first field
- [ ] Reason: humans orient themselves to a new screen before acting

### Step 3 — Media Upload (One at a Time)
- [ ] Upload photos one by one — never batch-inject all at once
- [ ] Wait 5–8 seconds between each photo upload — simulates gallery browsing

### Step 4 — Field Entry ("Thinking" Pauses)
- [ ] Title: type at ~120–180 CPM (characters per minute)
- [ ] Wait 4 seconds after Title before clicking Price field
- [ ] Description: do not paste — type in chunks with mid-paragraph pauses
- [ ] Typo & Correction logic: every ~100 characters, type 2 wrong chars → wait 500ms → backspace twice → type correct chars

## Jitter — Breaking Fixed-Interval Patterns

> No two successions should be identical. Use randomized delay calculations everywhere.

$$\text{Total Delay} = \text{Base Wait} + (\text{Random Factor} \times \text{Variance})$$

- [ ] Replace all `setTimeout(fn, 2000)` fixed delays with `humanDelay(min, max)`
- [ ] Apply jitter to: field transitions, scroll events, photo uploads, dropdown interactions
- [ ] Never use the same min/max range for consecutive actions — vary the bounds too

```js
const humanDelay = (min, max) => {
  const ms = Math.floor(Math.random() * (max - min + 1) + min);
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Example usage
await humanDelay(2000, 5000); // anywhere between 2–5 seconds
```
