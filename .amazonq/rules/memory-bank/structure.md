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
- **ProductCard.js**: Card component for displaying product listings
- **LoadingSpinner.js**: Loading indicator component
- **FAB.js**: Floating Action Button for primary actions
- **TabBar.js**: Custom bottom tab bar navigation
- **SideMenu.js**: Drawer menu component
- **SnapSellIntro.js**: Introductory component for new users

### Screens (`src/screens/`)
Full-screen views representing app pages:
- **Authentication**: LoginScreen, SignupScreen
- **Onboarding**: OnboardingContainer, OnboardingScreen1-3, SplashScreen
- **Core Features**: HomeScreen, CameraScreen, ListingEditorScreen
- **Management**: MyListingsScreen, ProductDetailScreen, ProfileScreen
- **Platform Integration**: ConnectPlatformsScreen
- **Feedback**: AnalyzingScreen, ListingSuccessScreen, PaywallScreen

### Navigation (`src/navigation/`)
Navigation structure and routing:
- **AppNavigator.js**: Root navigation container with authentication flow
- **MainTabs.js**: Bottom tab navigation for main app sections
- **DrawerNavigator.js**: Side drawer navigation for additional features

### Contexts (`src/contexts/`)
Global state management using React Context API:
- **AuthContext.js**: User authentication state and methods
- **ListingsContext.js**: Marketplace listings state and CRUD operations

### Services (`src/services/`)
Business logic and external integrations:
- **ai.js**: AI image analysis service (mock implementation, ready for Gemini 2.5 Flash)
- **auth.js**: Authentication service with user management
- **storage.js**: AsyncStorage wrapper for data persistence
- **platforms.js**: Platform connection service (Carousell, Facebook Marketplace)

### Constants (`src/constants/`)
App-wide configuration and theming:
- **categories.js**: Product category definitions
- **theme.js**: Color palette, spacing, typography

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
CameraScreen → ai.js (Gemini 2.5 Flash) → AnalyzingScreen → ListingEditorScreen → platformService.publishListing() → ListingsContext → storage.js → ListingSuccessScreen
```

### Multi-Platform Publishing Flow
```
ListingEditorScreen (platform selection) → platformService.publishListing(selectedPlatforms) → Carousell API + Facebook API (mock) → Success/Error Results → ListingSuccessScreen
```

### Platform Connection Flow
```
ConnectPlatformsScreen → platforms.js → storage.js
```

### Marketplace Browsing Flow
```
HomeScreen → ListingsContext → ProductDetailScreen (with platform badges)
```

### My Listings Flow
```
MyListingsScreen (with platform badges) → ListingEditorScreen → Update/Delete
```

## File Naming Conventions
- **Screens**: PascalCase with "Screen" suffix (e.g., HomeScreen.js)
- **Components**: PascalCase (e.g., ProductCard.js)
- **Services**: camelCase (e.g., ai.js, auth.js)
- **Constants**: camelCase (e.g., categories.js, theme.js)
- **Contexts**: PascalCase with "Context" suffix (e.g., AuthContext.js)
