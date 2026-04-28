# Google Sign-In Setup for Carousell Integration

## Overview
Native Google Sign-In replaces WebView-based authentication for Carousell, providing a better user experience and more secure authentication flow.

## Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it "SnapSell" or similar

### 2. Enable Google Sign-In API

1. Navigate to **APIs & Services** → **Library**
2. Search for "Google Sign-In API"
3. Click **Enable**

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type
3. Fill in required fields:
   - App name: **Snap & Sell**
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - `userinfo.email`
   - `userinfo.profile`
5. Save and continue

### 4. Create OAuth 2.0 Credentials

#### For iOS:

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **iOS**
4. Name: "SnapSell iOS"
5. Bundle ID: `com.joshuaseziba.SnapSell`
6. Click **Create**
7. Copy the **Client ID** (ends with `.apps.googleusercontent.com`)

#### For Android:

1. Get your SHA-1 certificate fingerprint:
   ```bash
   # Debug keystore (for development)
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   
   # Copy the SHA-1 fingerprint
   ```

2. Create Android OAuth client:
   - Application type: **Android**
   - Name: "SnapSell Android"
   - Package name: `com.joshuaseziba.SnapSell`
   - SHA-1 certificate fingerprint: Paste from above
   - Click **Create**

#### For Web (Required for iOS):

1. Create another credential:
   - Application type: **Web application**
   - Name: "SnapSell Web"
   - Click **Create**
2. Copy the **Client ID** (this is your `WEB_CLIENT_ID`)

### 5. Update Configuration

Open `src/services/googleSignIn.js` and replace:

```javascript
const WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';
const IOS_CLIENT_ID = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
```

With your actual Client IDs from Google Cloud Console.

### 6. Rebuild Native App

After updating the configuration:

```bash
# For iOS
npx expo prebuild --clean
npx expo run:ios

# For Android
npx expo prebuild --clean
npx expo run:android
```

## Testing

1. Navigate to **Profile** → **Connect Platforms**
2. Tap **Connect** on Carousell card
3. Native Google Sign-In sheet should appear
4. Sign in with your Google account
5. Success alert should show with your email and ID token

## Flow Diagram

```
User taps "Connect Carousell"
         ↓
Native Google Sign-In UI appears
         ↓
User selects Google account
         ↓
Google authenticates user
         ↓
App receives idToken + user info
         ↓
Success alert with user email
         ↓
[Next Step] Pass idToken to CarousellWebView
         ↓
CarousellWebView uses token for session
```

## Security Notes

- ✅ Native sign-in is more secure than WebView
- ✅ Tokens are handled by native Google SDK
- ✅ No credentials stored in WebView
- ✅ Follows Google's best practices

## Troubleshooting

### "DEVELOPER_ERROR" on Android
- Verify SHA-1 fingerprint matches
- Check package name is correct
- Ensure Google Sign-In API is enabled

### "Sign-in failed" on iOS
- Verify iOS Client ID is correct
- Check Bundle ID matches
- Ensure URL schemes are configured

### "Play Services not available"
- Android emulator needs Google Play Services
- Use emulator with Google APIs

## Next Steps

After successful Google Sign-In:
1. Pass `idToken` to CarousellWebView
2. Inject token into Carousell session
3. Use WebView only for listing management
4. No more WebView-based login!
