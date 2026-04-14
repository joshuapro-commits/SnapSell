# Week 1 Action Plan (April 8-14, 2025)

## 🎯 Goal: Backend Infrastructure + API Applications

---

## Day 1 (April 8) - CRITICAL APPLICATIONS ⚠️

### Morning (2-3 hours)
**Apply for Platform APIs** - These take time to approve!

1. **Facebook Developer Account**
   - Go to: https://developers.facebook.com
   - Create new app → "Consumer" type
   - Add "Facebook Login" product
   - Add "Marketplace API" (if available)
   - Submit for App Review:
     - Request `marketplace_listing` permission
     - Provide demo video of app functionality
     - Explain use case: "AI-powered marketplace listing creation"
   - ⏰ **Expected approval time: 2-4 weeks**

2. **Carousell Developer Account**
   - Go to: https://www.carousell.com/developer
   - Apply for API access
   - Fill out application form
   - Describe app purpose and expected usage
   - ⏰ **Expected approval time: 1-2 weeks**

3. **Shopee Open Platform** (Optional)
   - Go to: https://open.shopee.com
   - Register as developer
   - Create app
   - Complete merchant verification
   - ⏰ **Expected approval time: 1-2 weeks**

### Afternoon (3-4 hours)
**Firebase Setup**

1. **Create Firebase Project**
   ```bash
   # Go to: https://console.firebase.google.com
   # Click "Add project"
   # Name: "SnapSell" or "SnapSell-Production"
   # Enable Google Analytics (optional)
   ```

2. **Enable Services**
   - Authentication → Email/Password
   - Firestore Database → Start in test mode
   - Storage → Start in test mode
   - (Later change to production rules)

3. **Add Apps**
   - Add iOS app (Bundle ID from app.json)
   - Add Android app (Package name from app.json)
   - Download config files:
     - `google-services.json` (Android)
     - `GoogleService-Info.plist` (iOS)

4. **Install Dependencies**
   ```bash
   cd SnapSell
   npm install firebase
   npm install @react-native-firebase/app
   npm install @react-native-firebase/auth
   npm install @react-native-firebase/firestore
   npm install @react-native-firebase/storage
   ```

---

## Day 2 (April 9) - Firebase Configuration

### Morning (3-4 hours)
**Configure Firebase in App**

1. **Create Firebase Config**
   ```bash
   # Create new file
   touch src/config/firebase.js
   ```

   Add configuration:
   ```javascript
   import { initializeApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';
   import { getFirestore } from 'firebase/firestore';
   import { getStorage } from 'firebase/storage';

   const firebaseConfig = {
     apiKey: process.env.FIREBASE_API_KEY,
     authDomain: process.env.FIREBASE_AUTH_DOMAIN,
     projectId: process.env.FIREBASE_PROJECT_ID,
     storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
     messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
     appId: process.env.FIREBASE_APP_ID,
   };

   const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const db = getFirestore(app);
   export const storage = getStorage(app);
   ```

2. **Update .env file**
   ```bash
   # Add Firebase credentials from Firebase Console
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   ```

3. **Add to .gitignore**
   ```bash
   echo ".env" >> .gitignore
   echo "google-services.json" >> .gitignore
   echo "GoogleService-Info.plist" >> .gitignore
   ```

### Afternoon (3-4 hours)
**Update Auth Service**

1. **Backup current auth.js**
   ```bash
   cp src/services/auth.js src/services/auth.backup.js
   ```

2. **Replace with Firebase Auth**
   - See API_INTEGRATION_GUIDE.md for code examples
   - Implement: signup, login, logout, getCurrentUser
   - Test with real email/password

---

## Day 3 (April 10) - Firestore Integration

### Morning (3-4 hours)
**Update Storage Service**

1. **Create Firestore Collections**
   ```
   users/
   listings/
   platformTokens/
   ```

2. **Update storage.js**
   - Replace AsyncStorage calls with Firestore
   - Implement real-time listeners
   - Add error handling

### Afternoon (3-4 hours)
**Update Listings Context**

1. **Add Firestore Listeners**
   - Real-time updates for listings
   - Filter by userId for "My Listings"
   - Pagination for large datasets

2. **Test CRUD Operations**
   - Create listing
   - Update listing
   - Delete listing
   - Load all listings

---

## Day 4 (April 11) - Image Upload

### Morning (3-4 hours)
**Firebase Storage Integration**

1. **Create Upload Function**
   ```javascript
   // src/services/imageUpload.js
   import { storage } from '../config/firebase';
   import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

   export async function uploadImage(imageUri, userId, listingId) {
     const response = await fetch(imageUri);
     const blob = await response.blob();
     
     const storageRef = ref(storage, `listings/${userId}/${listingId}.jpg`);
     await uploadBytes(storageRef, blob);
     
     const downloadURL = await getDownloadURL(storageRef);
     return downloadURL;
   }
   ```

2. **Update Listing Creation Flow**
   - Upload image before saving listing
   - Store download URL in Firestore
   - Add loading state during upload

### Afternoon (2-3 hours)
**Image Optimization**

1. **Install Image Compressor**
   ```bash
   npm install expo-image-manipulator
   ```

2. **Compress Before Upload**
   - Resize to max 1200x1200
   - Compress quality to 80%
   - Convert to JPEG

---

## Day 5 (April 12) - Testing & Bug Fixes

### Full Day (6-8 hours)
**End-to-End Testing**

1. **Test User Flow**
   - [ ] Signup with new email
   - [ ] Login with credentials
   - [ ] Logout and login again
   - [ ] Password validation

2. **Test Listing Flow**
   - [ ] Take photo
   - [ ] AI analysis
   - [ ] Edit listing
   - [ ] Publish listing
   - [ ] View in marketplace
   - [ ] View in "My Listings"
   - [ ] Edit existing listing
   - [ ] Delete listing

3. **Test Edge Cases**
   - [ ] No internet connection
   - [ ] Large images (>10MB)
   - [ ] Special characters in text
   - [ ] Empty fields
   - [ ] Duplicate emails

4. **Fix Critical Bugs**
   - Document all issues
   - Prioritize by severity
   - Fix blocking issues

---

## Day 6-7 (April 13-14) - Platform OAuth Prep

### Day 6 Morning
**Check API Application Status**
- Check Facebook App Review status
- Check Carousell API approval
- Follow up if needed

### Day 6 Afternoon
**Install OAuth Dependencies**
```bash
npm install expo-auth-session expo-crypto
npm install react-native-fbsdk-next
```

### Day 7
**Implement OAuth Flows** (if APIs approved)
- Carousell OAuth (see API_INTEGRATION_GUIDE.md)
- Facebook Login (see API_INTEGRATION_GUIDE.md)
- Test connection flows

**OR**

**Continue Testing** (if APIs not approved yet)
- Beta test with friends/family
- Collect feedback
- Polish UI/UX
- Optimize performance

---

## Success Metrics for Week 1

- [x] Facebook API application submitted
- [x] Carousell API application submitted
- [x] Firebase project created and configured
- [x] User authentication working with Firebase
- [x] Listings stored in Firestore
- [x] Images uploaded to Firebase Storage
- [x] App tested end-to-end with real backend
- [x] Critical bugs fixed
- [x] Ready for Week 2 (Platform API integration)

---

## Daily Checklist Template

### Morning
- [ ] Check email for API approval updates
- [ ] Review yesterday's progress
- [ ] Set 3 specific goals for today
- [ ] Start coding session

### Afternoon
- [ ] Test implemented features
- [ ] Document any issues
- [ ] Commit code to Git
- [ ] Update progress tracker

### Evening
- [ ] Review day's accomplishments
- [ ] Plan tomorrow's tasks
- [ ] Respond to any API approval emails

---

## Emergency Contacts & Resources

### Documentation
- Firebase: https://firebase.google.com/docs
- React Native Firebase: https://rnfirebase.io
- Expo: https://docs.expo.dev
- Carousell API: (docs provided after approval)
- Facebook Graph API: https://developers.facebook.com/docs/graph-api

### Support
- Firebase Support: https://firebase.google.com/support
- Expo Discord: https://chat.expo.dev
- Stack Overflow: Tag with `react-native`, `firebase`, `expo`

---

## Week 1 Budget

- Firebase (Spark Plan): **$0** (free tier)
- Gemini API: **~$5-10** (testing)
- Domain (optional): **$12/year**
- **Total: ~$5-10**

---

## Notes

⚠️ **CRITICAL**: Submit Facebook and Carousell applications TODAY (Day 1). These are the longest lead time items.

💡 **TIP**: Work on Firebase integration while waiting for API approvals. This is productive use of waiting time.

🎯 **FOCUS**: By end of Week 1, you should have a fully functional app with real backend, just waiting for platform API approvals.

📱 **TESTING**: Test on both iOS and Android devices throughout the week.

---

**Ready to start? Begin with Day 1 Morning tasks! 🚀**
