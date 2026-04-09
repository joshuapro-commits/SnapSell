# Technology Stack

## Programming Languages
- **JavaScript**: Primary language (React Native)
- **JSX**: React component syntax
- **JSON**: Configuration and data files

## Framework & Runtime
- **React Native**: v0.81.5 - Cross-platform mobile framework
- **React**: v19.1.0 - UI library
- **Expo**: ~54.0.10 - Development platform and toolchain

## Core Dependencies

### Navigation
- **@react-navigation/native**: v7.1.33 - Navigation framework
- **@react-navigation/native-stack**: v7.14.5 - Stack navigator
- **@react-navigation/bottom-tabs**: v7.15.5 - Bottom tab navigator
- **react-native-screens**: ~4.16.0 - Native screen optimization
- **react-native-gesture-handler**: ~2.28.0 - Touch gesture handling
- **react-native-safe-area-context**: ~5.6.2 - Safe area management
- **@react-native-masked-view/masked-view**: 0.3.2 - Masked view component

### UI & Styling
- **@expo/vector-icons**: v15.1.1 - Icon library
- **expo-linear-gradient**: ~15.0.8 - Gradient backgrounds
- **react-native-svg**: v15.15.4 - SVG rendering
- **lottie-react-native**: ~7.3.1 - Animation library

### Fonts
- **expo-font**: ~14.0.11 - Custom font loading
- **@expo-google-fonts/poppins**: v0.4.1
- **@expo-google-fonts/montserrat**: v0.4.2
- **@expo-google-fonts/roboto**: v0.4.3

### Camera & Media
- **expo-camera**: ~17.0.10 - Camera access
- **expo-image-picker**: ~17.0.10 - Image selection from gallery
- **expo-file-system**: ~19.0.21 - File system operations

### Storage
- **@react-native-async-storage/async-storage**: 2.2.0 - Local data persistence

### AI Integration
- **@google/generative-ai**: v0.24.1 - Gemini AI SDK (ready for integration)

### Other
- **expo-status-bar**: ~3.0.9 - Status bar configuration

## Development Dependencies
- **babel-preset-expo**: v55.0.11 - Babel configuration for Expo

## Build System
- **Metro**: React Native bundler (configured via metro.config.js)
- **Babel**: JavaScript transpiler (configured via babel.config.js)
- **Gradle**: Android build system (v8.x)

## Development Commands

### Start Development Server
```bash
npm start
# or
expo start
```

### Platform-Specific Builds
```bash
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS device/simulator (macOS only)
npm run web        # Run in web browser
```

### Alternative Start Commands
```bash
expo start --android    # Start and open on Android
expo start --ios        # Start and open on iOS
expo start --web        # Start and open in browser
expo start --clear      # Start with cleared cache
```

## Configuration Files

### package.json
- Project metadata and dependencies
- NPM scripts for development commands
- Version: 1.0.0

### app.json
- Expo configuration
- App name: "Snap & Sell"
- Platform-specific settings (iOS, Android, Web)
- Permissions configuration
- Plugin configuration

### babel.config.js
- Babel transpiler configuration
- Preset: babel-preset-expo

### metro.config.js
- Metro bundler configuration
- Asset resolution settings

## Platform Support
- **iOS**: Tablet support enabled, camera and photo library permissions configured
- **Android**: Adaptive icon, camera and storage permissions configured
- **Web**: Favicon configured, limited functionality

## Environment Requirements
- **Node.js**: v14 or higher
- **npm** or **yarn**: Package manager
- **Expo CLI**: Development tooling
- **Expo Go**: Mobile app for testing (iOS/Android)

## API Integrations
- **Gemini 2.5 Flash**: AI image analysis (fully integrated with optimized prompts)
  - Image analysis with product identification
  - Platform-specific description generation
  - Price suggestions in Philippine Peso
  - Hashtag and location generation
- **Carousell API**: Marketplace integration (mock implementation ready for OAuth)
- **Facebook Graph API**: Marketplace integration (mock implementation ready for OAuth)

## Storage Strategy
- **Current**: AsyncStorage for local persistence
- **Production Ready For**:
  - Firebase Firestore
  - AWS Amplify
  - Supabase
  - Custom REST/GraphQL API

## Version Information
- **App Version**: 1.0.0
- **Package Name**: com.joshuaseziba.SnapSell
- **Slug**: SnapSell
