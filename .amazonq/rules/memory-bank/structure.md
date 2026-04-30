# Project Structure

## Directory Organization

```
SnapSell/
├── src/                      # Source code
│   ├── components/           # Reusable UI components
│   ├── config/              # Configuration files
│   ├── constants/           # App-wide constants
│   ├── contexts/            # React Context providers
│   ├── navigation/          # Navigation configuration
│   ├── screens/             # Screen components
│   ├── services/            # Business logic & API services
│   └── utils/               # Helper functions
├── assets/                  # Static assets (images, animations)
├── android/                 # Android native configuration
├── .amazonq/               # Amazon Q rules and memory bank
├── App.js                  # Root component
├── index.js                # Entry point
└── Configuration files     # package.json, app.json, etc.
```

## Core Components

### Components (`src/components/`)
Reusable UI building blocks used across screens:
- **Button.js**: Custom button component with consistent styling
- **Input.js**: Text input component with validation support
- **ProductCard.js**: Card component for displaying product listings with verification badges
- **LoadingSpinner.js**: Loading indicator component
- **FAB.js**: Floating Action Button for primary actions
- **TabBar.js**: Custom bottom tab bar navigation
- **SideMenu.js**: Drawer menu component
- **SnapSellIntro.js**: Introductory component for new users
- **VerificationBadge.js**: Verification badge component with full/compact variants (Gold/Silver/Bronze)
- **VerificationScore.js**: Progress bar showing verification score (0-100)
- **SellerVerificationBadge.js**: Seller reputation badge for profile display
- **SnapSellVerificationBanner.js**: Prominent verification banner for product detail pages
- **TrialStatusBanner.js**: Trial countdown banner (created, not integrated)
- **SubscriptionModal.js**: Subscription modal with pricing (created, not integrated)

### Screens (`src/screens/`)
Full-screen views representing app pages:
- **Authentication**: LoginScreen (with auto-login for development), SignupScreen
- **Onboarding**: OnboardingContainer (scroll-based animations), OnboardingScreen1-3 (staggered animations), SplashScreen
- **Core Features**: HomeScreen (real-time stats, staggered card animations), CameraScreen (image picker modal, photo source tracking), ListingEditorScreen (with verification display)
- **Management**: MyListingsScreen (status-based filtering: active/sold/draft, verification badges), ProductDetailScreen (with verification banner), ProfileScreen (with seller verification score)
- **Platform Integration**: ConnectPlatformsScreen (manage Carousell, Facebook, Shopee connections), CarousellWebView (with FAB auto-click), FacebookUnifiedWebView (login + sell modes)
- **Feedback**: AnalyzingScreen (with verification step), ListingSuccessScreen (optimized sizing, per-platform results), PaywallScreen
- **Premium**: PaywallScreen (SnapSell Premium upgrade flow)

### Navigation (`src/navigation/`)
Navigation structure and routing:
- **AppNavigator.js**: Root navigation container with authentication flow
- **MainTabs.js**: Bottom tab navigation for main app sections
- **DrawerNavigator.js**: Side drawer navigation for additional features

### Contexts (`src/contexts/`)
Global state management using React Context API:
- **AuthContext.js**: User authentication state and methods (login, signup, logout, auto-login)
- **ListingsContext.js**: Marketplace listings state and CRUD operations with status tracking (active/sold/draft)

### Services (`src/services/`)
Business logic and external integrations:
- **ai.js**: AI image analysis service (Gemini 2.5 Flash Lite integrated)
  - analyzeImage: Product identification with platform-specific descriptions
  - enhanceImage: Mock image enhancement (ready for Cloudinary/DeepAI integration)
  - generateDescription: AI-powered description generation
  - suggestPrice: Philippine Peso price suggestions with market research
- **verification.js**: AI-powered verification service
  - verifyListing: 4-tier verification (photo source, AI consistency, metadata, timestamp)
  - getSellerScore: Calculate seller reputation from all listings
  - Scoring: 0-100 points with Gold/Silver/Bronze/Unverified levels
- **auth.js**: Authentication service with user management (no mock data, AsyncStorage-based)
- **storage.js**: AsyncStorage wrapper for data persistence
  - User management: getAllUsers, addUser, findUserByEmail
  - Listings: saveListings, getListings
  - Platform tokens: savePlatformToken, getPlatformTokens, removePlatformToken
  - Onboarding: setOnboardingComplete, getOnboardingComplete
  - Utility: clearAll for data reset
- **platforms.js**: Platform connection service (Carousell, Facebook, Shopee)
  - getConnectedPlatforms: Check connection status
  - connectCarousell/connectFacebook/connectShopee: OAuth flows (mock)
  - disconnectPlatform: Remove platform connection
  - publishListing: Multi-platform publishing with error handling
  - validateTokens: Check token expiration
  - refreshToken: Token refresh logic
- **subscription.js**: Subscription management service (created, not integrated)
  - Trial tracking and premium access checks
  - AsyncStorage integration for subscription state
- **imageEnhancement.js**: Image badge overlay service (created, NOT RECOMMENDED for use)

### Constants (`src/constants/`)
App-wide configuration and theming:
- **categories.js**: Product category definitions
- **theme.js**: Color palette, spacing, typography
- **carousellRegions.js**: Carousell region selector (Philippines, Singapore, Indonesia only)
- **facebookCategories.js**: Facebook Product Category (FPC) ID mapping system

### Config (`src/config/`)
External service configurations:
- **gemini.js**: Gemini AI API configuration

### Utils (`src/utils/`)
Helper functions and utilities:
- **helpers.js**: Common utility functions
- **animations.js**: Animation configurations

## Architectural Patterns

### Component Architecture
- **Separation of Concerns**: UI components separated from business logic
- **Reusability**: Shared components in dedicated directory
- **Composition**: Complex screens built from smaller components

### State Management
- **Context API**: Global state for authentication and listings
- **Local State**: Component-level state with useState hooks
- **Persistent Storage**: AsyncStorage for data that survives app restarts

### Navigation Pattern
- **Stack Navigation**: For hierarchical screen flows
- **Tab Navigation**: For main app sections (Home, Camera, Listings, Profile)
- **Drawer Navigation**: For secondary features and settings
- **Nested Navigation**: Tabs within stacks for complex flows

### Service Layer Pattern
- **Abstraction**: Business logic separated from UI components
- **Mock Services**: Ready for real API integration
- **Error Handling**: Consistent error handling across services

### Data Flow
1. User interacts with UI (Screen/Component)
2. Screen calls Service method
3. Service performs business logic
4. Service updates Context or returns data
5. Context notifies subscribed components
6. UI re-renders with new data

## Key Relationships

### Authentication Flow
```
LoginScreen/SignupScreen → AuthContext → auth.js → storage.js
```

### Listing Creation Flow
```
CameraScreen (photo source tracking) → ai.js (Gemini 2.5 Flash Lite) → AnalyzingScreen (with verification) → verification.js (4-tier checks) → ListingEditorScreen (verification display) → platformService.publishListing() → ListingsContext → storage.js → ListingSuccessScreen (with per-platform results)
```

### Multi-Platform Publishing Flow
```
ListingEditorScreen (platform selection: Carousell/Facebook/Shopee) → platformService.publishListing(selectedPlatforms) → Carousell API + Facebook API + Shopee API (mock) → Success/Error Results per platform → ListingSuccessScreen
```

### Platform Connection Flow
```
ProfileScreen → ConnectPlatformsScreen → platforms.js (OAuth mock) → storage.js → Connection Status Display
```

### Marketplace Browsing Flow
```
HomeScreen → ListingsContext → ProductDetailScreen (with platform badges + verification banner)
```

### My Listings Flow
```
MyListingsScreen (with platform badges + verification badges) → ListingEditorScreen → Update/Delete
```

### Verification Flow
```
CameraScreen (photoSource) → AnalyzingScreen → verification.js (4 checks) → Listing with verification data → UI displays badges/scores
```

### Carousell Sell Flow
```
ListingEditorScreen → CarousellWebView → Auto-click FAB (3s delay) → Fill form → Publish → Success
```

## File Naming Conventions
- **Screens**: PascalCase with "Screen" suffix (e.g., HomeScreen.js)
- **Components**: PascalCase (e.g., ProductCard.js)
- **Services**: camelCase (e.g., ai.js, auth.js)
- **Constants**: camelCase (e.g., categories.js, theme.js)
- **Contexts**: PascalCase with "Context" suffix (e.g., AuthContext.js)
