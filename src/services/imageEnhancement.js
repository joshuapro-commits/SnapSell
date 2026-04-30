import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Image Enhancement Service
 * Adds subtle IG-style verification checkmark to product photos
 */

export const imageEnhancementService = {
  /**
   * Add small verification checkmark badge to bottom-right corner of image
   * @param {string} imageUri - Original image URI
   * @param {object} verification - Verification data with score and level
   * @returns {Promise<string>} - Enhanced image URI
   */
  async addVerificationBadge(imageUri, verification) {
    try {
      if (!verification || !verification.verified) {
        return imageUri; // No verification, return original
      }

      // Get badge color based on verification level
      const badgeColors = {
        gold: '#FFD700',
        silver: '#C0C0C0',
        bronze: '#CD7F32',
      };
      const badgeColor = badgeColors[verification.badge?.level] || '#10B981';

      // Create SVG checkmark badge (small, subtle, bottom-right corner)
      const svgBadge = `
        <svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
          <!-- Outer circle with shadow -->
          <circle cx="30" cy="30" r="28" fill="white" opacity="0.95"/>
          <circle cx="30" cy="30" r="24" fill="${badgeColor}"/>
          
          <!-- Checkmark -->
          <path d="M 18 30 L 26 38 L 42 22" 
                stroke="white" 
                stroke-width="4" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                fill="none"/>
        </svg>
      `;

      // Convert SVG to base64
      const svgBase64 = Buffer.from(svgBadge).toString('base64');
      const svgDataUri = `data:image/svg+xml;base64,${svgBase64}`;

      // Get original image dimensions
      const imageInfo = await FileSystem.getInfoAsync(imageUri);
      if (!imageInfo.exists) {
        throw new Error('Image file not found');
      }

      // Manipulate image: overlay badge at bottom-right corner
      const result = await manipulateAsync(
        imageUri,
        [
          {
            overlay: {
              uri: svgDataUri,
              position: { x: -70, y: -70 }, // Bottom-right corner with 10px padding
            },
          },
        ],
        {
          compress: 0.9,
          format: SaveFormat.JPEG,
        }
      );

      return result.uri;
    } catch (error) {
      console.error('[IMAGE_ENHANCEMENT] Error adding badge:', error);
      return imageUri; // Return original on error
    }
  },

  /**
   * Add verification text to listing title
   * @param {string} title - Original title
   * @param {object} verification - Verification data
   * @returns {string} - Title with verification checkmark
   */
  addVerificationToTitle(title, verification) {
    if (!verification || !verification.verified) {
      return title;
    }

    // Add checkmark emoji if not already present
    if (title.includes('✓') || title.includes('✔')) {
      return title;
    }

    return `${title} ✓`;
  },

  /**
   * Add verification footer to listing description
   * @param {string} description - Original description
   * @param {object} verification - Verification data with score
   * @returns {string} - Description with verification footer
   */
  addVerificationToDescription(description, verification) {
    if (!verification || !verification.verified) {
      return description;
    }

    // Check if verification footer already exists
    if (description.includes('Verified by SnapSell')) {
      return description;
    }

    const verificationFooter = `\n\n✓ Verified by SnapSell | Trust Score: ${verification.score}%`;
    return `${description}${verificationFooter}`;
  },

  /**
   * Apply all verification enhancements to listing data
   * @param {object} listingData - Original listing data
   * @returns {Promise<object>} - Enhanced listing data
   */
  async enhanceListing(listingData) {
    try {
      const { verification, imageUri, name, description } = listingData;

      if (!verification || !verification.verified) {
        return listingData; // No verification, return original
      }

      // Enhance image with badge
      const enhancedImageUri = await this.addVerificationBadge(imageUri, verification);

      // Enhance title and description
      const enhancedName = this.addVerificationToTitle(name, verification);
      const enhancedDescription = this.addVerificationToDescription(description, verification);

      return {
        ...listingData,
        imageUri: enhancedImageUri,
        name: enhancedName,
        description: enhancedDescription,
        // Store original values for reference
        originalImageUri: imageUri,
        originalName: name,
        originalDescription: description,
      };
    } catch (error) {
      console.error('[IMAGE_ENHANCEMENT] Error enhancing listing:', error);
      return listingData; // Return original on error
    }
  },
};
