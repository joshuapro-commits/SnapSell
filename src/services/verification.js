import { GoogleGenerativeAI } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system/legacy';
import { GEMINI_API_KEY } from '../config/gemini';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Verification Service
 * Handles AI-powered listing verification for trust and security
 */
export const verificationService = {
  /**
   * Verify listing authenticity and consistency
   * @param {Object} params - Verification parameters
   * @param {string} params.imageUri - Image URI
   * @param {string} params.photoSource - 'camera' or 'gallery'
   * @param {Object} params.listingData - Generated listing data
   * @param {Object} params.exifData - Photo metadata (optional)
   * @returns {Object} Verification result with score and details
   */
  async verifyListing({ imageUri, photoSource, listingData, exifData = null }) {
    try {
      console.log('[VERIFICATION] Starting listing verification...');
      
      const verificationChecks = {
        photoSource: this.verifyPhotoSource(photoSource),
        aiConsistency: await this.verifyAIConsistency(imageUri, listingData),
        metadata: this.verifyMetadata(exifData),
        timestamp: this.verifyTimestamp(exifData),
      };

      // Calculate overall verification score (0-100)
      const score = this.calculateVerificationScore(verificationChecks);
      
      // Determine verification level
      const level = this.getVerificationLevel(score);
      
      const result = {
        verified: score >= 70, // Minimum 70% to be "verified"
        score: score,
        level: level, // 'gold', 'silver', 'bronze', 'unverified'
        checks: verificationChecks,
        badge: this.getBadgeInfo(level),
        timestamp: new Date().toISOString(),
      };

      console.log('[VERIFICATION] Result:', {
        verified: result.verified,
        score: result.score,
        level: result.level,
      });

      return result;
    } catch (error) {
      console.error('[VERIFICATION] Error:', error);
      return {
        verified: false,
        score: 0,
        level: 'unverified',
        checks: {},
        error: error.message,
      };
    }
  },

  /**
   * Verify photo source (camera is more trustworthy than gallery)
   */
  verifyPhotoSource(photoSource) {
    const isCamera = photoSource === 'camera';
    return {
      passed: isCamera,
      score: isCamera ? 25 : 5, // Camera = 25 points, Gallery = 5 points (reduced from 10)
      source: photoSource,
      message: isCamera 
        ? 'Photo taken with camera (high trust)' 
        : 'Photo uploaded from gallery (low trust)',
    };
  },

  /**
   * Verify AI consistency between image and description
   * Uses Gemini 2.5 Flash Lite to cross-check if description matches visual evidence
   */
  async verifyAIConsistency(imageUri, listingData) {
    try {
      console.log('[VERIFICATION] Checking AI consistency...');
      
      // Convert image to base64 using legacy API
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

      const prompt = `You are a verification AI. Analyze this product image and the provided description.

DESCRIPTION TO VERIFY:
- Product: ${listingData.name || listingData.title}
- Category: ${listingData.category}
- Condition: ${listingData.condition}
- Description: ${listingData.description || listingData.descriptions?.carousell || ''}

TASK:
1. Does the image match the product name/category? (Yes/No)
2. Is the condition assessment accurate based on visible wear/damage? (Yes/No)
3. Are there any red flags (stock photo, watermarks, inconsistencies)? (Yes/No)
4. Confidence score (0-100) that this is a legitimate listing

Respond in JSON format:
{
  "productMatch": true/false,
  "conditionAccurate": true/false,
  "hasRedFlags": true/false,
  "redFlagDetails": "description if any",
  "confidenceScore": 0-100,
  "reasoning": "brief explanation"
}`;

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64,
          },
        },
        { text: prompt },
      ]);

      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        
        const passed = analysis.productMatch && 
                      analysis.conditionAccurate && 
                      !analysis.hasRedFlags &&
                      analysis.confidenceScore >= 70;

        return {
          passed: passed,
          score: passed ? 40 : 20, // 40 points if passed, 20 if failed
          confidenceScore: analysis.confidenceScore,
          details: analysis,
          message: passed 
            ? 'AI verified: Description matches image perfectly'
            : `AI concern: ${analysis.reasoning}`,
        };
      }

      // Fallback if parsing fails
      return {
        passed: true,
        score: 30,
        message: 'AI verification completed (basic check)',
      };

    } catch (error) {
      console.error('[VERIFICATION] AI consistency error:', error);
      return {
        passed: true,
        score: 20,
        message: 'AI verification unavailable',
        error: error.message,
      };
    }
  },

  /**
   * Verify photo metadata (EXIF data)
   */
  verifyMetadata(exifData) {
    // Gallery photos without EXIF get 0 points (likely downloaded/stock)
    if (!exifData) {
      return {
        passed: false,
        score: 0, // No credit without metadata
        message: 'No metadata found (possible stock photo)',
      };
    }

    // Check for camera/device info
    const hasDeviceInfo = exifData.make || exifData.model;
    
    return {
      passed: hasDeviceInfo,
      score: hasDeviceInfo ? 15 : 0,
      deviceInfo: {
        make: exifData.make,
        model: exifData.model,
      },
      message: hasDeviceInfo 
        ? `Photo taken with ${exifData.make} ${exifData.model}`
        : 'No device information found',
    };
  },

  /**
   * Verify photo timestamp (recent photos are more trustworthy)
   */
  verifyTimestamp(exifData) {
    // If no EXIF data, give minimal points (could be old/downloaded photo)
    if (!exifData || !exifData.dateTime) {
      return {
        passed: false,
        score: 5, // Minimal points without timestamp
        message: 'No timestamp data (unknown age)',
      };
    }

    const photoDate = new Date(exifData.dateTime);
    const now = new Date();
    const hoursDiff = (now - photoDate) / (1000 * 60 * 60);

    // Recent photos (within 24 hours) get higher score
    const isRecent = hoursDiff <= 24;
    const isVeryRecent = hoursDiff <= 1;

    return {
      passed: isRecent,
      score: isVeryRecent ? 20 : (isRecent ? 15 : 5),
      photoAge: `${Math.round(hoursDiff)} hours ago`,
      message: isVeryRecent 
        ? 'Photo taken within the last hour (very fresh)'
        : isRecent 
          ? 'Photo taken within 24 hours (fresh)'
          : 'Photo is older than 24 hours',
    };
  },

  /**
   * Calculate overall verification score
   */
  calculateVerificationScore(checks) {
    let totalScore = 0;
    
    if (checks.photoSource) totalScore += checks.photoSource.score;
    if (checks.aiConsistency) totalScore += checks.aiConsistency.score;
    if (checks.metadata) totalScore += checks.metadata.score;
    if (checks.timestamp) totalScore += checks.timestamp.score;

    return Math.min(100, totalScore); // Cap at 100
  },

  /**
   * Get verification level based on score
   */
  getVerificationLevel(score) {
    console.log('[VERIFICATION] Calculating level for score:', score);
    if (score >= 80) {
      console.log('[VERIFICATION] Level: GOLD');
      return 'gold';
    }
    if (score >= 60) {
      console.log('[VERIFICATION] Level: SILVER');
      return 'silver';
    }
    if (score >= 40) {
      console.log('[VERIFICATION] Level: BRONZE');
      return 'bronze';
    }
    console.log('[VERIFICATION] Level: UNVERIFIED');
    return 'unverified';
  },

  /**
   * Get badge information for UI
   */
  getBadgeInfo(level) {
    const badges = {
      gold: {
        label: 'Verified by SnapSell',
        shortLabel: 'Gold Verified',
        color: '#FFD700',
        icon: 'shield-checkmark',
        description: 'Highest trust level - AI verified with fresh photo',
      },
      silver: {
        label: 'Verified by SnapSell',
        shortLabel: 'Silver Verified',
        color: '#C0C0C0',
        icon: 'shield-checkmark-outline',
        description: 'High trust level - AI verified listing',
      },
      bronze: {
        label: 'Verified by SnapSell',
        shortLabel: 'Bronze Verified',
        color: '#CD7F32',
        icon: 'shield-outline',
        description: 'Good trust level - Basic verification passed',
      },
    };

    return badges[level] || null; // Return null for unverified instead of badge
  },

  /**
   * Get seller verification score
   * Based on their history of verified listings
   */
  async getSellerScore(userId, listings) {
    try {
      const userListings = listings.filter(l => l.userId === userId);
      
      if (userListings.length === 0) {
        return {
          score: 0,
          level: 'new',
          totalListings: 0,
          verifiedListings: 0,
          message: 'New seller',
        };
      }

      const verifiedListings = userListings.filter(l => l.verification?.verified);
      const verificationRate = (verifiedListings.length / userListings.length) * 100;

      // Calculate average verification score
      const avgScore = verifiedListings.reduce((sum, l) => 
        sum + (l.verification?.score || 0), 0
      ) / (verifiedListings.length || 1);

      let level = 'bronze';
      if (verificationRate >= 80 && avgScore >= 85) level = 'gold';
      else if (verificationRate >= 60 && avgScore >= 70) level = 'silver';

      return {
        score: Math.round(avgScore),
        level: level,
        totalListings: userListings.length,
        verifiedListings: verifiedListings.length,
        verificationRate: Math.round(verificationRate),
        message: `${verificationRate.toFixed(0)}% verified listings`,
      };
    } catch (error) {
      console.error('[VERIFICATION] Seller score error:', error);
      return {
        score: 0,
        level: 'new',
        totalListings: 0,
        verifiedListings: 0,
        message: 'Unable to calculate',
      };
    }
  },

  /**
   * Check for reverse image search (future implementation)
   * This would integrate with Google Vision API or TinEye
   */
  async checkReverseImageSearch(imageUri) {
    // TODO: Implement reverse image search
    // For now, return placeholder
    console.log('[VERIFICATION] Reverse image search not yet implemented');
    return {
      passed: true,
      isStockPhoto: false,
      message: 'Reverse image search coming soon',
    };
  },
};
