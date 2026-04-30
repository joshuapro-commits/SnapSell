# Development Guidelines

## Code Quality Standards

### File Structure and Organization
- **Consistent imports order**: External libraries first (React, React Native, Expo), then internal imports (contexts, services, components)
- **Named exports**: Use named exports for components (e.g., `export const HomeScreen = () => {}`)
- **Single responsibility**: Each file contains one primary component or service
- **Co-located styles**: StyleSheet definitions at the bottom of component files

### Formatting Conventions
- **Indentation**: 2 spaces consistently throughout the codebase
- **Line length**: Keep lines readable, break long JSX into multiple lines
- **Spacing**: Consistent spacing around operators, after commas, and in object literals
- **Semicolons**: Used consistently at the end of statements
- **Quotes**: Single quotes for strings, double quotes for JSX attributes

### Naming Standards
- **Components**: PascalCase with descriptive suffixes (e.g., `HomeScreen`, `ProductCard`, `LoadingSpinner`)
- **Services**: camelCase with "Service" suffix (e.g., `aiService`, `platformService`, `storageService`)
- **Contexts**: PascalCase with "Context" suffix (e.g., `AuthContext`, `ListingsContext`)
- **Functions**: camelCase with verb prefixes (e.g., `handlePress`, `loadListings`, `validateTokens`)
- **Constants**: UPPER_SNAKE_CASE for true constants (e.g., `MOCK_LISTINGS`, `GEMINI_API_KEY`)
- **State variables**: Descriptive camelCase (e.g., `selectedCategory`, `imagePickerVisible`, `connectedPlatforms`)

### Documentation Practices
- **JSDoc comments**: Used for service methods to describe purpose, parameters, and return values
- **Inline comments**: Explain complex logic, phase indicators (Phase 1/Phase 2), and future integration points
- **TODO comments**: Mark areas ready for real API integration
- **Error context**: Console.error statements include descriptive context

## Semantic Patterns

### React Component Patterns

#### Functional Components with Hooks
All components use functional component syntax with React Hooks:
```javascript
export const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const floatAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    loadData();
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Component content */}
    </SafeAreaView>
  );
};
```

#### Context API Usage
Custom hooks for accessing context with error boundaries:
```javascript
export const useListings = () => {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error('useListings must be used within ListingsProvider');
  }
  return context;
};
```

### Service Layer Patterns

#### Service Object Structure
Services exported as objects with async methods:
```javascript
export const aiService = {
  async analyzeImage(imageUri) {
    try {
      // Implementation
      return { success: true, data: result };
    } catch (error) {
      console.error('AI Analysis Error:', error);
      return { success: false, error: error.message };
    }
  },
};
```

#### Consistent Response Format
Services return objects with `success` boolean and either `data` or `error`:
```javascript
// Success response
return {
  success: true,
  data: { /* result data */ },
};

// Error response
return {
  success: false,
  error: error.message,
};
```

### State Management Patterns

#### Local State with useState
```javascript
const [selectedCategory, setSelectedCategory] = useState('Electronics');
const [loading, setLoading] = useState(true);
const [connectedPlatforms, setConnectedPlatforms] = useState({
  carousell: false,
  facebook: false,
});
```

#### Refs for Animations
```javascript
const floatAnim = useRef(new Animated.Value(0)).current;
const slideAnim = useRef(new Animated.Value(300)).current;
```

#### Effect Hooks for Data Loading
```javascript
useEffect(() => {
  loadConnectedPlatforms();
}, []);

const loadConnectedPlatforms = async () => {
  try {
    const platforms = await platformService.getConnectedPlatforms(user.id);
    setConnectedPlatforms(platforms);
  } catch (error) {
    console.error('Error loading platforms:', error);
  } finally {
    setLoading(false);
  }
};
```

### Navigation Patterns

#### Navigation Props
Components receive navigation prop and use it for screen transitions:
```javascript
export const HomeScreen = ({ navigation }) => {
  const handleNavigate = () => {
    navigation.navigate('AnalyzingScreen', { imageUri: result.assets[0].uri });
  };
};
```

#### Route Parameters
Access route parameters via route.params:
```javascript
export const ListingEditorScreen = ({ navigation, route }) => {
  const { productData, listing } = route.params;
  const data = productData || listing;
};
```

### UI/UX Patterns

#### Modal Patterns
Controlled modals with animation and backdrop:
```javascript
<Modal
  visible={menuVisible}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setMenuVisible(false)}
>
  <TouchableOpacity 
    style={styles.modalOverlay} 
    activeOpacity={1}
    onPress={() => setMenuVisible(false)}
  >
    <View style={styles.menuModal}>
      {/* Modal content */}
    </View>
  </TouchableOpacity>
</Modal>
```

#### Alert Confirmations
Use Alert.alert for destructive actions:
```javascript
Alert.alert(
  'Delete Listing',
  'Are you sure you want to delete this listing?',
  [
    { text: 'Cancel', style: 'cancel' },
    { 
      text: 'Delete', 
      style: 'destructive', 
      onPress: () => handleDelete() 
    }
  ]
);
```

#### Loading States
Consistent loading state handling:
```javascript
if (loading) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    </SafeAreaView>
  );
}
```

#### Success Screens with Lottie Animations
```javascript
const animationRef = useRef(null);

useEffect(() => {
  animationRef.current?.play();
}, []);

<LottieView
  ref={animationRef}
  source={require('../../assets/Success.json')}
  autoPlay
  loop={false}
  style={styles.lottieAnimation}
/>
```

### Animation Patterns

#### Animated Values
```javascript
const floatAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(floatAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
      Animated.timing(floatAnim, {
        toValue: 0,
        duration: 3000,
        useNativeDriver: true,
      }),
    ])
  ).start();
}, []);
```

#### Spring Animations for Modals and Cards
```javascript
// Modal slide-up animation
Animated.spring(slideAnim, {
  toValue: 0,
  useNativeDriver: true,
  tension: 65,
  friction: 11,
}).start();

// Card stagger animation (iOS-style)
const cardAnims = [0, 1, 2, 3].map(() => useRef(new Animated.Value(0)).current);

useEffect(() => {
  const animations = cardAnims.map((anim, index) => 
    Animated.spring(anim, {
      toValue: 1,
      delay: index * 100,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    })
  );
  Animated.parallel(animations).start();
}, []);
```

#### Onboarding Scroll Animations
```javascript
const scrollX = useRef(new Animated.Value(0)).current;

const opacity = scrollX.interpolate({
  inputRange: [(index - 1) * width, index * width, (index + 1) * width],
  outputRange: [0, 1, 0],
  extrapolate: 'clamp',
});

const scale = scrollX.interpolate({
  inputRange: [(index - 1) * width, index * width, (index + 1) * width],
  outputRange: [0.8, 1, 0.8],
  extrapolate: 'clamp',
});
```

### Styling Patterns

#### StyleSheet at Bottom
All styles defined in StyleSheet.create() at file bottom:
```javascript
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FAFAFA' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});
```

#### Consistent Color Palette
- Primary: `#FF6B35` (orange)
- Purple gradient: `#7704F4`, `#D493FF`
- Backgrounds: `#FAFAFA`, `#F8F9FC`, `#FFF`
- Text: `#000` (primary), `#666` (secondary), `#999` (tertiary)

#### Font Families
Montserrat font family with weight variants:
- Regular: `Montserrat_400Regular`
- Medium: `Montserrat_500Medium`
- SemiBold: `Montserrat_600SemiBold`
- Bold: `Montserrat_700Bold`

### Error Handling Patterns

#### Try-Catch with Logging
```javascript
try {
  const result = await platformService.connectCarousell(user.id);
  if (result.success) {
    setConnectedPlatforms({ ...connectedPlatforms, carousell: true });
    Alert.alert('Success', 'Carousell account connected!');
  } else {
    Alert.alert('Error', result.error || 'Failed to connect Carousell');
  }
} catch (error) {
  Alert.alert('Error', 'Failed to connect to Carousell');
}
```

#### Graceful Degradation
Services return fallback data on error:
```javascript
catch (error) {
  console.error('Price Suggestion Error:', error);
  const basePrice = 50;
  return {
    suggestedPrice: basePrice,
    priceRange: {
      min: Math.floor(basePrice * 0.8),
      max: Math.floor(basePrice * 1.2),
    },
  };
}
```

### Data Persistence Patterns

#### AsyncStorage Wrapper
All storage operations go through storageService:
```javascript
await storageService.savePlatformToken(userId, 'carousell', mockToken);
const tokens = await storageService.getPlatformTokens(userId);
await storageService.removePlatformToken(userId, platform);
```

#### AsyncStorage Keys
- `@snap_sell_user`: Current logged-in user
- `@snap_sell_users`: All registered users array
- `@snap_sell_listings`: All marketplace listings
- `@snap_sell_platform_tokens_{userId}`: Platform OAuth tokens per user
- `@snap_sell_onboarding_complete`: Onboarding completion status

#### Context + Storage Sync
Context providers sync state with AsyncStorage:
```javascript
const addListing = async (listing) => {
  const newListing = { 
    ...listing, 
    id: Date.now().toString(),
    status: 'active', // active, sold, or draft
    createdAt: new Date().toISOString(),
  };
  const updatedAll = [newListing, ...allListings];
  
  setAllListings(updatedAll);
  await storageService.saveListings(updatedAll);
  
  return newListing;
};
```

### Mock Implementation Patterns

#### Phase Comments
Code marked with phase indicators for future integration:
```javascript
// Mock authentication for now (Phase 1)
// In Phase 2, this will be real OAuth
const result = await platformService.connectCarousell(user.id);
```

#### Simulated Delays
Mock services include realistic delays:
```javascript
// Simulated processing delay
await new Promise(resolve => setTimeout(resolve, 1200));

// Mock API call - simulate network delay
await new Promise((resolve) => setTimeout(resolve, 1500));
```

#### Mock Data Generation
```javascript
const mockToken = {
  accessToken: `carousell_mock_token_${Date.now()}`,
  refreshToken: `carousell_refresh_${Date.now()}`,
  expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  userId: 'mock_carousell_user_id',
  userName: 'Mock Carousell User',
};
```

## Common Code Idioms

### Platform Selection Pattern
```javascript
const [selectedPlatforms, setSelectedPlatforms] = useState({
  carousell: true,
  facebook: true,
});

// Toggle platform selection
<TouchableOpacity 
  onPress={() => setSelectedPlatforms({...selectedPlatforms, carousell: !selectedPlatforms.carousell})}
>
  <View style={[styles.checkbox, selectedPlatforms.carousell && styles.checkboxChecked]}>
    {selectedPlatforms.carousell && (
      <Ionicons name="checkmark" size={16} color="#FFF" />
    )}
  </View>
</TouchableOpacity>
```

### Platform Badge Display
```javascript
{(item.publishedPlatforms?.carousell || item.selectedPlatforms?.carousell) && (
  <View style={[styles.platformBadge, { backgroundColor: '#FFE8E8' }]}>
    <Ionicons name="cart-outline" size={12} color="#D32F2F" />
    <Text style={[styles.platformBadgeText, { color: '#D32F2F' }]}>Carousell</Text>
  </View>
)}
{(item.publishedPlatforms?.facebook || item.selectedPlatforms?.facebook) && (
  <View style={[styles.platformBadge, { backgroundColor: '#E8F0FE' }]}>
    <Ionicons name="logo-facebook" size={12} color="#1877F2" />
    <Text style={[styles.platformBadgeText, { color: '#1877F2' }]}>Facebook</Text>
  </View>
)}
{(item.publishedPlatforms?.shopee || item.selectedPlatforms?.shopee) && (
  <View style={[styles.platformBadge, { backgroundColor: '#FFF0ED' }]}>
    <Ionicons name="bag-handle" size={12} color="#EE4D2D" />
    <Text style={[styles.platformBadgeText, { color: '#EE4D2D' }]}>Shopee</Text>
  </View>
)}
```

### Multi-Platform Publishing
```javascript
const handlePublish = async () => {
  if (!selectedPlatforms.carousell && !selectedPlatforms.facebook && !selectedPlatforms.shopee) {
    Alert.alert('Select Platform', 'Please select at least one platform to publish to.');
    return;
  }

  const publishResults = await platformService.publishListing(
    listingData,
    selectedPlatforms,
    user.id
  );

  navigation.replace('ListingSuccess', { 
    productName,
    selectedPlatforms,
    publishResults,
  });
};
```

### Conditional Rendering
```javascript
{connectedPlatforms.carousell && (
  <View style={styles.connectedBadge}>
    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
  </View>
)}

{hasErrors && (
  <View style={styles.errorBanner}>
    <Ionicons name="warning" size={20} color="#FF6B35" />
    <Text style={styles.errorText}>
      Some platforms failed to publish. Check details below.
    </Text>
  </View>
)}
```

### Ternary for Conditional Styles
```javascript
style={[
  styles.thumbnailItem,
  selectedThumbnail === index && styles.thumbnailItemSelected
]}
```

### Array Mapping for Lists
```javascript
{categories.map((category) => (
  <TouchableOpacity
    key={category.name}
    style={styles.dropdownItem}
    onPress={() => handleSelect(category.name)}
  >
    <Text>{category.name}</Text>
  </TouchableOpacity>
))}
```

### Destructuring Props and State
```javascript
const { user } = useAuth();
const { productData, listing } = route.params;
const { allListings, myListings, addListing } = useListings();
```

### Async/Await Pattern
```javascript
const handleConnect = async () => {
  const result = await platformService.connectCarousell(user.id);
  if (result.success) {
    // Handle success
  }
};
```

## Best Practices

### Performance
- Use `useNativeDriver: true` for animations (60fps)
- Memoize expensive computations with useMemo
- Use `showsVerticalScrollIndicator={false}` for cleaner UI
- Implement loading states to prevent UI blocking
- Stagger animations with delays for professional feel (100-150ms intervals)

### Animations
- Spring physics for iOS-style feel: `tension: 50, friction: 7`
- Staggered card animations with 100ms delays
- Scroll-based interpolations for onboarding screens
- Modal slide-up animations with spring physics
- Always use `useNativeDriver: true` for transform and opacity animations

### Accessibility
- Use semantic component names
- Provide meaningful text for screen readers
- Use appropriate touch target sizes (minimum 44x44)

### AI Integration
- Gemini 2.5 Flash Lite integrated with optimized, concise prompts
- Platform-specific content generation:
  - Carousell: Casual 2-3 sentences with emojis, first-person style
  - Facebook: Professional with line breaks and structured format
  - Shopee: E-commerce style with bullet points and feature highlights
- Price suggestions in Philippine Peso with market research and condition multipliers:
  - New: 100% of retail
  - Like-new: 80-90%
  - Good: 60-75%
  - Fair: 40-55%
  - Poor: 20-35%
- Hashtag generation for Carousell (3-5 terms without # symbol)
- Meetup location generation for Metro Manila (Makati, BGC, QC, Ortigas, Manila)
- Category classification with 15+ categories
- Image enhancement mock service ready for production API integration
- Fallback error handling with graceful degradation

### AI-Powered Verification System
- 4-tier verification checks with weighted scoring (0-100 points):
  1. Photo Source (25/10 points): Camera vs gallery photo
  2. AI Consistency (40/20 points): Re-analyze with Gemini, compare with original
  3. Metadata (15/5 points): EXIF data presence (mock implementation)
  4. Timestamp (20/15/5 points): Photo recency (24h/7d/older)
- Verification levels: Gold (80-100), Silver (60-79), Bronze (40-59), Unverified (0-39)
- Seller reputation: Average verification score across all listings
- "Verified by SnapSell" branding as key differentiator
- UI components: VerificationBadge (full/compact), VerificationScore, SellerVerificationBadge, SnapSellVerificationBanner
- Integration: CameraScreen tracks photoSource, AnalyzingScreen runs verification, ListingEditorScreen displays results
- FileSystem API: Use string `'base64'` for expo-file-system v19+ (not `FileSystem.EncodingType.Base64`)

### Multi-Platform Publishing
- Platform selection with checkboxes before publishing (Carousell, Facebook, Shopee)
- Validation to ensure at least one platform is selected
- Separate editing interfaces for each platform's requirements
- Real-time publishing with per-platform success/error feedback
- Platform badges throughout the app (listings, details, success screen)
- Platform connection management screen with OAuth flows (mock)
- Disconnect functionality for each platform
- Token validation and refresh logic
- Cross-publish card highlighting "Best Value" for publishing to all platforms
- Error handling with detailed error messages per platform
- Carousell FAB auto-click: 3-second delay after page load with multiple selector fallbacks
- Carousell region limitation: Philippines, Singapore, Indonesia only

### Code Organization
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Separate business logic into service layer
- Use constants for repeated values

### Security
- Never commit API keys (use environment variables)
- Validate user input before processing
- Implement proper error boundaries
- Use secure storage for sensitive data

### Testing Readiness
- Services return consistent response formats
- Components receive props for easy testing
- Mock implementations ready for integration testing
- Error handling allows for failure scenario testing
