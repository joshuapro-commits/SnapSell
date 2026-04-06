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
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

      const prompt = `Analyze this product image and provide detailed information in JSON format with the following structure:
{
  "name": "product name",
  "brand": "brand name - IMPORTANT: Look carefully for any visible brand logos, text, or distinctive design elements. Check packaging, labels, product markings. If you can identify the brand with reasonable confidence, provide it. Only use 'Unknown' if absolutely no brand indicators are visible.",
  "category": "one of: electronics, clothing, furniture, books, sporting, toys, home, automotive, beauty, jewelry, art, musical, pet, office, other",
  "condition": "one of: new, like-new, good, fair, poor",
  "description": "Write a first-person description as if I'm the seller. Use 'I' and describe what I'm selling. Example: 'I'm selling this iPhone in excellent condition. It has been well maintained and comes with the original box.' Keep it 2-3 sentences, natural and conversational.",
  "suggestedPrice": estimated price in Philippine Peso (PHP) as a number based on current market value in the Philippines,
  "attributes": {
    "key relevant attributes like color, size, model, year, etc."
  }
}

IMPORTANT INSTRUCTIONS:
1. BRAND RECOGNITION: Examine the image very carefully for:
   - Visible logos (Apple, Nike, Samsung, Sony, etc.)
   - Brand text on product or packaging
   - Distinctive design patterns (Adidas stripes, Nike swoosh, etc.)
   - Product model numbers that indicate brand
   - Packaging colors and styles associated with specific brands
   Only use 'Unknown' if you genuinely cannot identify any brand markers.

2. PRICING IN PHILIPPINE PESO (PHP):
   - Research current market prices in the Philippines
   - Consider the condition when pricing
   - Factor in depreciation for used items
   - Compare with similar items on Philippine marketplaces (Lazada, Shopee, Carousell)
   - New items: Use current retail price in PHP
   - Used items: Reduce by 20-50% depending on condition
   - Example: iPhone 13 Pro (good condition) = ₱35,000-45,000 PHP

3. CATEGORY SELECTION - Be very accurate:
   - Electronics: phones, laptops, tablets, cameras, headphones, gaming consoles, TVs, smart devices
   - Clothing: shirts, pants, shoes, bags, hats, jackets, dresses, accessories
   - Furniture: chairs, tables, sofas, beds, desks, cabinets, shelves
   - Books: books, magazines, comics, textbooks, novels
   - Sporting: exercise equipment, sports gear, bikes, outdoor equipment
   - Toys: children's toys, board games, video games, puzzles, action figures
   - Home: kitchen items, decor, appliances, tools, lighting, bedding
   - Automotive: car parts, accessories, tools, maintenance items
   - Beauty: makeup, skincare, haircare, fragrances, grooming products
   - Jewelry: rings, necklaces, bracelets, watches, earrings
   - Art: paintings, sculptures, prints, crafts, collectibles
   - Musical: guitars, keyboards, drums, DJ equipment, audio gear
   - Pet: pet food, toys, accessories, cages, grooming supplies
   - Office: desk supplies, organizers, printers, paper, filing
   - Other: anything that doesn't fit the above categories`;

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
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }

      const productData = JSON.parse(jsonMatch[0]);

      // Enhance image quality
      const enhancementResult = await this.enhanceImage(imageUri);

      return {
        success: true,
        data: {
          ...productData,
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
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Generate a compelling first-person product description for my marketplace listing:
Product: ${productInfo.name}
Brand: ${productInfo.brand}
Category: ${productInfo.category}
Condition: ${productInfo.condition}

Write as if I'm the seller using first-person perspective (use 'I', 'my', etc.). Make it natural and conversational, like I'm personally describing what I'm selling. Example: "I'm selling my gently used MacBook Pro. It's been my daily driver for work and runs perfectly. Comes with the original charger."

Write 2-3 sentences that are personal, honest, and persuasive. Don't use third-person or formal language.`;

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
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Suggest a fair market price in Philippine Peso (PHP) for this product:
Product: ${productInfo.name}
Brand: ${productInfo.brand}
Category: ${productInfo.category}
Condition: ${productInfo.condition}

IMPORTANT: 
- Research current market prices in the Philippines (Lazada, Shopee, Carousell prices)
- Price must be in Philippine Peso (PHP)
- Consider the condition and apply appropriate depreciation
- New items: Current retail price in PHP
- Like-new: 80-90% of retail
- Good: 60-75% of retail
- Fair: 40-55% of retail
- Poor: 20-35% of retail

Provide ONLY a JSON response with this exact structure:
{
  "suggestedPrice": number in PHP,
  "priceRange": {
    "min": number in PHP,
    "max": number in PHP
  }
}

Example: For iPhone 13 Pro in good condition:
{
  "suggestedPrice": 40000,
  "priceRange": {
    "min": 35000,
    "max": 45000
  }
}`;

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
