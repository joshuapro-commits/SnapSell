# Project Structure

## Directory Organization

```
SnapSell/
├── src/                      # Source code directory
│   ├── components/           # Reusable UI components
│   ├── config/              # Configuration files
│   ├── constants/           # App-wide constants
│   ├── contexts/            # React Context providers
│   ├── navigation/          # Navigation configuration
│   ├── screens/             # Screen components
│   ├── services/            # Business logic & API services
│   └── utils/               # Helper functions
├── assets/                  # Static assets (images, icons)
├── android/                 # Android native configuration
├── .amazonq/               # Amazon Q rules and memory bank
├── App.js                  # Root application component
├── index.js                # Entry point
├── app.json                # Expo configuration
└── package.json            # Dependencies and scripts
```

## Core Components

### Components (`src/components/`)
Reusable UI building blocks used across screens:
- **Button.js**: Custom button component with consistent styling
- **Input.js**: Text input component with validation support
- **ProductCard.js**: Card component for displaying product listings
- **LoadingSpinner.js**: Loading indicator component
- **SideMenu.js**: Drawer navigation menu
- **SnapSellIntro.js**: Onboarding introduction component

### Screens (`src/screens/`)
Full-page views representing app functionality:
- **LoginScreen.js**: User authentication login
- **SignupScreen.js**: New user registration
- **HomeScreen.js**: Main dashboard with stats, recent listings, and FAB button
- **CameraScreen.js**: Photo capture and gallery selection
- **AnalyzingScreen.js**: AI processing animation screen
- **ListingEditorScreen.js**: Edit AI-generated listing details
- **ListingSuccessScreen.js**: Confirmation after publishing
- **ProductDetailScreen.js**: Detailed product view
- **MyListingsScreen.js**: User's personal listings management (no header, SafeAreaView with top edge)
- **ProfileScreen.js**: Earnings summary and settings (no profile header section)
- **OnboardingScreen1/2/3.js**: First-time user onboarding
- **SplashScreen.js**: App launch screen

### Screen Layout Patterns
- **Uniform Tab Bars**: All main screens (Home, My Listings, Profile) have identical tab bar styling
- **FAB Positioning**: Floating action button consistently positioned in bottom right corner across screens
- **SafeAreaView Usage**: Screens use SafeAreaView with edges={['top']} for proper status bar handling
- **No Headers on Some Screens**: My Listings and Profile screens have no header section for cleaner layout

### Navigation (`src/navigation/`)
App navigation structure:
- **AppNavigator.js**: Root navigation container with authentication flow
- **MainTabs.js**: Bottom tab navigation for main app sections
- **DrawerNavigator.js**: Side drawer navigation menu

### Contexts (`src/contexts/`)
Global state management using React Context API:
- **AuthContext.js**: User authentication state and methods
- **ListingsContext.js**: Marketplace listings data and CRUD operations

### Services (`src/services/`)
Business logic and external integrations:
- **auth.js**: Authentication service with mock implementation
- **ai.js**: AI image analysis service (mock, ready for Gemini integration)
- **storage.js**: AsyncStorage wrapper for data persistence

### Constants (`src/constants/`)
App-wide configuration values:
- **categories.js**: Product category definitions
- **theme.js**: Color palette, spacing, typography constants

### Configuration (`src/config/`)
- **gemini.js**: Gemini AI API configuration

### Utilities (`src/utils/`)
Helper functions and utilities:
- **helpers.js**: Common utility functions
- **animations.js**: Animation configurations

## Architectural Patterns

### Component Architecture
- **Functional Components**: All components use React hooks
- **Context API**: Global state management without Redux
- **Separation of Concerns**: UI, logic, and data layers are separated
- **Reusable Components**: Common UI elements extracted into components

### Navigation Pattern
- **Stack Navigation**: For hierarchical screen flows with ios_from_right animation
- **Tab Navigation**: Custom tab bar implementation (3 items: Home, My Listings, Profile)
- **FAB Navigation**: Floating action button for quick access to camera/sell functionality
- **Nested Navigation**: Tabs contain stack navigators
- **Hidden Native Tab Bar**: Native tab bar hidden, custom implementation in each screen

### Data Flow
1. **Authentication Flow**: AuthContext → Screens → Services
2. **Listings Flow**: ListingsContext → Screens → Storage Service
3. **AI Flow**: Camera → AI Service → Listing Editor → Storage

### State Management
- **Local State**: Component-level state with useState
- **Global State**: Context API for shared data
- **Persistent State**: AsyncStorage for data persistence

## Key Relationships

### Screen Dependencies
- All screens consume AuthContext for user state
- Marketplace screens consume ListingsContext for product data
- Camera flow: CameraScreen → AnalyzingScreen → ListingEditorScreen → ListingSuccessScreen

### Service Integration
- Auth service integrates with AsyncStorage for session persistence
- AI service processes images and returns structured product data
- Storage service provides abstraction over AsyncStorage

### Component Composition
- Screens compose multiple reusable components
- Navigation components wrap screen components
- Context providers wrap the entire app tree
