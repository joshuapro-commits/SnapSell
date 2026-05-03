/**
 * Image Enhancement Service
 * Adds verification indicators to listings (text only, no image modification)
 */

export const imageEnhancementService = {
  /**
   * Add verification checkmark to listing title
   * @param {string} title - Original title
   * @param {object} verification - Verification data
   * @returns {string} - Title with verification checkmark
   */
  addVerificationToTitle(title, verification) {
    if (!verification || !verification.verified) {
      return title;
    }

    // Add checkmark emoji if not already present
    if (title.includes('✓') || title.includes('✔') || title.includes('Verified')) {
      return title;
    }

    // Add checkmark and "Verified by SnapSell" badge with dash
    return `${title} - ✅ Verified by SnapSell`;
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

    // Get verification level badge
    const levelEmoji = {
      gold: '🥇',
      silver: '🥈', 
      bronze: '🥉',
    };
    const emoji = levelEmoji[verification.level] || '✓';

    const verificationFooter = `\n\n${emoji} Verified by SnapSell | Trust Score: ${verification.score}%\n✓ AI-verified authentic listing`;
    return `${description}${verificationFooter}`;
  },
};
