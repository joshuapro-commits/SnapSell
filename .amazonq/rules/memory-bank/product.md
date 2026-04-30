# Product Overview

## Project Purpose
SnapSell is an innovative mobile marketplace application that revolutionizes online selling by leveraging AI-powered image analysis to create instant product listings. The app eliminates the tedious process of manually creating product descriptions, pricing, and categorization by automatically generating comprehensive listing details from a single photo.

## Value Proposition
- **Time Efficiency**: Transform product photography into complete marketplace listings in seconds
- **AI-Powered Intelligence**: Automatic product identification, description generation, and price suggestions
- **Multi-Platform Publishing**: Connect and publish to multiple marketplaces (Carousell, Facebook Marketplace) from one app
- **User-Friendly**: Intuitive interface designed for quick listing creation and management

## Key Features

### Core Capabilities
1. **AI Image Analysis**
   - Take photos or select from gallery
   - Automatic product identification and brand recognition
   - Category classification (Electronics, Clothing, Furniture, Books, Sporting Goods, and more)
   - Condition assessment
   - Platform-specific description generation (Carousell casual style, Facebook structured format)
   - Smart price suggestions with market-based ranges in Philippine Peso
   - Hashtag generation for Carousell
   - Meetup location suggestions for Metro Manila

2. **Multi-Platform Publishing**
   - Built-in marketplace for browsing and selling
   - Cross-publish to Carousell, Facebook Marketplace, and Shopee simultaneously
   - Platform selection checkboxes (choose one, two, or all three platforms)
   - Platform-specific listing details and customization
   - Real-time publishing with success/error feedback per platform
   - Platform connection management via OAuth (mock implementation)
   - Platform badges showing where listings are published
   - Dedicated Connect Platforms screen with connection status
   - Disconnect functionality for each platform

3. **Listing Management**
   - Edit AI-generated content before publishing
   - Separate editing for Carousell and Facebook details
   - Platform-specific fields (hashtags, meetup locations, shipping options)
   - Track all active listings with platform indicators
   - Update or delete listings
   - Performance tracking

4. **User Experience**
   - Authentication system with demo accounts
   - Personalized user profiles
   - Account statistics and settings
   - Onboarding flow for new users
   - Splash screen and animations
   - Success screen with platform-specific results

### Advanced Features
- **AI-Powered Verification**: "Verified by SnapSell" badge system with 4-tier checks (photo source, AI consistency, metadata, timestamp) scoring 0-100 points with Gold/Silver/Bronze levels
- **Seller Reputation**: Average verification score across all seller's listings displayed on profile
- **Trust Building**: Prominent verification banner on product detail pages
- Category-based filtering (15+ categories including Electronics, Clothing, Furniture, Toys, Automotive, Beauty, Jewelry, etc.)
- Pull-to-refresh functionality
- Product detail views with platform badges and verification banners
- Persistent user sessions
- Loading states and user feedback
- Error handling throughout
- Earnings dashboard with monthly performance charts
- Premium upgrade flow with benefits showcase
- Platform connection management screen
- Cross-platform publishing with error handling
- Carousell FAB auto-click for seamless sell flow

## Target Users
- Individual sellers looking to quickly list items for sale
- Small business owners managing inventory across multiple platforms
- Casual sellers who want to declutter without spending hours on listings
- Anyone seeking to maximize their selling efficiency with AI assistance

## Use Cases
1. **Quick Decluttering**: Snap photos of items around the house and list them instantly
2. **Business Inventory**: Small businesses can rapidly create listings for new stock
3. **Multi-Platform Selling**: Manage listings across Carousell and Facebook Marketplace from one place
4. **Market Research**: Get AI-powered price suggestions based on market data
5. **Time-Saving**: Reduce listing creation time from minutes to seconds

## Current Status (Updated: April 2025)
- **AI Integration**: ✅ Gemini 2.5 Flash Lite fully integrated with optimized prompts for product analysis
- **AI Verification System**: ✅ 4-tier verification with "Verified by SnapSell" badge (Gold/Silver/Bronze)
- **Image Enhancement**: ⏳ Mock image enhancement service ready for production API integration
- **Platform Publishing**: ⏳ Complete multi-platform publishing flow (simulated, ready for real APIs)
- **Platform Connections**: ⏳ OAuth flows ready for real API integration (Carousell, Facebook, Shopee)
- **Platform-Specific Content**: ✅ AI generates tailored descriptions for each marketplace
- **Carousell Auto-Click**: ✅ FAB button auto-click with 3-second delay and region limitation (PH/SG/ID)
- **Data Storage**: ✅ AsyncStorage for all data persistence (NO MOCK DATA)
- **User Authentication**: ✅ Real registration and login using AsyncStorage with auto-login for development
- **Listings Management**: ✅ Full CRUD operations with AsyncStorage, status tracking (active/sold/draft)
- **UI/UX**: ✅ Complete with platform selection, badges, success feedback, and earnings tracking
- **Animations**: ✅ Professional iOS-style animations (onboarding, home stats, modals)
- **Premium Features**: ✅ Paywall screen for SnapSell Premium with upgrade flow
- **Monetization Strategy**: ✅ 100% FREE launch (June 3), subscriptions in Month 7+ (₱149/month)
- **Production Ready**: ✅ All mock data removed, ready for backend API integration
- **Launch Timeline**: 🎯 June 3, 2025 (8 weeks from April 8)
