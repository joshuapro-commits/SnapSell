import { storageService } from './storage';

/**
 * Platform Service
 * Handles multi-platform publishing and account connections
 * Phase 1: Mock implementation
 * Phase 2: Real API integrations
 */

export const platformService = {
  /**
   * Get user's connected platforms status
   */
  async getConnectedPlatforms(userId) {
    try {
      const tokens = await storageService.getPlatformTokens(userId);
      return {
        carousell: !!tokens.carousell,
        facebook: !!tokens.facebook,
      };
    } catch (error) {
      console.error('Error getting connected platforms:', error);
      return {
        carousell: false,
        facebook: false,
      };
    }
  },

  /**
   * Connect Carousell account
   * Phase 1: Mock authentication
   * Phase 2: Real OAuth flow
   */
  async connectCarousell(userId) {
    try {
      // Mock authentication - simulate OAuth success
      const mockToken = {
        accessToken: `carousell_mock_token_${Date.now()}`,
        refreshToken: `carousell_refresh_${Date.now()}`,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        userId: 'mock_carousell_user_id',
        userName: 'Mock Carousell User',
      };

      // Save token
      await storageService.savePlatformToken(userId, 'carousell', mockToken);

      return {
        success: true,
        message: 'Carousell connected successfully',
      };
    } catch (error) {
      console.error('Error connecting Carousell:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Connect Facebook Marketplace account
   * Phase 1: Mock authentication
   * Phase 2: Real Facebook Login
   */
  async connectFacebook(userId) {
    try {
      // Mock authentication - simulate Facebook Login success
      const mockToken = {
        accessToken: `facebook_mock_token_${Date.now()}`,
        refreshToken: `facebook_refresh_${Date.now()}`,
        expiresAt: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days
        userId: 'mock_facebook_user_id',
        userName: 'Mock Facebook User',
        permissions: ['marketplace_listing', 'public_profile'],
      };

      // Save token
      await storageService.savePlatformToken(userId, 'facebook', mockToken);

      return {
        success: true,
        message: 'Facebook Marketplace connected successfully',
      };
    } catch (error) {
      console.error('Error connecting Facebook:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Disconnect a platform
   */
  async disconnectPlatform(userId, platform) {
    try {
      await storageService.removePlatformToken(userId, platform);
      return {
        success: true,
        message: `${platform} disconnected successfully`,
      };
    } catch (error) {
      console.error(`Error disconnecting ${platform}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Publish listing to selected platforms
   * Phase 1: Mock publishing with simulated delays
   * Phase 2: Real API calls
   */
  async publishListing(listingData, selectedPlatforms, userId) {
    const results = {
      carousell: null,
      facebook: null,
      errors: [],
    };

    // Get user's platform tokens
    const tokens = await storageService.getPlatformTokens(userId);

    // Publish to Carousell
    if (selectedPlatforms.carousell) {
      if (!tokens.carousell) {
        results.errors.push({
          platform: 'carousell',
          error: 'Carousell account not connected',
        });
      } else {
        try {
          // Mock API call - simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Mock successful response
          results.carousell = {
            success: true,
            listingId: `carousell_${Date.now()}`,
            listingUrl: `https://www.carousell.ph/p/mock-listing-${Date.now()}`,
            platform: 'carousell',
            publishedAt: new Date().toISOString(),
          };
        } catch (error) {
          results.errors.push({
            platform: 'carousell',
            error: error.message,
          });
        }
      }
    }

    // Publish to Facebook Marketplace
    if (selectedPlatforms.facebook) {
      if (!tokens.facebook) {
        results.errors.push({
          platform: 'facebook',
          error: 'Facebook account not connected',
        });
      } else {
        try {
          // Mock API call - simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Mock successful response
          results.facebook = {
            success: true,
            listingId: `facebook_${Date.now()}`,
            listingUrl: `https://www.facebook.com/marketplace/item/mock-${Date.now()}`,
            platform: 'facebook',
            publishedAt: new Date().toISOString(),
          };
        } catch (error) {
          results.errors.push({
            platform: 'facebook',
            error: error.message,
          });
        }
      }
    }

    return results;
  },

  /**
   * Check if platform tokens are valid
   */
  async validateTokens(userId) {
    try {
      const tokens = await storageService.getPlatformTokens(userId);
      const now = Date.now();

      return {
        carousell: tokens.carousell && tokens.carousell.expiresAt > now,
        facebook: tokens.facebook && tokens.facebook.expiresAt > now,
      };
    } catch (error) {
      console.error('Error validating tokens:', error);
      return {
        carousell: false,
        facebook: false,
      };
    }
  },

  /**
   * Refresh expired tokens
   * Phase 2: Implement real token refresh logic
   */
  async refreshToken(userId, platform) {
    try {
      // Mock token refresh
      const tokens = await storageService.getPlatformTokens(userId);
      const oldToken = tokens[platform];

      if (!oldToken) {
        throw new Error('No token to refresh');
      }

      const newToken = {
        ...oldToken,
        accessToken: `${platform}_refreshed_token_${Date.now()}`,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };

      await storageService.savePlatformToken(userId, platform, newToken);

      return {
        success: true,
        token: newToken,
      };
    } catch (error) {
      console.error(`Error refreshing ${platform} token:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
