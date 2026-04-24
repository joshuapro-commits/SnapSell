import { storageService } from './storage';

/**
 * Platform Service
 * Handles multi-platform publishing and account connections
 * Ready for real API integration
 */

export const platformService = {
  /**
   * Get user's connected platforms status
   */
  async getConnectedPlatforms(userId) {
    try {
      const tokens = await storageService.getPlatformTokens(userId);
      console.log(`[GET_CONNECTED] UserId: ${userId}, Tokens:`, tokens);
      
      const result = {
        carousell: tokens.carousell !== null && tokens.carousell !== undefined,
        facebook: tokens.facebook !== null && tokens.facebook !== undefined,
        shopee: tokens.shopee !== null && tokens.shopee !== undefined,
      };
      
      console.log(`[GET_CONNECTED] Result:`, result);
      return result;
    } catch (error) {
      console.error('Error getting connected platforms:', error);
      return {
        carousell: false,
        facebook: false,
        shopee: false,
      };
    }
  },

  /**
   * Connect Shopee account
   * TODO: Implement real OAuth flow with Shopee Open Platform API
   */
  async connectShopee(userId) {
    try {
      // TODO: Replace with real Shopee OAuth
      
      const mockToken = {
        accessToken: `shopee_token_${Date.now()}`,
        refreshToken: `shopee_refresh_${Date.now()}`,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        userId: `shopee_user_${userId}`,
        userName: 'Shopee User',
        shopId: `shop_${userId}`,
      };

      await storageService.savePlatformToken(userId, 'shopee', mockToken);

      return {
        success: true,
        message: 'Shopee connected successfully',
      };
    } catch (error) {
      console.error('Error connecting Shopee:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Connect Facebook Marketplace account
   * TODO: Implement real Facebook Login SDK
   */
  async connectFacebook(userId) {
    try {
      // TODO: Replace with real Facebook Login
      // 1. Use expo-facebook or react-native-fbsdk-next
      // 2. Request marketplace_listing permission
      // 3. Store access token
      
      const mockToken = {
        accessToken: `facebook_token_${Date.now()}`,
        refreshToken: `facebook_refresh_${Date.now()}`,
        expiresAt: Date.now() + 60 * 24 * 60 * 60 * 1000,
        userId: `facebook_user_${userId}`,
        userName: 'Facebook User',
        permissions: ['marketplace_listing', 'public_profile'],
      };

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
      console.log(`[DISCONNECT] Starting disconnect for ${platform}, userId: ${userId}`);
      
      await storageService.removePlatformToken(userId, platform);
      console.log(`[DISCONNECT] Token removed from storage`);
      
      // Verify it was removed
      const tokens = await storageService.getPlatformTokens(userId);
      console.log(`[DISCONNECT] Tokens after removal:`, tokens);
      
      // Store disconnect timestamp to force WebView remount
      if (platform === 'facebook') {
        const disconnectKey = `@snap_sell_fb_disconnect_${userId}`;
        await storageService.saveData(disconnectKey, Date.now().toString());
        console.log(`[DISCONNECT] Saved disconnect timestamp`);
      }
      
      return {
        success: true,
        message: `${platform} disconnected successfully`,
        clearCookies: platform === 'facebook',
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
   * Save Facebook cookies for session persistence
   */
  async saveFacebookCookies(userId, cookies) {
    try {
      const cookieKey = `@snap_sell_fb_cookies_${userId}`;
      await storageService.saveData(cookieKey, cookies);
      console.log('[COOKIE_SAVE] Facebook cookies saved');
      return { success: true };
    } catch (error) {
      console.error('Error saving Facebook cookies:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get saved Facebook cookies
   */
  async getFacebookCookies(userId) {
    try {
      const cookieKey = `@snap_sell_fb_cookies_${userId}`;
      const cookies = await storageService.getData(cookieKey);
      console.log('[COOKIE_LOAD] Facebook cookies loaded:', cookies ? 'YES' : 'NO');
      return cookies || '';
    } catch (error) {
      console.error('Error loading Facebook cookies:', error);
      return '';
    }
  },

  /**
   * Get platform tokens for a user
   */
  async getPlatformTokens(userId) {
    return await storageService.getPlatformTokens(userId);
  },

  /**
   * Get Facebook disconnect timestamp
   */
  async getFacebookDisconnectTime(userId) {
    try {
      const disconnectKey = `@snap_sell_fb_disconnect_${userId}`;
      const timestamp = await storageService.getData(disconnectKey);
      return timestamp || '0';
    } catch (error) {
      return '0';
    }
  },

  /**
   * Publish listing to selected platforms
   * TODO: Replace with real API calls
   */
  async publishListing(listingData, selectedPlatforms, userId) {
    const results = {
      carousell: null,
      facebook: null,
      shopee: null,
      errors: [],
    };

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
          // TODO: Replace with real Carousell API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          results.carousell = {
            success: true,
            listingId: `carousell_${Date.now()}`,
            listingUrl: `https://www.carousell.ph/p/${Date.now()}`,
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
          // TODO: Replace with real Facebook Graph API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          results.facebook = {
            success: true,
            listingId: `facebook_${Date.now()}`,
            listingUrl: `https://www.facebook.com/marketplace/item/${Date.now()}`,
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

    // Publish to Shopee
    if (selectedPlatforms.shopee) {
      if (!tokens.shopee) {
        results.errors.push({
          platform: 'shopee',
          error: 'Shopee account not connected',
        });
      } else {
        try {
          // TODO: Replace with real Shopee API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          results.shopee = {
            success: true,
            listingId: `shopee_${Date.now()}`,
            listingUrl: `https://shopee.ph/product/${Date.now()}`,
            platform: 'shopee',
            publishedAt: new Date().toISOString(),
          };
        } catch (error) {
          results.errors.push({
            platform: 'shopee',
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
        shopee: tokens.shopee && tokens.shopee.expiresAt > now,
      };
    } catch (error) {
      console.error('Error validating tokens:', error);
      return {
        carousell: false,
        facebook: false,
        shopee: false,
      };
    }
  },

  /**
   * Refresh expired tokens
   * TODO: Implement real token refresh logic
   */
  async refreshToken(userId, platform) {
    try {
      const tokens = await storageService.getPlatformTokens(userId);
      const oldToken = tokens[platform];

      if (!oldToken) {
        throw new Error('No token to refresh');
      }

      // TODO: Replace with real token refresh API call
      const newToken = {
        ...oldToken,
        accessToken: `${platform}_refreshed_${Date.now()}`,
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
