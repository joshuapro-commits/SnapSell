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
   - Cross-publish to Carousell and Facebook Marketplace simultaneously
   - Platform selection checkboxes (choose one or both platforms)
   - Platform-specific listing details and customization
   - Real-time publishing with success/error feedback
   - Platform connection management via OAuth (mock implementation)
   - Platform badges showing where listings are published

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
- Category-based filtering
- Pull-to-refresh functionality
- Product detail views
- Persistent user sessions
- Loading states and user feedback
- Error handling throughout

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

## Current Status
- **AI Integration**: Gemini 2.5 Flash fully integrated with optimized prompts
- **Platform Publishing**: Complete multi-platform publishing flow implemented
- **Platform Connections**: Mock OAuth flows ready for real Carousell and Facebook API integration
- **Local Storage**: AsyncStorage for data persistence (production-ready for backend migration)
- **UI/UX**: Complete with platform selection, badges, and success feedback
