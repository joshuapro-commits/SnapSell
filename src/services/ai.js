import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config/gemini';

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
  "category": "electronics|clothing|furniture|books|sporting|toys|home|automotive|beauty|jewelry|art|musical|pet|office|other",
  "condition": "New|Used - Like New|Used - Good|Used - Fair",
  "descriptions": {
    "carousell": "Casual 2-3 sentences with emojis. Start 'Selling my...' Example: 'Selling my iPhone 13 Pro! 🔥 95% battery, no scratches. Comes with box and charger! 📦'",
    "facebook": "Professional with line breaks. Example: 'iPhone 13 Pro - Excellent\\n\\n- 95% battery\\n- No scratches\\n- Original box included\\n\\nMeetup: BGC'",
    "shopee": "E-commerce style with bullet points. Highlight features and benefits. Example: '✨ iPhone 13 Pro - Premium Condition\\n\\n📱 Product Highlights:\\n• 95% Battery Health\\n• Zero Scratches or Dents\\n• Complete with Original Box & Charger\\n• Fully Tested & Working\\n\\n🚚 Fast Shipping Available\\n💯 100% Authentic'",
    "generic": "Balanced 2-3 sentences. Example: 'iPhone 13 Pro in excellent condition. 95% battery health, no scratches. Includes original box.'"
  },
  "suggestedPrice": PHP price number (research PH market: New=retail, Used - Like New=80-90%, Used - Good=60-75%, Used - Fair=40-55%),
  "platformData": {
    "carousell": {
      "hashtags": ["3-5 terms without #: brand, category, condition"],
      "meetupLocations": ["2-3 Metro Manila areas: Makati, BGC, QC, Ortigas, Manila"]
    },
    "facebook": {
      "category": "Vehicles|Property Rentals|Apparel|Electronics|Entertainment|Home Goods|Musical Instruments|Office Supplies|Pet Supplies|Sporting Goods|Toys & Games|Other",
      "shippingAvailable": true|false
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

      // Ensure descriptions object exists with fallback
      if (!productData.descriptions) {
        const fallbackDesc = productData.description || 'Product in good condition.';
        productData.descriptions = {
          carousell: fallbackDesc,
          facebook: fallbackDesc,
          generic: fallbackDesc,
        };
      }

      // Ensure platformData exists with fallback
      if (!productData.platformData) {
        productData.platformData = {
          carousell: {
            hashtags: [productData.brand || 'Item', productData.category || 'ForSale'],
            meetupLocations: ['Makati', 'BGC', 'Quezon City'],
          },
          facebook: {
            category: 'Other',
            shippingAvailable: true,
          },
        };
      }

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
Condition multipliers: New=100%, Used - Like New=85%, Used - Good=70%, Used - Fair=50%`;

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
