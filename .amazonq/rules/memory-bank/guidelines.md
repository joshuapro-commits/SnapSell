# Development Guidelines

## Code Quality Standards

### File Structure
- **Single Export per Screen**: Each screen file exports one main component (e.g., `export const HomeScreen`, `export const ListingEditorScreen`)
- **Imports Organization**: Group imports logically - React/React Native first, then third-party libraries, then local imports
- **StyleSheet at Bottom**: All StyleSheet.create() definitions placed at the end of the file

### Naming Conventions
- **Components**: PascalCase for component names (HomeScreen, ListingEditorScreen)
- **Files**: PascalCase for component files matching component name (HomeScreen.js, ListingEditorScreen.js)
- **Variables**: camelCase for state variables and functions (selectedCategory, handleEditPress, showImagePicker)
- **Constants**: UPPER_SNAKE_CASE for true constants (MOCK_LISTINGS, GEMINI_API_KEY)
- **Style Objects**: camelCase for style names (container, modalOverlay, cardButton)

### Component Structure Pattern
```javascript
// 1. Imports
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. Component Definition
export const ComponentName = ({ navigation, route }) => {
  // 3. Hooks (contexts, state, refs, effects)
  const { user } = useAuth();
  const [state, setState] = useState(initialValue);
  
  // 4. Handler Functions
  const handleAction = () => {
    // implementation
  };
  
  // 5. JSX Return
  return (
    <View style={styles.container}>
      {/* content */}
    </View>
  );
};

// 6. Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
});
```

## React & React Native Patterns

### State Management
- **useState for Local State**: Use for component-specific state (modals, dropdowns, form inputs)
- **Context API for Global State**: Use custom hooks (useAuth, useListings) to access context
- **Destructuring Context**: Always destructure needed values from context hooks
```javascript
const { user } = useAuth();
const { allListings, addListing } = useListings();
```

### Hooks Usage
- **useEffect for Side Effects**: Load data, setup animations, cleanup
- **useRef for Animations**: Store Animated.Value instances
- **Custom Hooks**: Access contexts via custom hooks (useAuth, useListings)

### Navigation Patterns
- **Props Destructuring**: Always destructure `{ navigation, route }` from props
- **Route Params**: Access via `route.params.paramName`
- **Navigation Methods**:
  - `navigation.navigate('ScreenName')` - Navigate to screen
  - `navigation.goBack()` - Go back
  - `navigation.replace('ScreenName')` - Replace current screen
  - Pass params: `navigation.navigate('Screen', { param: value })`

### Conditional Rendering
- **Ternary for Simple Conditions**: `{condition ? <ComponentA /> : <ComponentB />}`
- **Logical AND for Single Branch**: `{condition && <Component />}`
- **Early Returns**: Not commonly used; prefer conditional JSX in return

## Styling Conventions

### StyleSheet Patterns
- **Inline Styles for Dynamic Values**: Use array syntax for combining styles
```javascript
style={[styles.base, { backgroundColor: dynamicColor }]}
style={[styles.thumbnail, selectedThumbnail === index && styles.thumbnailSelected]}
```

### Layout Patterns
- **Flexbox Primary**: Use flexbox for all layouts (flexDirection, justifyContent, alignItems)
- **Absolute Positioning**: For overlays, floating elements (floatingHeader, thumbnailContainer)
- **SafeAreaView**: Wrap top-level screens with SafeAreaView from 'react-native-safe-area-context'
```javascript
<SafeAreaView style={styles.container} edges={['top']}>
```

### Color & Typography
- **Custom Fonts**: Use Montserrat font family with weights (Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold)
- **Font Weights**: Specify both fontWeight and fontFamily for consistency
- **Color Palette**: Use hex colors consistently (#7704F4 for primary purple, #FF8C42 for accent orange)

### Common Style Patterns
- **Card Components**: Rounded corners (borderRadius: 16-20), white background, padding
- **Buttons**: Gradient backgrounds using LinearGradient, rounded (borderRadius: 20-30)
- **Icons**: Ionicons with consistent sizing (20-24 for standard, 16 for small)
- **Spacing**: Consistent padding/margin values (12, 16, 20, 24, 28)
- **FAB Button**: 56x56 size, borderRadius 28, positioned absolute (bottom: 100, right: 20), #FF6B35 background
- **Tab Bar**: Uniform across screens with paddingHorizontal: 40, paddingVertical: 16, paddingBottom: 28
- **Background Colors**: #FAFAFA for main container, #FFF for cards and tab bar

## Component Patterns

### Modal Implementation
```javascript
// State for modal visibility
const [modalVisible, setModalVisible] = useState(false);

// Modal with backdrop
<Modal visible={modalVisible} transparent={true} animationType="fade">
  <View style={styles.modalBackdrop}>
    <View style={styles.modalContent}>
      {/* content */}
    </View>
  </View>
</Modal>
```

### Dropdown Pattern
```javascript
// State for dropdown
const [showDropdown, setShowDropdown] = useState(false);

// Toggle button
<TouchableOpacity onPress={() => setShowDropdown(!showDropdown)}>

// Conditional dropdown list
{showDropdown && (
  <View style={styles.dropdownList}>
    {items.map((item) => (
      <TouchableOpacity onPress={() => {
        setSelectedItem(item);
        setShowDropdown(false);
      }}>
    ))}
  </View>
)}
```

### Image Handling
- **expo-image-picker**: Use for camera and gallery access
- **Permission Handling**: Check permissions before launching picker
- **Image URI**: Pass imageUri through navigation params
```javascript
const result = await ImagePicker.launchCameraAsync({
  mediaTypes: ['images'],
  allowsEditing: false,
  quality: 0.8,
});
if (!result.canceled) {
  navigation.navigate('Screen', { imageUri: result.assets[0].uri });
}
```

### Gradient Usage
```javascript
import { LinearGradient } from 'expo-linear-gradient';

<LinearGradient
  colors={['#7C3AED', '#FF7A2F']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={styles.gradientButton}
>
  <Text style={styles.buttonText}>Button Text</Text>
</LinearGradient>
```

## Service Layer Patterns

### AI Service Structure
- **Async/Await**: All service methods are async
- **Try-Catch**: Wrap API calls in try-catch blocks
- **Error Handling**: Return structured error objects
```javascript
try {
  const result = await apiCall();
  return { success: true, data: result };
} catch (error) {
  console.error('Error:', error);
  return { success: false, error: error.message };
}
```

### Gemini AI Integration
- **Model Initialization**: Use GoogleGenerativeAI with API key
- **Prompt Engineering**: Detailed prompts with JSON structure requirements
- **Response Parsing**: Extract JSON from response using regex
```javascript
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const result = await model.generateContent([prompt, imageData]);
const text = response.text();
const jsonMatch = text.match(/\{[\s\S]*\}/);
const data = JSON.parse(jsonMatch[0]);
```

### Context Provider Pattern
```javascript
const Context = createContext(null);

export const Provider = ({ children }) => {
  const [state, setState] = useState(initialState);
  
  const methods = {
    addItem: async (item) => { /* implementation */ },
    updateItem: async (id, updates) => { /* implementation */ },
  };
  
  return (
    <Context.Provider value={{ state, ...methods }}>
      {children}
    </Context.Provider>
  );
};

export const useCustomHook = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useCustomHook must be used within Provider');
  }
  return context;
};
```

## Navigation Architecture

### Stack Navigator Setup
```javascript
const Stack = createNativeStackNavigator();

<Stack.Navigator screenOptions={{ 
  headerShown: false,
  animation: 'ios_from_right'
}}>
  {!user ? (
    // Auth screens
    <Stack.Screen name="Login" component={LoginScreen} />
  ) : (
    // App screens
    <Stack.Screen name="MainTabs" component={MainTabs} />
  )}
</Stack.Navigator>
```

### Screen Transitions
- **Animation**: Use `ios_from_right` for all screen transitions
- **Consistency**: Apply same animation across all navigators

### Bottom Tab Navigation
- **Custom Implementation**: Tab bar hidden in navigator, custom tab bar in each screen
- **Three Items**: Home, My Listings, Profile (no center FAB in tab bar)
- **Floating Action Button**: Positioned in bottom right corner (bottom: 100, right: 20)
- **FAB Color**: #FF6B35 (orange) across all screens
- **Tab Bar Styling**:
  - Background: #FFF
  - Padding: horizontal 40, vertical 16, bottom 28
  - Border radius: 24 (top corners only)
  - Consistent across all screens

### Conditional Navigation
- **Authentication-Based**: Show different screen stacks based on user state
- **Nested Navigation**: MainTabs contains bottom tab navigator with stack navigators

## Data Persistence

### AsyncStorage Pattern
```javascript
// Save data
await storageService.saveListings(listings);

// Load data
const stored = await storageService.getListings();
```

### Data Structure
- **Unique IDs**: Use `Date.now().toString()` for generating IDs
- **Timestamps**: Store ISO strings with `new Date().toISOString()`
- **User Association**: Include userId and userName in listings

## Error Handling

### Console Logging
- **Descriptive Logs**: Use clear prefixes ('=== TAKE PHOTO STARTED ===')
- **Error Logging**: Always log errors with context
```javascript
console.error('AI Analysis Error:', error);
```

### User Feedback
- **Alert for Errors**: Use Alert.alert() for user-facing errors
- **Loading States**: Show loading indicators during async operations
- **Success Feedback**: Navigate to success screens after operations

## Animation Patterns

### Animated Values
```javascript
const floatAnim = React.useRef(new Animated.Value(0)).current;

React.useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(floatAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
      Animated.timing(floatAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
    ])
  ).start();
}, []);

const translateY = floatAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [0, -20],
});
```

### Modal Animations
- **Slide Animations**: Use Animated.spring or Animated.timing for modal entry/exit
- **Transform Property**: Apply translateY for slide effects
- **Native Driver**: Always use `useNativeDriver: true` when possible

## Best Practices

### Performance
- **useNativeDriver**: Use for transform and opacity animations
- **ScrollView**: Add `showsVerticalScrollIndicator={false}` for cleaner UI
- **Image Optimization**: Set quality parameter in image picker (0.8)

### Code Organization
- **Single Responsibility**: Each component handles one primary concern
- **Reusable Components**: Extract common UI patterns into components
- **Service Abstraction**: Keep business logic in service files

### User Experience
- **Loading States**: Show spinners during async operations
- **Feedback**: Provide visual feedback for user actions
- **Error Messages**: Display user-friendly error messages
- **Smooth Transitions**: Use animations for screen transitions and modals

### Security
- **API Keys**: Store in separate config files (config/gemini.js)
- **Environment Variables**: Use for sensitive data in production
- **Permission Handling**: Request and check permissions before accessing device features
