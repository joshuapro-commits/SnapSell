# Snap & Sell

An innovative mobile application that revolutionizes online selling by leveraging AI for instant product listing creation.

## Features

- 📸 **AI-Powered Image Analysis**: Take a photo and let AI identify the product
- ✍️ **Auto-Generated Descriptions**: AI creates compelling product descriptions
- 💰 **Smart Pricing**: Get optimal price suggestions based on market data
- 🏪 **Built-in Marketplace**: Browse and sell products like Facebook Marketplace
- 📦 **Listing Management**: Track and manage all your listings
- 👤 **User Profiles**: Personalized user experience

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Storage**: AsyncStorage for local data persistence
- **Camera**: Expo Camera & Image Picker
- **AI**: Mock AI service (ready for Gemini 2.5 Flash integration)

## Project Structure

```
SnapSell/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Button.js
│   │   ├── Input.js
│   │   ├── ProductCard.js
│   │   └── LoadingSpinner.js
│   ├── screens/          # App screens
│   │   ├── LoginScreen.js
│   │   ├── SignupScreen.js
│   │   ├── HomeScreen.js
│   │   ├── CameraScreen.js
│   │   ├── ListingEditorScreen.js
│   │   ├── ProductDetailScreen.js
│   │   ├── MyListingsScreen.js
│   │   └── ProfileScreen.js
│   ├── navigation/       # Navigation configuration
│   │   ├── AppNavigator.js
│   │   └── MainTabs.js
│   ├── contexts/         # React Context providers
│   │   ├── AuthContext.js
│   │   └── ListingsContext.js
│   ├── services/         # Business logic & API services
│   │   ├── auth.js
│   │   ├── ai.js
│   │   └── storage.js
│   ├── constants/        # App constants
│   │   ├── categories.js
│   │   └── theme.js
│   └── utils/           # Helper functions
│       └── helpers.js
├── assets/              # Images and static files
├── App.js              # Root component
└── package.json        # Dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Expo Go app (for testing on physical device)

### Installation

1. Navigate to the project directory:
```bash
cd SnapSell
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
npm run android  # For Android
npm run ios      # For iOS (macOS only)
npm run web      # For web browser
```

### Testing the App

**Demo Credentials:**
- Email: `demo@snapsell.com`
- Password: `demo123`

Or create a new account using the signup screen.

## Key Features Walkthrough

### 1. Authentication
- Mock authentication system with demo accounts
- Login and signup functionality
- Persistent user sessions

### 2. Marketplace (Home)
- Browse all listings from all users
- Filter by category (Electronics, Clothing, Furniture, Books, Sporting Goods)
- View product details
- Pull to refresh

### 3. Snap & Sell (Camera)
- Take photos or select from gallery
- AI analyzes the image (mock implementation)
- Auto-generates product details:
  - Product name and brand
  - Category identification
  - Condition assessment
  - Detailed description
  - Price suggestions with range

### 4. Listing Editor
- Edit AI-generated content
- Adjust price, description, category, and condition
- Preview before publishing
- Publish to marketplace

### 5. My Listings
- View all your active listings
- Edit or delete listings
- Track listing performance

### 6. Profile
- View user information
- Account statistics
- Settings and preferences
- Logout functionality

## AI Integration (Future)

The app is designed to integrate with **Gemini 2.5 Flash** for real AI capabilities:

### Current Mock Implementation
Located in `src/services/ai.js`, the mock service simulates:
- Image analysis with 2-second delay
- Random product data generation
- Price range suggestions

### Integration Steps for Gemini 2.5 Flash

1. Install Gemini SDK:
```bash
npm install @google/generative-ai
```

2. Update `src/services/ai.js`:
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const aiService = {
  async analyzeImage(imageUri) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Convert image to base64
    const imageData = await fetch(imageUri);
    const blob = await imageData.blob();
    
    const prompt = `Analyze this product image and provide:
    1. Product name
    2. Brand
    3. Category (electronics/clothing/furniture/books/sporting)
    4. Condition assessment
    5. Detailed description
    6. Suggested price range
    Format as JSON.`;
    
    const result = await model.generateContent([prompt, blob]);
    return JSON.parse(result.response.text());
  }
};
```

3. Add environment variables in `app.json`:
```json
{
  "expo": {
    "extra": {
      "geminiApiKey": "YOUR_API_KEY"
    }
  }
}
```

## Data Storage

Currently uses AsyncStorage for local persistence:
- User authentication data
- All marketplace listings
- User's personal listings

For production, consider migrating to:
- Firebase Firestore
- AWS Amplify
- Supabase

## Customization

### Theme
Edit `src/constants/theme.js` to customize colors, spacing, and typography.

### Categories
Add or modify product categories in `src/constants/categories.js`.

### Mock Data
Update mock listings in `src/contexts/ListingsContext.js`.

## Best Practices Implemented

- ✅ Clean component architecture
- ✅ Separation of concerns (UI, logic, data)
- ✅ Reusable components
- ✅ Context API for state management
- ✅ Consistent styling with theme constants
- ✅ Error handling and user feedback
- ✅ Loading states and spinners
- ✅ Responsive design
- ✅ Code organization and structure

## Future Enhancements

- [ ] Real AI integration with Gemini 2.5 Flash
- [ ] Backend API integration
- [ ] Real-time chat between buyers and sellers
- [ ] Payment processing
- [ ] Push notifications
- [ ] Advanced search and filters
- [ ] User ratings and reviews
- [ ] Shipping integration
- [ ] Analytics dashboard
- [ ] Social sharing

## Troubleshooting

### Camera not working
- Ensure camera permissions are granted
- Check `app.json` for proper permission configuration
- Restart the Expo app

### Images not displaying
- Check internet connection for remote images
- Verify image URIs are valid
- Clear app cache and restart

### AsyncStorage issues
- Clear app data
- Reinstall the app
- Check for storage quota limits

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Support

For issues or questions, please create an issue in the repository.

---

Built with ❤️ using React Native and Expo
