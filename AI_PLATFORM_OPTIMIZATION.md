# Enhanced AI Service - Platform-Optimized Outputs

## What Changed

The AI service now generates **platform-specific descriptions** and metadata for Carousell and Facebook Marketplace, optimized for Philippine market.

---

## New Output Format

### Example: iPhone 13 Pro

```javascript
{
  success: true,
  data: {
    // Basic Info
    name: "iPhone 13 Pro 256GB",
    brand: "Apple",
    category: "electronics",
    condition: "good",
    
    // Platform-Optimized Descriptions
    descriptions: {
      carousell: "Selling my iPhone 13 Pro in excellent condition! 🔥 Battery health still at 95%, no scratches or dents. Comes with original box and charger! 📦 RFS: Upgraded to newer model. Meetup in BGC or shipping available! 💯",
      
      facebook: "iPhone 13 Pro - Excellent Condition\n\nAuthentic Apple iPhone in great working condition.\n\n✓ Battery health: 95%\n✓ No scratches or dents\n✓ Includes original box and charger\n✓ Fully functional, no issues\n\nReason for selling: Upgraded to newer model\n\nMeetup: BGC area\nShipping: Available within Metro Manila",
      
      generic: "I'm selling my iPhone 13 Pro in excellent condition. Battery health is still at 95% with no scratches or dents. Comes with the original box and charger."
    },
    
    // Pricing in PHP
    suggestedPrice: 42000,
    
    // Platform-Specific Metadata
    platformData: {
      carousell: {
        hashtags: ["Apple", "iPhone13Pro", "Authentic", "BGC", "MetroManila"],
        meetupLocations: ["BGC", "Makati", "Ortigas"]
      },
      facebook: {
        category: "Electronics",
        shippingAvailable: true
      }
    },
    
    // Product Attributes
    attributes: {
      color: "Graphite",
      storage: "256GB",
      batteryHealth: "95%",
      model: "iPhone 13 Pro"
    },
    
    // Image Data
    imageUri: "file://...",
    originalImageUri: "file://...",
    imageEnhanced: true,
    enhancements: { brightness: true, contrast: true, ... },
    
    // Metadata
    id: "1234567890",
    createdAt: "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Description Styles

### **Carousell Style** 🎯
**Characteristics:**
- Casual and conversational
- Emoji-rich (🔥💯✨📦)
- Enthusiastic tone
- Filipino marketplace style
- Mentions meetup locations
- Uses "RFS" (Reason for Selling)
- Short and punchy

**Example:**
```
"Up for grabs! Nike Air Max 90 in great condition! 👟🔥 
Size 10, minimal wear, super comfy. Original box included! 📦 
RFS: Too many sneakers na 😅 
Meetup in Makati or QC! 💯"
```

---

### **Facebook Marketplace Style** 📋
**Characteristics:**
- Structured and professional
- Uses line breaks for readability
- Bullet points with checkmarks (✓)
- Detailed specifications
- Clear sections (condition, features, terms)
- Professional but friendly
- Mentions meetup AND shipping

**Example:**
```
Nike Air Max 90 - Great Condition

Authentic Nike sneakers in excellent wearable condition.

✓ Size: US 10
✓ Minimal wear on soles
✓ Clean and well-maintained
✓ Includes original box
✓ No major defects

Reason for selling: Decluttering shoe collection

Meetup: Makati, Ortigas, or QC
Shipping: Available via Lalamove/Grab
```

---

### **Generic Style** 📝
**Characteristics:**
- Balanced and versatile
- First-person narrative
- Professional yet friendly
- Works on any platform
- 2-3 sentences
- No emojis or special formatting

**Example:**
```
"I'm selling my Nike Air Max 90 in great condition. 
They're size 10 with minimal wear and come with the original box. 
Perfect for anyone looking for authentic Nike sneakers."
```

---

## Platform Metadata

### **Carousell Metadata**
```javascript
platformData: {
  carousell: {
    hashtags: [
      "Nike",           // Brand
      "AirMax90",       // Model
      "Sneakers",       // Category
      "Authentic",      // Trust signal
      "Makati"          // Location
    ],
    meetupLocations: [
      "Makati",         // CBD area
      "BGC",            // Popular meetup spot
      "Quezon City"     // Accessible location
    ]
  }
}
```

**Hashtag Strategy:**
- Brand name (searchable)
- Product model/type
- Category keywords
- Trust signals (Authentic, BrandNew, Original)
- Location tags

**Meetup Locations:**
- Popular, accessible areas in Metro Manila
- CBD locations (Makati, BGC, Ortigas)
- Major cities (QC, Manila, Pasig)

---

### **Facebook Marketplace Metadata**
```javascript
platformData: {
  facebook: {
    category: "Electronics",  // FB's category system
    shippingAvailable: true   // Based on item size/fragility
  }
}
```

**Facebook Categories:**
- Vehicles
- Property Rentals
- Apparel
- Electronics
- Entertainment
- Family
- Home Goods
- Sporting Goods
- Toys & Games
- Other

**Shipping Logic:**
- `true`: Small, durable items (phones, books, clothes)
- `false`: Large or fragile items (furniture, glass items)

---

## Real-World Examples

### Example 1: MacBook Pro
```javascript
{
  name: "MacBook Pro 14-inch M1 Pro",
  brand: "Apple",
  descriptions: {
    carousell: "Selling my MacBook Pro 14\" with M1 Pro chip! 💻🔥 Perfect condition, barely used. Battery cycle count only 45! Comes with original charger and box. RFS: Got a new work laptop. Meetup in BGC or Makati! 💯",
    
    facebook: "MacBook Pro 14-inch M1 Pro - Like New\n\nApple MacBook in pristine condition.\n\n✓ M1 Pro chip (10-core CPU)\n✓ 16GB RAM, 512GB SSD\n✓ Battery cycle: 45 only\n✓ No scratches or dents\n✓ Includes original charger and box\n\nReason for selling: Company provided new laptop\n\nMeetup: BGC, Makati\nShipping: Available with insurance"
  },
  suggestedPrice: 95000,
  platformData: {
    carousell: {
      hashtags: ["Apple", "MacBookPro", "M1Pro", "LaptopForSale", "BGC"],
      meetupLocations: ["BGC", "Makati", "Ortigas"]
    },
    facebook: {
      category: "Electronics",
      shippingAvailable: true
    }
  }
}
```

---

### Example 2: Nike Sneakers
```javascript
{
  name: "Nike Air Jordan 1 Retro High",
  brand: "Nike",
  descriptions: {
    carousell: "Air Jordan 1 Retro High for sale! 👟🔥 Size 10, worn twice lang, super fresh pa! Original box and extra laces included. RFS: Need funds for new project. Meetup in QC or Pasig! 💯",
    
    facebook: "Nike Air Jordan 1 Retro High - Excellent Condition\n\nAuthentic Nike Air Jordan sneakers.\n\n✓ Size: US 10\n✓ Worn only twice\n✓ No creasing or yellowing\n✓ Includes original box\n✓ Extra laces included\n✓ 100% authentic\n\nReason for selling: Need funds\n\nMeetup: Quezon City, Pasig\nShipping: Available via Lalamove"
  },
  suggestedPrice: 8500,
  platformData: {
    carousell: {
      hashtags: ["Nike", "AirJordan1", "Sneakers", "Authentic", "QC"],
      meetupLocations: ["Quezon City", "Pasig", "Marikina"]
    },
    facebook: {
      category: "Apparel",
      shippingAvailable: true
    }
  }
}
```

---

### Example 3: Gaming Console
```javascript
{
  name: "PlayStation 5 Digital Edition",
  brand: "Sony",
  descriptions: {
    carousell: "PS5 Digital Edition for sale! 🎮🔥 Complete set with 2 controllers and 5 games! Barely used, super mint condition. RFS: Switching to PC gaming. Meetup in Makati or BGC! 💯",
    
    facebook: "PlayStation 5 Digital Edition - Complete Set\n\nSony PS5 in excellent condition.\n\n✓ Digital Edition console\n✓ 2 DualSense controllers\n✓ 5 digital games included\n✓ All cables and original box\n✓ No issues, fully functional\n\nGames included:\n- Spider-Man Miles Morales\n- God of War Ragnarok\n- Horizon Forbidden West\n- Gran Turismo 7\n- Ratchet & Clank\n\nReason for selling: Switching to PC gaming\n\nMeetup: Makati, BGC (preferred)\nShipping: Not available (meetup only)"
  },
  suggestedPrice: 28000,
  platformData: {
    carousell: {
      hashtags: ["PS5", "PlayStation5", "Gaming", "Sony", "Makati"],
      meetupLocations: ["Makati", "BGC", "Pasig"]
    },
    facebook: {
      category: "Electronics",
      shippingAvailable: false  // Large, expensive item
    }
  }
}
```

---

## Key Improvements

### ✅ **Platform Optimization**
- Carousell: Casual, emoji-rich, Filipino style
- Facebook: Professional, structured, detailed
- Generic: Balanced fallback

### ✅ **Philippine Market Focus**
- Prices in PHP (₱)
- Metro Manila meetup locations
- Local marketplace language style
- Filipino selling culture (RFS, meetup spots)

### ✅ **Better Discoverability**
- Relevant hashtags for Carousell search
- Proper Facebook categories
- Location-based tags

### ✅ **Trust Signals**
- "Authentic" mentions
- Detailed condition descriptions
- Reason for selling (RFS)
- Original box/accessories mentioned

### ✅ **Actionable Information**
- Clear meetup locations
- Shipping availability
- Contact preferences
- Pricing transparency

---

## Testing the AI Service

### Test It:
1. Take a photo of any product
2. Go through the camera flow
3. Check the AnalyzingScreen
4. In ListingEditor, you'll now have access to:
   - `productData.descriptions.carousell`
   - `productData.descriptions.facebook`
   - `productData.descriptions.generic`
   - `productData.platformData.carousell.hashtags`
   - `productData.platformData.carousell.meetupLocations`
   - `productData.platformData.facebook.category`

### Expected Behavior:
- AI analyzes image
- Generates 3 different descriptions
- Provides platform-specific metadata
- Returns PHP pricing
- Suggests meetup locations

---

## Next Step: ListingEditor Integration

Once you're happy with these AI outputs, we'll update the ListingEditor to:
1. Show platform selection checkboxes
2. Add tabs to switch between Carousell/Facebook descriptions
3. Allow editing each description separately
4. Publish to selected platforms

Ready to test? 🚀
