# Facebook Marketplace WebView Integration

## Implementation Summary

### Files Created
1. **FacebookWebViewScreen.js** - Main WebView screen for publishing listings
2. **FacebookLoginWebView.js** - Initial login screen for connecting Facebook account

### Files Modified
1. **ConnectPlatformsScreen.js** - Updated to navigate to WebView login
2. **ListingEditorScreen.js** - Added connection validation and WebView navigation
3. **AppNavigator.js** - Added new screen routes

### Package Installed
- `react-native-webview@13.16.1`

## User Flow

### Setup Phase (One-time)
1. User navigates to Profile → Connect Platforms
2. Taps "Connect Facebook"
3. Opens FacebookLoginWebView with Facebook login page
4. User logs in manually
5. Session persists via `sharedCookiesEnabled={true}`
6. Connection status saved to AsyncStorage
7. Returns to Connect Platforms screen with "Connected" badge

### Publishing Phase (Every listing)
1. User creates listing in ListingEditorScreen
2. Selects Facebook checkbox
3. Taps "Publish Now"
4. System checks if Facebook is connected
   - If NOT connected → Alert with "Connect Now" option
   - If connected → Proceeds to publish
5. If only Facebook selected → Navigate to FacebookWebViewScreen
6. WebView loads `https://www.facebook.com/marketplace/create/item`
7. JavaScript injection auto-fills form fields:
   - Title (product name)
   - Price
   - Description (Facebook-specific)
   - Location
8. User manually selects photos from gallery
9. User reviews and clicks "Publish" on Facebook
10. WebView detects success and navigates to ListingSuccessScreen

## Technical Implementation

### JavaScript Injection Strategy
Uses attribute-based selectors to find form elements:
- `input[aria-label*="title" i]`
- `input[placeholder*="What are you selling" i]`
- `input[aria-label*="price" i]`
- `textarea[aria-label*="description" i]`
- `input[aria-label*="location" i]`

### Bridge Communication
- **injectedJavaScript**: Runs on page load to auto-fill form
- **onMessage**: Listens for events from WebView
  - `autofill_complete`: Form filled successfully
  - `publish_attempt`: User clicked publish
  - `error`: Something went wrong
- **injectJavaScript()**: Manual retry via refresh button

### Session Persistence
- `sharedCookiesEnabled={true}` - Shares cookies with system browser
- `thirdPartyCookiesEnabled={true}` - Allows third-party cookies
- `domStorageEnabled={true}` - Enables localStorage/sessionStorage

### Image Handling
User manually selects photos when Facebook's "Add Photo" button is clicked. The WebView intercepts the file picker request and opens the native iOS/Android photo selector.

## Features

### FacebookWebViewScreen
- Auto-fill product details via JavaScript injection
- Retry button (refresh icon) to re-run auto-fill
- Back button navigation (goes back in WebView history)
- Loading states with spinner
- Success detection via URL monitoring
- Message bridge for two-way communication

### FacebookLoginWebView
- Clean login interface
- Instructions banner
- Automatic connection detection
- Session persistence
- Success alert with navigation back

### Connection Validation
- Checks connection status before publishing
- Shows alert if not connected
- Offers "Connect Now" shortcut to settings
- Prevents publishing to disconnected platforms

## Error Handling
- Form element not found → Error message via bridge
- Connection check before publish
- Loading states throughout
- Graceful fallbacks

## Future Enhancements
- Real Facebook Graph API integration (replace mock tokens)
- Automatic image upload via API
- Multi-image support
- Draft saving
- Edit published listings
- Analytics tracking

## Testing Checklist
- [ ] Install dependencies: `npm install`
- [ ] Connect Facebook account in Profile → Connect Platforms
- [ ] Create listing with AI analysis
- [ ] Select only Facebook platform
- [ ] Verify auto-fill works
- [ ] Manually select photos
- [ ] Publish listing
- [ ] Verify success screen shows
- [ ] Test retry button
- [ ] Test back navigation
- [ ] Test connection validation
