# Quick Start Guide - Snap & Sell

## 🚀 Running the App

### Step 1: Start the Development Server
```bash
cd SnapSell
npm start
```

### Step 2: Choose Your Platform

**Option A: Physical Device (Recommended)**
1. Install "Expo Go" app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in terminal
3. App will load on your device

**Option B: Emulator/Simulator**
```bash
npm run android  # Android emulator
npm run ios      # iOS simulator (macOS only)
```

**Option C: Web Browser**
```bash
npm run web
```

## 🔐 Demo Login

Use these credentials to test the app:
- **Email**: demo@snapsell.com
- **Password**: demo123

Or create a new account!

## 📱 Testing the Core Flow

### 1. Login
- Use demo credentials or sign up
- You'll be redirected to the marketplace

### 2. Browse Marketplace
- View existing listings
- Filter by category
- Tap any product to see details

### 3. Create a Listing
- Tap the "Sell" tab (camera icon)
- Choose "Take Photo" or "Choose from Gallery"
- Wait for AI analysis (2 seconds mock delay)
- Review and edit the auto-generated details
- Tap "Publish Listing"

### 4. Manage Your Listings
- Go to "My Listings" tab
- View all your products
- Tap to view details
- Long press to delete

### 5. Profile
- View your stats
- Access settings
- Logout

## 🎨 Customization Tips

### Change Theme Colors
Edit `src/constants/theme.js`:
```javascript
export const COLORS = {
  primary: '#YOUR_COLOR',  // Main brand color
  secondary: '#YOUR_COLOR', // Accent color
  // ... other colors
};
```

### Add New Categories
Edit `src/constants/categories.js`:
```javascript
export const CATEGORIES = [
  { id: 'your-category', name: 'Your Category', icon: '🎯' },
  // ... existing categories
];
```

### Modify Mock AI Responses
Edit `src/services/ai.js` to customize product data.

## 🔧 Common Commands

```bash
# Start development server
npm start

# Clear cache and restart
npm start -- --clear

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run on web
npm run web

# Install new package
npm install package-name
```

## 📂 Key Files to Know

- `App.js` - Root component
- `src/navigation/AppNavigator.js` - Navigation setup
- `src/contexts/` - Global state management
- `src/services/ai.js` - AI mock service (replace with real Gemini API)
- `src/services/storage.js` - Local data persistence
- `src/constants/theme.js` - App styling

## 🐛 Troubleshooting

### App won't start
```bash
# Clear cache
npm start -- --clear

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Camera not working
- Grant camera permissions when prompted
- Check app.json has correct permissions
- Restart Expo Go app

### Changes not reflecting
- Press 'r' in terminal to reload
- Or shake device and tap "Reload"

## 🎯 Next Steps

1. **Integrate Real AI**: Replace mock AI service with Gemini 2.5 Flash
2. **Add Backend**: Connect to Firebase, AWS, or your preferred backend
3. **Implement Payments**: Add Stripe or PayPal integration
4. **Add Chat**: Enable buyer-seller communication
5. **Deploy**: Build and publish to App Store/Play Store

## 📚 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Gemini API](https://ai.google.dev/)

## 💡 Pro Tips

- Use Expo Go for fastest development
- Enable Fast Refresh for instant updates
- Use React DevTools for debugging
- Test on real devices for best experience
- Keep mock data for testing without backend

---

Happy coding! 🎉
