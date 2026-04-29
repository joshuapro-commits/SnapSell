import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config/gemini';
import { getFPCId, getCategoryNameFromId, getRequiredFields, isLeafCategory, getParentName, getLeafName, FB_CATEGORY_LIST, FPC_HIERARCHY } from '../constants/facebookCategories';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const aiService = {
  async enhanceImage(imageUri) {
    try {
      // For demo purposes, we'll simulate image enhancement
      // In production, you would integrate with image enhancement APIs like:
      // - Cloudinary AI Enhancement
      // - DeepAI Image Enhancement
      // - Let's Enhance API
      // - Adobe Photoshop API
      
      // Simulated processing delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Return enhancement results
      return {
        success: true,
        originalImage: imageUri,
        enhancedImage: imageUri, // In production: URL of enhanced image
        enhancements: {
          brightness: true,
          contrast: true,
          sharpness: true,
          colorCorrection: true,
          noiseReduction: true,
        },
      };
    } catch (error) {
      console.error('Image Enhancement Error:', error);
      return {
        success: false,
        originalImage: imageUri,
        enhancedImage: imageUri,
        enhancements: {},
      }; 
    }
  },

  async analyzeImage(imageUri) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

      // Convert image URI to base64
      const imageResponse = await fetch(imageUri);
      const blob = await imageResponse.blob();
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result.split(',')[1];
          resolve(base64data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const prompt = `Analyze this product image and return JSON:
{
  "name": "product name",
  "brand": "brand name (check logos, text, packaging; use 'Unknown' only if no brand visible)",
  "category": "simple label for the product type. CRITICAL DISTINCTIONS: 
    - Watches/smartwatches → 'jewelry' (NOT electronics)
    - Shoes/sneakers/footwear → 'shoes' (NOT sporting goods)
    - Phone cases/accessories → 'accessories' (NOT electronics)
    - Headphones/earbuds/speakers → 'audio' (audio devices)
    - Laptops/tablets/phones → 'electronics'
    Use: electronics, audio, clothing, shoes, jewelry, furniture, etc.",
  "facebookCategoryId": "Return ONLY the numeric ID string of the single best-matching Facebook category. IMPORTANT MAPPINGS:
    - Watches/smartwatches → 188 (Jewellery and accessories under Clothing & accessories)
    - Shoes/sneakers/footwear → 5441 (Men's clothing & shoes) or 1604 (Women's clothing & shoes) based on style
    - Phone cases/screen protectors → 188 (Jewellery and accessories)
    - Headphones/earbuds/speakers/audio devices → 278 (Electronics & computers under Electronics)
    - Laptops/tablets/computers → 278 (Electronics & computers under Electronics)
    - Smartphones → 267 (Mobile phones under Electronics). These are the EXACT sub-categories Facebook shows in its UI — pick the most specific match. Prefer leaf/sub-categories over top-level. If unsure use 623 (Household under Home & garden). Choose from: ${FB_CATEGORY_LIST.map(c => c.id + '=' + c.name + (c.parentName ? ' under ' + c.parentName : '')).join(' | ')}",
  "condition": "New|Used – like new|Used – good|Used – fair",
  "descriptions": {
    "carousell": "Casual 2-3 sentences with emojis. Start 'Selling my...' Example: 'Selling my iPhone 13 Pro! 🔥 95% battery, no scratches. Comes with box and charger! 📦'",
    "facebook": "Professional with line breaks. Example: 'iPhone 13 Pro - Excellent\\n\\n- 95% battery\\n- No scratches\\n- Original box included\\n\\nMeetup: BGC'",
    "shopee": "E-commerce style with bullet points. Highlight features and benefits. Example: '✨ iPhone 13 Pro - Premium Condition\\n\\n📱 Product Highlights:\\n• 95% Battery Health\\n• Zero Scratches or Dents\\n• Complete with Original Box & Charger\\n• Fully Tested & Working\\n\\n🚚 Fast Shipping Available\\n💯 100% Authentic'",
    "generic": "Balanced 2-3 sentences. Example: 'iPhone 13 Pro in excellent condition. 95% battery health, no scratches. Includes original box.'"
  },
  "suggestedPrice": PHP price number (research PH market: New=retail, Like new=80-90%, Good=60-75%, Fair=40-55%),
  "platformData": {
    "carousell": {
      "hashtags": ["Research and return 5-7 MOST RELEVANT and POPULAR search terms for this product on Carousell Philippines. Think like a buyer searching. Include: 1) Brand name (if known), 2) Product type/category, 3) Condition keywords (authentic, brandnew, preloved), 4) Popular model/variant names, 5) Trending search terms. NO # symbol. Examples: For iPhone → ['iPhone13Pro', 'ApplePhone', 'Authentic', 'OriginalBox', 'iPhonePH']. For Nike shoes → ['NikeShoes', 'Sneakers', 'AirMax', 'Authentic', 'BrandNew']. For watch → ['Watch', 'Timepiece', 'Authentic', 'LuxuryWatch', 'WatchPH']"],
      "meetupLocations": ["2-3 Metro Manila areas: Makati, BGC, QC, Ortigas, Manila"]
    },
    "facebook": {
      "shippingAvailable": true|false,
      "tags": ["Research and return 5-7 MOST RELEVANT search keywords for Facebook Marketplace. Think like a buyer searching. Include: 1) Brand name, 2) Product type, 3) Model/variant, 4) Key features, 5) Condition. NO # symbol. Examples: For iPhone → ['iPhone', 'Apple', 'Smartphone', '13Pro', 'Unlocked']. For Nike shoes → ['Nike', 'Sneakers', 'AirMax', 'Running', 'Authentic']. For watch → ['Watch', 'Timepiece', 'Luxury', 'Authentic', 'Designer']"]
    },
    "shopee": {
      "category": "Electronics|Fashion|Home & Living|Health & Beauty|Sports & Outdoors|Toys & Games|Automotive|Books & Media|Other",
      "shippingOptions": ["Standard", "Express"],
      "freeShipping": true|false based on item value
    }
  },
  "attributes": {"color": "", "size": "", "model": ""}
}`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();
      
      // Clean the text before parsing
      let cleanedText = text
        .replace(/[\u0000-\u001F]/g, '') // Remove control characters
        .replace(/```json/g, '') // Remove markdown code blocks
        .replace(/```/g, '')
        .trim();
      
      // Extract JSON from the response
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('AI Response (no JSON found):', text);
        throw new Error('Failed to parse AI response - no JSON found');
      }

      let productData;
      try {
        productData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Attempted to parse:', jsonMatch[0]);
        throw new Error('Failed to parse AI response JSON: ' + parseError.message);
      }

      // Normalize condition to proper capitalization (Facebook format)
      if (productData.condition) {
        const conditionMap = {
          'new': 'New',
          'like new': 'Used – like new',
          'used - like new': 'Used – like new',
          'used – like new': 'Used – like new',
          'good': 'Used – good',
          'used - good': 'Used – good',
          'used – good': 'Used – good',
          'fair': 'Used – fair',
          'used - fair': 'Used – fair',
          'used – fair': 'Used – fair',
        };
        const normalized = conditionMap[productData.condition.toLowerCase()];
        if (normalized) productData.condition = normalized;
      }

      // Ensure descriptions object exists with fallback
      if (!productData.descriptions) {
        const fallbackDesc = productData.description || 'Product in good condition.';
        productData.descriptions = {
          carousell: fallbackDesc,
          facebook: fallbackDesc,
          generic: fallbackDesc,
        };
      }

      // Resolve FPC ID: prefer AI-returned facebookCategoryId, fall back to fuzzy mapping
      const rawFpcId = productData.facebookCategoryId;
      const fpcId = (rawFpcId && FB_CATEGORY_LIST.find(c => c.id === String(rawFpcId)))
        ? String(rawFpcId)
        : getFPCId(productData.category);
      const fpcCategoryName = getCategoryNameFromId(fpcId);
      const requiredFields = getRequiredFields(fpcId);

      console.log(`[AI] facebookCategoryId from AI: ${rawFpcId} → resolved: ${fpcId} (${fpcCategoryName})`);

      // Ensure platformData exists with fallback
      if (!productData.platformData) {
        productData.platformData = {
          carousell: {
            hashtags: [productData.brand || 'Item', productData.category || 'ForSale'],
            meetupLocations: ['Makati', 'BGC', 'Quezon City'],
          },
          facebook: { shippingAvailable: true },
        };
      }
      
      // Ensure carousell data exists with hashtags fallback
      if (!productData.platformData.carousell) {
        productData.platformData.carousell = {
          hashtags: [productData.brand || 'Item', productData.category || 'ForSale'],
          meetupLocations: ['Makati', 'BGC', 'Quezon City'],
        };
      } else {
        // Ensure hashtags exist even if carousell object exists
        if (!productData.platformData.carousell.hashtags || productData.platformData.carousell.hashtags.length === 0) {
          productData.platformData.carousell.hashtags = [productData.brand || 'Item', productData.category || 'ForSale'];
        }
        if (!productData.platformData.carousell.meetupLocations) {
          productData.platformData.carousell.meetupLocations = ['Makati', 'BGC', 'Quezon City'];
        }
      }
      
      if (!productData.platformData.facebook) productData.platformData.facebook = {};

      productData.platformData.facebook = {
        ...productData.platformData.facebook,
        categoryId: fpcId,
        categoryName: fpcCategoryName,
        hierarchy: isLeafCategory(fpcId) ? { parentName: getParentName(fpcId), leafName: FPC_HIERARCHY[fpcId]?.uiLabel || getLeafName(fpcId), fallbackLeaf: FPC_HIERARCHY[fpcId]?.fallbackLeaf || null } : null,
        requiredFields,
        shippingAvailable: productData.platformData.facebook.shippingAvailable ?? true,
        tags: productData.platformData.facebook.tags || [productData.brand, productData.category, productData.condition].filter(Boolean),
      };

      // Enhance image quality
      const enhancementResult = await this.enhanceImage(imageUri);

      return {
        success: true,
        data: {
          name: productData.name,
          brand: productData.brand,
          category: productData.category,
          condition: productData.condition,
          descriptions: productData.descriptions,
          suggestedPrice: productData.suggestedPrice,
          platformData: productData.platformData,
          attributes: productData.attributes,
          imageUri: enhancementResult.enhancedImage,
          originalImageUri: imageUri,
          imageEnhanced: enhancementResult.success,
          enhancements: enhancementResult.enhancements,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('AI Analysis Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to analyze image',
      };
    }
  },

  async generateDescription(productInfo) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

      const prompt = `Write 2-3 first-person sentences for: ${productInfo.brand} ${productInfo.name} (${productInfo.condition}). Use 'I', 'my'. Example: "I'm selling my MacBook Pro. Runs perfectly, comes with charger."`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Description Generation Error:', error);
      return `${productInfo.brand} ${productInfo.name} in ${productInfo.condition} condition. High-quality product ready for a new home.`;
    }
  },

  async suggestPrice(productInfo) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

      const prompt = `PHP price for ${productInfo.brand} ${productInfo.name} (${productInfo.condition}). Return JSON only:
{"suggestedPrice": number, "priceRange": {"min": number, "max": number}}
Condition multipliers: New=100%, Like new=85%, Good=70%, Fair=50%`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse price response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) { 
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
  },
};
