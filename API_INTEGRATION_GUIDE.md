# API Integration Guide

This guide outlines the steps to integrate real APIs for SnapSell's production launch.

## Current Status
✅ **AsyncStorage**: All data persistence using AsyncStorage (no mock data)
✅ **Gemini AI**: Fully integrated with real API
⏳ **Platform APIs**: Ready for integration (currently simulated)
⏳ **Backend**: Ready for Firebase/Supabase integration

---

## 1. Backend Setup (Week 1: Days 1-7)

### Option A: Firebase (Recommended - Fastest)

#### Setup Steps
```bash
npm install firebase @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/storage
```

#### Configuration
1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Enable Storage for images
5. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)

#### Database Schema
```
users/
  {userId}/
    - email: string
    - name: string
    - avatar: string
    - createdAt: timestamp

listings/
  {listingId}/
    - name: string
    - brand: string
    - price: number
    - category: string
    - condition: string
    - description: string
    - imageUri: string
    - userId: string
    - userName: string
    - publishedPlatforms: object
    - createdAt: timestamp
    - updatedAt: timestamp

platformTokens/
  {userId}/
    - carousell: object
    - facebook: object
    - shopee: object
```

#### Update Files
- `src/services/auth.js` - Replace with Firebase Auth
- `src/services/storage.js` - Replace with Firestore queries
- `src/contexts/AuthContext.js` - Use Firebase Auth state listener
- `src/contexts/ListingsContext.js` - Use Firestore real-time listeners

### Option B: Supabase

```bash
npm install @supabase/supabase-js
```

Similar setup with PostgreSQL tables instead of Firestore collections.

---

## 2. Carousell API Integration (Week 2: Days 8-10)

### Registration
1. Apply at: https://www.carousell.com/developer
2. Create app and get credentials
3. Request API access (may take 1-2 weeks)

### OAuth Flow

#### Install Dependencies
```bash
npm install expo-auth-session expo-crypto
```

#### Implementation (`src/services/platforms.js`)
```javascript
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';

const CAROUSELL_CLIENT_ID = 'your_client_id';
const CAROUSELL_CLIENT_SECRET = 'your_client_secret';
const REDIRECT_URI = AuthSession.makeRedirectUri({ useProxy: true });

async connectCarousell(userId) {
  const discovery = {
    authorizationEndpoint: 'https://www.carousell.com/oauth/authorize',
    tokenEndpoint: 'https://www.carousell.com/oauth/token',
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CAROUSELL_CLIENT_ID,
      scopes: ['listing.create', 'listing.read'],
      redirectUri: REDIRECT_URI,
    },
    discovery
  );

  const result = await promptAsync();
  
  if (result.type === 'success') {
    const { code } = result.params;
    
    // Exchange code for token
    const tokenResponse = await fetch('https://www.carousell.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: CAROUSELL_CLIENT_ID,
        client_secret: CAROUSELL_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokens = await tokenResponse.json();
    
    // Save to Firebase/Supabase
    await saveTokenToBackend(userId, 'carousell', tokens);
    
    return { success: true };
  }
  
  return { success: false, error: 'OAuth cancelled' };
}
```

#### Publish Listing
```javascript
async publishToCarousell(listingData, accessToken) {
  const formData = new FormData();
  formData.append('title', listingData.name);
  formData.append('description', listingData.carousellDescription);
  formData.append('price', listingData.price);
  formData.append('category_id', getCategoryId(listingData.category));
  
  // Upload image
  const imageResponse = await fetch(listingData.imageUri);
  const imageBlob = await imageResponse.blob();
  formData.append('photos[]', imageBlob, 'product.jpg');

  const response = await fetch('https://www.carousell.com/api/v3/listings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });

  return await response.json();
}
```

---

## 3. Facebook Marketplace API (Week 2: Days 11-14)

### Registration
1. Create app at: https://developers.facebook.com
2. Add Facebook Login product
3. Request `marketplace_listing` permission (requires app review)
4. App review takes 2-4 weeks - **START IMMEDIATELY**

### OAuth Flow

#### Install Dependencies
```bash
npm install react-native-fbsdk-next
```

#### Configuration
Add to `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-fbsdk-next",
        {
          "appID": "YOUR_FACEBOOK_APP_ID",
          "clientToken": "YOUR_CLIENT_TOKEN",
          "displayName": "SnapSell"
        }
      ]
    ]
  }
}
```

#### Implementation
```javascript
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

async connectFacebook(userId) {
  const result = await LoginManager.logInWithPermissions([
    'public_profile',
    'marketplace_listing'
  ]);

  if (result.isCancelled) {
    return { success: false, error: 'Login cancelled' };
  }

  const data = await AccessToken.getCurrentAccessToken();
  
  const token = {
    accessToken: data.accessToken,
    expiresAt: data.expirationTime,
    userId: data.userID,
  };

  await saveTokenToBackend(userId, 'facebook', token);
  
  return { success: true };
}
```

#### Publish Listing
```javascript
async publishToFacebook(listingData, accessToken) {
  // Upload image first
  const imageFormData = new FormData();
  imageFormData.append('source', {
    uri: listingData.imageUri,
    type: 'image/jpeg',
    name: 'product.jpg',
  });

  const imageResponse = await fetch(
    `https://graph.facebook.com/v18.0/me/photos?access_token=${accessToken}`,
    {
      method: 'POST',
      body: imageFormData,
    }
  );

  const { id: photoId } = await imageResponse.json();

  // Create marketplace listing
  const listingResponse = await fetch(
    `https://graph.facebook.com/v18.0/me/marketplace_listings?access_token=${accessToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: listingData.name,
        description: listingData.facebookDescription,
        price: listingData.price,
        currency: 'PHP',
        category: getFacebookCategory(listingData.category),
        condition: getFacebookCondition(listingData.condition),
        photos: [photoId],
      }),
    }
  );

  return await listingResponse.json();
}
```

---

## 4. Shopee Open Platform API (Week 2: Optional)

### Registration
1. Apply at: https://open.shopee.com
2. Create app and get credentials
3. Complete merchant verification

### Implementation
Similar OAuth flow to Carousell with Shopee-specific endpoints.

---

## 5. Image Upload Service (Week 3)

### Option A: Firebase Storage
```javascript
import storage from '@react-native-firebase/storage';

async uploadImage(imageUri, userId, listingId) {
  const filename = `listings/${userId}/${listingId}.jpg`;
  const reference = storage().ref(filename);
  
  await reference.putFile(imageUri);
  const url = await reference.getDownloadURL();
  
  return url;
}
```

### Option B: Cloudinary
```bash
npm install cloudinary-react-native
```

```javascript
async uploadImage(imageUri) {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  });
  formData.append('upload_preset', 'your_preset');

  const response = await fetch(
    'https://api.cloudinary.com/v1_1/your_cloud_name/image/upload',
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();
  return data.secure_url;
}
```

---

## 6. Environment Variables

### Create `.env` file
```bash
# Firebase
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id

# Gemini AI (already configured)
GEMINI_API_KEY=your_gemini_key

# Carousell
CAROUSELL_CLIENT_ID=your_client_id
CAROUSELL_CLIENT_SECRET=your_client_secret

# Facebook
FACEBOOK_APP_ID=your_app_id
FACEBOOK_CLIENT_TOKEN=your_client_token

# Shopee
SHOPEE_PARTNER_ID=your_partner_id
SHOPEE_PARTNER_KEY=your_partner_key
```

### Install dotenv
```bash
npm install react-native-dotenv
```

### Configure `babel.config.js`
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
      }]
    ]
  };
};
```

---

## 7. Error Handling & Monitoring

### Install Sentry
```bash
npm install @sentry/react-native
```

### Configure
```javascript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'your_sentry_dsn',
  enableAutoSessionTracking: true,
  tracesSampleRate: 1.0,
});
```

---

## 8. Testing Checklist

### Week 3-4: Testing Phase
- [ ] User registration and login
- [ ] Image upload to backend
- [ ] AI analysis with real images
- [ ] Carousell OAuth flow
- [ ] Carousell listing creation
- [ ] Facebook OAuth flow
- [ ] Facebook Marketplace listing
- [ ] Platform disconnection
- [ ] Token refresh logic
- [ ] Error handling for all APIs
- [ ] Offline mode handling
- [ ] Image compression and optimization

---

## 9. Security Best Practices

1. **Never commit API keys** - Use environment variables
2. **Validate tokens** - Check expiration before API calls
3. **Implement rate limiting** - Prevent API abuse
4. **Sanitize user input** - Prevent injection attacks
5. **Use HTTPS only** - All API calls over secure connection
6. **Implement refresh tokens** - Auto-refresh expired tokens
7. **Log errors securely** - Don't expose sensitive data in logs

---

## 10. Migration Checklist

### Before Launch
- [ ] Remove all TODO comments after implementation
- [ ] Test with real user accounts
- [ ] Verify all API endpoints are production URLs
- [ ] Set up error monitoring (Sentry)
- [ ] Configure analytics (Firebase Analytics)
- [ ] Test on both iOS and Android
- [ ] Verify image upload limits
- [ ] Test network failure scenarios
- [ ] Implement retry logic for failed API calls
- [ ] Add loading states for all async operations

---

## Timeline Summary

| Week | Task | Status |
|------|------|--------|
| Week 1 | Backend setup (Firebase/Supabase) | ⏳ Pending |
| Week 2 | Carousell API integration | ⏳ Pending |
| Week 2 | Facebook API integration | ⏳ Pending |
| Week 3 | Testing & bug fixes | ⏳ Pending |
| Week 4 | Beta testing | ⏳ Pending |

**Target: All APIs integrated by May 5, 2025**
