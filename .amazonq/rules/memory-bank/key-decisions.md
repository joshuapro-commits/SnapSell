# Key Product & Technical Decisions

## Monetization Strategy

### Launch Strategy (June 3, 2025)
- **Decision**: Launch 100% FREE with no monetization
- **Rationale**: 
  - Build user base first (target: 10,000 users by Month 6)
  - Establish product-market fit
  - Gather user feedback and iterate
  - Build trust before asking for money
- **Timeline**: Introduce subscriptions in Month 7+ after reaching 10k users

### Subscription Model (Month 7+)
- **Decision**: ₱149/month subscription with 7-day free trial (NO credit card required)
- **Rationale**:
  - 40-60% trial-to-paid conversion vs 3% traditional freemium
  - No credit card barrier increases trial starts
  - Affordable price point (1-2 coffee drinks)
  - Recurring revenue more predictable than transaction fees
- **Premium Features**:
  - Unlimited AI-powered listings (free: 10/month)
  - Priority listing placement
  - Advanced analytics dashboard
  - Bulk listing tools
  - Premium verification badge
  - Ad-free experience
  - Priority customer support

### Why Subscription First (Not Transaction Fees)
- **Trust Barriers**: Users hesitant to share payment info with new app
- **Infrastructure Cost**: Payment processing requires significant investment
- **Not a Marketplace Yet**: SnapSell is a listing tool, not a transaction platform
- **Proven Model**: Carousell ($1.1B), Mercari ($3.2B), Poshmark ($3B) all started as listing tools
- **Transaction Fees Later**: After 500k+ users, introduce 3% transaction fee when building own marketplace

### Revenue Projections (Month 7+)
- **Users**: 10,000 total users
- **Trial Starts**: 5,000 (50% of users)
- **Paid Subscribers**: 2,500 (50% of trials convert)
- **MRR**: ₱372,500/month (~$6,700 USD)
- **ARR**: ₱4.47M/year (~$80,000 USD)

## Verification System

### "Verified by SnapSell" Badge
- **Decision**: Implement AI-powered verification system as core differentiator
- **Rationale**:
  - Builds trust between buyers and sellers
  - Unique feature not available on Facebook/Carousell
  - Encourages quality listings (fresh photos, accurate info)
  - Creates seller reputation system
  - Justifies premium pricing later
- **Implementation**: 4-tier verification with 0-100 point scoring

### Verification Scoring System
- **Photo Source** (25/10 points):
  - Camera photo: 25 points (highest trust)
  - Gallery photo: 10 points (lower trust)
  - Rationale: Camera photos prove user took photo themselves
- **AI Consistency** (40/20 points):
  - Passed: 40 points (AI confirms product matches description)
  - Failed: 20 points (partial credit for attempt)
  - Rationale: Gemini re-analyzes image, compares with original analysis
- **Metadata** (15/5 points):
  - Complete EXIF: 15 points
  - Partial EXIF: 5 points
  - Rationale: EXIF data proves photo authenticity (camera model, GPS, timestamp)
- **Timestamp** (20/15/5 points):
  - <24 hours: 20 points
  - <7 days: 15 points
  - >7 days: 5 points
  - Rationale: Recent photos indicate active seller, fresh listing

### Verification Levels
- **Gold** (80-100 points): Highest trust, premium badge
- **Silver** (60-79 points): Good trust, solid verification
- **Bronze** (40-59 points): Basic trust, minimal verification
- **Unverified** (0-39 points): No badge displayed

### Why NOT Add Badge Overlay to Photos
- **Decision**: Do NOT add "Verified by SnapSell" badge overlay to product images
- **Rationale**:
  - **Platform Violations**: Facebook/Carousell prohibit watermarks on images
  - **User Resistance**: Users don't want photos permanently altered
  - **Technical Issues**: Irreversible modification, doubles storage
  - **Better Alternative**: Show badge in UI (cards, banners) without modifying photos
- **Implementation**: Created `imageEnhancement.js` service but NOT integrated (kept for reference only)

## Platform Integration

### Carousell FAB Auto-Click
- **Decision**: Automatically click Carousell's floating action button (FAB) after page loads
- **Rationale**:
  - Seamless user experience (one less tap)
  - Faster listing creation flow
  - Mimics native app behavior
- **Implementation**: 3-second delay with multiple selector fallbacks
- **Risk**: Low (FAB is always present on Carousell homepage)

### Carousell Region Limitation
- **Decision**: Limit region selector to Philippines, Singapore, Indonesia only
- **Rationale**:
  - Focus on primary markets (80% of Carousell users)
  - Simplify user experience (fewer choices)
  - Easier to support and localize
- **Removed**: Malaysia, Hong Kong, Taiwan

### Facebook Auto-Fill Strategy
- **Decision**: Use visual label search + DOM traversal + typewriter effect + DataTransfer API
- **Rationale**:
  - Facebook's class names are obfuscated and change frequently
  - Visual labels ("Title", "Price") are stable
  - Typewriter effect mimics human behavior (avoids bot detection)
  - DataTransfer API is official way to programmatically set file inputs
- **Result**: 100% automated listing creation (6/6 fields)

### Facebook Session Persistence
- **Decision**: Dual WebView strategy with shared WKProcessPool
- **Rationale**:
  - iOS WebViews lose cookies when unmounted
  - Mounting both login + sell WebViews simultaneously shares cookies
  - No unmounting = no cookie loss
  - iPad UserAgent avoids "Download App" nag
- **Result**: 100% reliable session persistence on iOS

## Technical Decisions

### expo-file-system v19+ Encoding API
- **Issue**: `FileSystem.EncodingType.Base64` caused error in verification service
- **Decision**: Use string `'base64'` instead of enum
- **Rationale**: expo-file-system v19+ changed API from enum to string
- **Impact**: Fixed verification service AI consistency check

### AsyncStorage for MVP
- **Decision**: Use AsyncStorage for all data persistence (no backend)
- **Rationale**:
  - Fast development (no API to build)
  - No server costs during MVP
  - Easy to migrate to Firebase/Supabase later
  - Sufficient for single-device testing
- **Migration Path**: Ready for backend API integration

### Auto-Login for Development
- **Decision**: Automatically create and login default user on app start
- **Rationale**:
  - Faster development iteration
  - Skip login screen during testing
  - Easy to disable for production
- **Production**: Remove before launch (June 3, 2025)

### Mock Data Removal
- **Decision**: Remove all hardcoded mock data (MOCK_USERS, MOCK_LISTINGS)
- **Rationale**:
  - Clean slate for production
  - Forces proper AsyncStorage implementation
  - Ensures no test data leaks to production
- **Impact**: App starts with zero users/listings (except auto-created dev user)

## UI/UX Decisions

### Verification Badge Placement
- **ProductCard**: Compact badge (icon + level only)
- **ProductDetailScreen**: Prominent banner with full branding
- **ListingEditorScreen**: Detailed score breakdown with all checks
- **ProfileScreen**: Seller reputation score (average across listings)
- **Rationale**: Progressive disclosure - show more detail as user drills down

### Verification Colors
- **Gold**: #FFD700 (premium, highest trust)
- **Silver**: #C0C0C0 (good trust)
- **Bronze**: #CD7F32 (basic trust)
- **Rationale**: Universally recognized medal colors, clear hierarchy

### Animation Philosophy
- **Style**: iOS-inspired, professional, subtle
- **Performance**: Always use native driver, 60fps target
- **Timing**: Staggered for visual interest (100ms delays)
- **Physics**: Spring animations (tension: 50, friction: 7)
- **Rationale**: Premium feel, smooth performance, delightful UX

## Market Validation

### Casual Seller Market Size
- **Philippines**: 20-30M potential users
- **Southeast Asia**: 100M+ potential users
- **Proven Models**:
  - Carousell: $1.1B valuation
  - Mercari: $3.2B valuation
  - Poshmark: $3B valuation
- **Rationale**: Massive market, proven willingness to pay for listing tools

### Competitive Advantage
- **AI-Powered Listings**: Instant listing creation from photos
- **Verification System**: "Verified by SnapSell" badge builds trust
- **Multi-Platform Publishing**: Cross-post to Carousell, Facebook, Shopee
- **Seller Reputation**: Long-term credibility building
- **Rationale**: Unique combination not available on any single platform

## Future Roadmap

### Phase 1: Launch (June 3, 2025)
- 100% FREE, no monetization
- Core features: AI listings, multi-platform publishing, verification
- Target: 10,000 users by Month 6

### Phase 2: Subscriptions (Month 7+)
- Introduce ₱149/month premium subscription
- 7-day free trial, no credit card required
- Premium features: unlimited listings, analytics, priority placement

### Phase 3: Marketplace (Month 12+, 500k+ users)
- Build own marketplace with payment processing
- Introduce 3% transaction fee on completed sales
- In-app messaging between buyers/sellers
- Escrow payment system

### Phase 4: Scale (Month 18+)
- Expand to more countries (Thailand, Vietnam, Malaysia)
- Enterprise features for power sellers
- API for third-party integrations
- White-label solution for other marketplaces
