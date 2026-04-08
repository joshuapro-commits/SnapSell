# Technology Stack

## Programming Languages
- **JavaScript**: Primary language (React/React Native)
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
- **@react-navigation/bottom-tabs**: v7.15.5 - Tab navigator
- **react-native-screens**: ~4.16.0 - Native screen optimization
- **react-native-safe-area-context**: ~5.6.2 - Safe area handling
- **react-native-gesture-handler**: ~2.28.0 - Gesture system

### UI & Styling
- **expo-linear-gradient**: ~15.0.8 - Gradient components
- **@react-native-masked-view/masked-view**: 0.3.2 - Masked views
- **@expo/vector-icons**: ^15.1.1 - Icon library
- **react-native-svg**: ^15.15.4 - SVG support
- **lottie-react-native**: ~7.3.1 - Animation library

### Fonts
- **expo-font**: ~14.0.11 - Font loading
- **@expo-google-fonts/poppins**: ^0.4.1
- **@expo-google-fonts/montserrat**: ^0.4.2
- **@expo-google-fonts/roboto**: ^0.4.3

### Camera & Media
- **expo-camera**: ~17.0.10 - Camera access
- **expo-image-picker**: ~17.0.10 - Gallery access
- **expo-file-system**: ~19.0.21 - File operations

### Data & Storage
- **@react-native-async-storage/async-storage**: 2.2.0 - Local storage

### AI Integration
- **@google/generative-ai**: ^0.24.1 - Gemini AI SDK

### Other
- **expo-status-bar**: ~3.0.9 - Status bar control

## Build System
- **Metro**: React Native bundler (configured via metro.config.js)
- **Babel**: JavaScript transpiler (babel-preset-expo ^55.0.11)
- **Gradle**: Android build system (configured in android/)

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

### Alternative Commands
```bash
expo run:android   # Build and run Android
expo run:ios       # Build and run iOS
expo start --web   # Start web version
```

## Configuration Files

### Expo Configuration (`app.json`)
- App name, slug, version
- Platform-specific settings (iOS, Android, Web)
- Permissions configuration
- Plugin configuration
- Icon and splash screen settings

### Babel Configuration (`babel.config.js`)
- Preset: babel-preset-expo
- Transpilation rules

### Metro Configuration (`metro.config.js`)
- Bundler configuration
- Asset resolution

### Package Configuration (`package.json`)
- Dependencies and versions
- Scripts for development
- Project metadata

## Platform Support
- **iOS**: Tablet support enabled, camera/photo permissions configured
- **Android**: Adaptive icons, camera/storage permissions configured
- **Web**: Favicon configured, limited functionality

## Permissions Required

### iOS (Info.plist)
- NSCameraUsageDescription: Camera access for product photos
- NSPhotoLibraryUsageDescription: Photo library access

### Android (Manifest)
- android.permission.CAMERA
- android.permission.READ_EXTERNAL_STORAGE
- android.permission.WRITE_EXTERNAL_STORAGE
- android.permission.RECORD_AUDIO

## Development Environment Requirements
- **Node.js**: v14 or higher
- **npm** or **yarn**: Package manager
- **Expo CLI**: Development tooling
- **Expo Go**: Mobile app for testing (iOS/Android)
- **Android Studio**: For Android development (optional)
- **Xcode**: For iOS development (macOS only, optional)

## API Integration Points
- **Gemini 2.5 Flash**: AI image analysis (configured, using mock currently)
- **AsyncStorage**: Local data persistence
- **Expo Camera API**: Camera and image picker functionality
- **Expo File System**: Image file handling
