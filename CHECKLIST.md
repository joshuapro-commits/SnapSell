# Pre-Flight Checklist ✈️

## Before Running the App

### ✅ Prerequisites Installed
- [ ] Node.js (v14 or higher) - Check with: `node --version`
- [ ] npm or yarn - Check with: `npm --version`
- [ ] Expo CLI (optional) - Install with: `npm install -g expo-cli`

### ✅ Project Setup
- [ ] Navigate to project: `cd SnapSell`
- [ ] Dependencies installed: `npm install` (already done during setup)
- [ ] No error messages in terminal

### ✅ Choose Your Testing Method

#### Option 1: Physical Device (Recommended) 📱
- [ ] Install "Expo Go" app from App Store (iOS) or Play Store (Android)
- [ ] Ensure phone and computer are on same WiFi network
- [ ] Run: `npm start`
- [ ] Scan QR code with Expo Go app
- [ ] Wait for app to load

#### Option 2: Android Emulator 🤖
- [ ] Android Studio installed
- [ ] Android emulator running
- [ ] Run: `npm run android`
- [ ] Wait for build to complete

#### Option 3: iOS Simulator 🍎
- [ ] macOS required
- [ ] Xcode installed
- [ ] Run: `npm run ios`
- [ ] Wait for build to complete

#### Option 4: Web Browser 🌐
- [ ] Run: `npm run web`
- [ ] Browser opens automatically
- [ ] Note: Camera features limited on web

## First Run Commands

```bash
# Navigate to project
cd SnapSell

# Start the app
npm start

# Or start with cache cleared
npm start -- --clear
```

## What to Expect

### 1. Terminal Output
You should see:
```
Starting Metro Bundler
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### 2. QR Code
- A QR code will appear in terminal
- Scan with Expo Go app (Android) or Camera app (iOS)

### 3. App Loading
- "Building JavaScript bundle" message
- Progress bar
- App launches on device

### 4. Login Screen
- You should see the Snap & Sell login screen
- Camera emoji 📸
- Email and password fields
- Demo credentials hint

## Test the App

### Quick Test Flow (5 minutes)

1. **Login** ✅
   - Email: demo@snapsell.com
   - Password: demo123
   - Tap "Sign In"

2. **Browse Marketplace** ✅
   - See 2 mock listings
   - Tap a product to view details
   - Go back to marketplace

3. **Create Listing** ✅
   - Tap "Sell" tab (camera icon)
   - Tap "Choose from Gallery"
   - Select any image
   - Wait 2 seconds for AI analysis
   - Review auto-generated details
   - Tap "Publish Listing"

4. **View Your Listings** ✅
   - Tap "My Listings" tab
   - See your new listing
   - Long press to delete (optional)

5. **Check Profile** ✅
   - Tap "Profile" tab
   - View your stats
   - Explore menu options

## Troubleshooting

### App Won't Start
```bash
# Clear cache and restart
npm start -- --clear

# If that doesn't work, reinstall dependencies
rm -rf node_modules
npm install
npm start
```

### Can't Scan QR Code
- Ensure phone and computer on same WiFi
- Try typing the URL manually in Expo Go
- Check firewall settings

### Camera Not Working
- Grant camera permissions when prompted
- Restart Expo Go app
- Try "Choose from Gallery" instead

### Changes Not Showing
- Press 'r' in terminal to reload
- Shake device and tap "Reload"
- Clear cache: `npm start -- --clear`

### Build Errors
- Check Node.js version: `node --version` (should be 14+)
- Update npm: `npm install -g npm@latest`
- Clear watchman: `watchman watch-del-all` (if installed)

## Success Indicators ✅

You'll know everything is working when:
- ✅ No red error screens
- ✅ Login screen appears
- ✅ Can login with demo credentials
- ✅ Can navigate between tabs
- ✅ Can view product details
- ✅ Can create a listing
- ✅ Images load properly
- ✅ Navigation is smooth

## Performance Notes

### Expected Load Times
- Initial app load: 2-5 seconds
- Screen transitions: < 300ms
- AI analysis (mock): 2 seconds
- Image loading: 1-2 seconds

### If App is Slow
- Close other apps
- Restart Expo Go
- Clear cache
- Check internet connection
- Try on different device

## Next Steps After Successful Run

1. **Explore the Code**
   - Check `src/screens/` for screen components
   - Review `src/services/ai.js` for AI mock
   - Look at `src/contexts/` for state management

2. **Customize**
   - Change colors in `src/constants/theme.js`
   - Add categories in `src/constants/categories.js`
   - Modify mock data in `src/contexts/ListingsContext.js`

3. **Integrate Real AI**
   - Follow instructions in README.md
   - Get Gemini API key
   - Update `src/services/ai.js`

4. **Add Backend**
   - Choose backend (Firebase/AWS/Supabase)
   - Update service layer
   - Implement real authentication

## Support Resources

- **Expo Docs**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **React Navigation**: https://reactnavigation.org/
- **Project README**: See README.md in project root
- **Quick Start**: See QUICKSTART.md
- **Development Notes**: See DEVELOPMENT.md

## Emergency Commands

```bash
# Nuclear option - complete reset
rm -rf node_modules package-lock.json
npm install
npm start -- --clear

# Check for issues
npm doctor

# Update Expo
npm install expo@latest

# Clear all caches
npm start -- --clear
watchman watch-del-all (if installed)
rm -rf $TMPDIR/react-*
```

---

## Ready to Launch? 🚀

If all checkboxes are checked, run:

```bash
npm start
```

And enjoy your Snap & Sell app! 🎉

---

**Remember**: This is a development build. For production deployment, see README.md for build and submission instructions.
