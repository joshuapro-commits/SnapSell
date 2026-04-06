# Development Notes - Snap & Sell

## Architecture Overview

### State Management
- **AuthContext**: Manages user authentication state
- **ListingsContext**: Manages marketplace and user listings
- **AsyncStorage**: Persists data locally

### Navigation Flow
```
AppNavigator (Root)
├── Auth Stack (Not Logged In)
│   ├── LoginScreen
│   └── SignupScreen
└── Main Stack (Logged In)
    ├── MainTabs
    │   ├── HomeScreen (Marketplace)
    │   ├── CameraScreen (Sell)
    │   ├── MyListingsScreen
    │   └── ProfileScreen
    ├── ProductDetailScreen
    └── ListingEditorScreen
```

## Component Hierarchy

### Reusable Components
- **Button**: Primary, secondary, and outline variants
- **Input**: Text input with label and error handling
- **ProductCard**: Displays listing preview
- **LoadingSpinner**: Loading indicator

### Screen Components
All screens follow consistent patterns:
- Import necessary hooks and components
- Manage local state with useState
- Use context for global state
- Handle loading and error states
- Implement proper navigation

## Data Models

### User
```javascript
{
  id: string,
  email: string,
  name: string,
  avatar: string (emoji)
}
```

### Listing
```javascript
{
  id: string,
  name: string,
  brand: string,
  price: number,
  category: string,
  condition: string,
  description: string,
  imageUri: string,
  userId: string,
  userName: string,
  createdAt: string (ISO),
  attributes: object (optional)
}
```

## Service Layer

### authService
- `login(email, password)`: Authenticates user
- `signup(email, password, name)`: Creates new user
- `logout()`: Clears user session
- `getCurrentUser()`: Retrieves stored user

### aiService
- `analyzeImage(imageUri)`: Analyzes product image
- `generateDescription(productInfo)`: Creates description
- `suggestPrice(productInfo)`: Suggests pricing

### storageService
- `saveUser(user)`: Persists user data
- `getUser()`: Retrieves user data
- `saveListings(listings)`: Saves all listings
- `getListings()`: Retrieves all listings
- `saveMyListings(listings)`: Saves user's listings
- `getMyListings()`: Retrieves user's listings

## Styling System

### Theme Constants
- **COLORS**: Consistent color palette
- **SPACING**: Standardized spacing values
- **FONT_SIZES**: Typography scale
- **BORDER_RADIUS**: Rounded corner values

### Design Principles
- Mobile-first approach
- Consistent spacing and typography
- Clear visual hierarchy
- Accessible touch targets (min 48px)
- Smooth transitions and feedback

## Best Practices Implemented

### Code Organization
✅ Feature-based folder structure
✅ Separation of concerns
✅ Reusable components
✅ Centralized constants
✅ Service layer abstraction

### React Patterns
✅ Functional components with hooks
✅ Context API for global state
✅ Custom hooks potential
✅ Proper prop drilling avoidance
✅ Component composition

### Performance
✅ FlatList for long lists
✅ Image optimization
✅ Lazy loading potential
✅ Memoization opportunities
✅ Efficient re-renders

### User Experience
✅ Loading states
✅ Error handling
✅ User feedback (alerts)
✅ Pull to refresh
✅ Smooth navigation

## Future Enhancements

### Phase 1: AI Integration
- [ ] Integrate Gemini 2.5 Flash API
- [ ] Implement image preprocessing
- [ ] Add retry logic for API failures
- [ ] Cache AI responses

### Phase 2: Backend
- [ ] Set up Firebase/AWS backend
- [ ] Implement real authentication
- [ ] Add database for listings
- [ ] Enable real-time updates
- [ ] Add image storage (S3/Firebase Storage)

### Phase 3: Features
- [ ] In-app messaging
- [ ] Push notifications
- [ ] Advanced search and filters
- [ ] Favorites/Wishlist
- [ ] User ratings and reviews
- [ ] Payment integration
- [ ] Shipping calculator

### Phase 4: Optimization
- [ ] Image compression
- [ ] Offline mode
- [ ] Analytics integration
- [ ] Performance monitoring
- [ ] Error tracking (Sentry)
- [ ] A/B testing

### Phase 5: Scaling
- [ ] Pagination for listings
- [ ] Infinite scroll
- [ ] Image CDN
- [ ] Caching strategy
- [ ] Load balancing
- [ ] Database optimization

## Testing Strategy

### Unit Tests
- Service layer functions
- Utility functions
- Component logic

### Integration Tests
- Context providers
- Navigation flows
- API integrations

### E2E Tests
- User authentication flow
- Listing creation flow
- Marketplace browsing
- Profile management

## Deployment Checklist

### Pre-Deployment
- [ ] Remove console.logs
- [ ] Update app version
- [ ] Test on multiple devices
- [ ] Optimize images
- [ ] Review permissions
- [ ] Update environment variables
- [ ] Test offline behavior

### App Store Submission
- [ ] Create app icons (all sizes)
- [ ] Prepare screenshots
- [ ] Write app description
- [ ] Set up privacy policy
- [ ] Configure app metadata
- [ ] Submit for review

### Post-Deployment
- [ ] Monitor crash reports
- [ ] Track user analytics
- [ ] Gather user feedback
- [ ] Plan updates
- [ ] Monitor performance

## Known Limitations

### Current Implementation
- Mock AI responses (not real analysis)
- Local storage only (no cloud sync)
- Mock authentication (no real security)
- No real-time updates
- Limited to single device
- No image optimization
- No offline support

### Technical Debt
- Add TypeScript for type safety
- Implement proper error boundaries
- Add comprehensive testing
- Improve accessibility
- Add internationalization
- Optimize bundle size

## Environment Setup

### Development
```bash
# Install dependencies
npm install

# Start dev server
npm start

# Run tests (when implemented)
npm test
```

### Production Build
```bash
# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Submit to stores
eas submit
```

## API Integration Guide

### Gemini 2.5 Flash Setup

1. Get API key from Google AI Studio
2. Install SDK: `npm install @google/generative-ai`
3. Update `src/services/ai.js`
4. Add API key to environment
5. Test with real images
6. Implement error handling
7. Add rate limiting
8. Monitor usage and costs

### Backend Integration

1. Choose backend (Firebase/AWS/Supabase)
2. Set up authentication
3. Create database schema
4. Implement API endpoints
5. Update service layer
6. Add error handling
7. Implement caching
8. Test thoroughly

## Performance Metrics

### Target Metrics
- App launch: < 2 seconds
- Screen transitions: < 300ms
- Image loading: < 1 second
- AI analysis: < 5 seconds
- API responses: < 2 seconds

### Monitoring
- Use React Native Performance Monitor
- Track bundle size
- Monitor memory usage
- Profile render performance
- Track network requests

## Security Considerations

### Current (Mock)
- No real authentication
- No data encryption
- Local storage only
- No API security

### Production Requirements
- Implement OAuth 2.0
- Encrypt sensitive data
- Secure API endpoints
- Validate all inputs
- Implement rate limiting
- Add CSRF protection
- Use HTTPS only
- Implement proper session management

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review and fix security vulnerabilities
- Monitor app performance
- Respond to user feedback
- Fix bugs promptly
- Update documentation

### Version Control
- Use semantic versioning
- Maintain changelog
- Tag releases
- Document breaking changes

---

Last Updated: 2024
Version: 1.0.0
