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

#### Spring Animations for Modals
```javascript
Animated.spring(slideAnim, {
  toValue: 0,
  useNativeDriver: true,
  tension: 65,
  friction: 11,
}).start();
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

#### Context + Storage Sync
Context providers sync state with AsyncStorage:
```javascript
const addListing = async (listing) => {
  const newListing = { ...listing, id: Date.now().toString() };
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
```

### Multi-Platform Publishing
```javascript
const handlePublish = async () => {
  if (!selectedPlatforms.carousell && !selectedPlatforms.facebook) {
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
- Use `useNativeDriver: true` for animations
- Memoize expensive computations with useMemo
- Use `showsVerticalScrollIndicator={false}` for cleaner UI
- Implement loading states to prevent UI blocking

### Accessibility
- Use semantic component names
- Provide meaningful text for screen readers
- Use appropriate touch target sizes (minimum 44x44)

### AI Integration
- Gemini 2.5 Flash integrated with optimized, concise prompts
- Platform-specific content generation (Carousell casual, Facebook structured)
- Price suggestions in Philippine Peso with market research
- Hashtag and location generation for local marketplaces

### Multi-Platform Publishing
- Platform selection with checkboxes before publishing
- Validation to ensure at least one platform is selected
- Separate editing interfaces for each platform's requirements
- Real-time publishing with success/error feedback
- Platform badges throughout the app (listings, details)

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
