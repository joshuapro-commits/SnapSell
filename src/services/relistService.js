/**
 * Relist Service
 * Handles relisting logic for Facebook, Carousell, and Shopee
 */

import { storageService } from './storage';

export const relistService = {
  /**
   * Relist a listing to Facebook
   * @param {object} listing - Listing object
   * @param {object} navigation - React Navigation object
   * @param {string} userId - User ID
   */
  async relistToFacebook(listing, navigation, userId) {
    try {
      console.log('[RELIST] Starting Facebook relist for:', listing.name);
      
      // Navigate to Facebook WebView in "relist" mode
      navigation.navigate('FacebookUnifiedWebView', {
        mode: 'relist',
        userId: userId,
        listingData: listing,
        listingUrl: listing.platforms?.facebook?.listingUrl,
      });
      
      return { success: true };
    } catch (error) {
      console.error('[RELIST] Facebook relist error:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Relist a listing to Carousell
   * @param {object} listing - Listing object
   * @param {object} navigation - React Navigation object
   * @param {string} userId - User ID
   * @param {object} region - Carousell region
   */
  async relistToCarousell(listing, navigation, userId, region) {
    try {
      console.log('[RELIST] Starting Carousell relist for:', listing.name);
      
      // Navigate to Carousell WebView in "relist" mode
      navigation.navigate('CarousellWebView', {
        mode: 'relist',
        userId: userId,
        region: region,
        listingData: listing,
        listingUrl: listing.platforms?.carousell?.listingUrl,
      });
      
      return { success: true };
    } catch (error) {
      console.error('[RELIST] Carousell relist error:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Relist a listing to Shopee
   * @param {object} listing - Listing object
   * @param {object} navigation - React Navigation object
   * @param {string} userId - User ID
   */
  async relistToShopee(listing, navigation, userId) {
    try {
      console.log('[RELIST] Starting Shopee relist for:', listing.name);
      
      // Navigate to Shopee WebView in "relist" mode
      navigation.navigate('ShopeeWebView', {
        mode: 'relist',
        userId: userId,
        listingData: listing,
        listingUrl: listing.platforms?.shopee?.listingUrl,
      });
      
      return { success: true };
    } catch (error) {
      console.error('[RELIST] Shopee relist error:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Relist to all platforms for a listing
   * @param {object} listing - Listing object
   * @param {object} navigation - React Navigation object
   * @param {string} userId - User ID
   * @param {object} region - Carousell region (optional)
   */
  async relistToAllPlatforms(listing, navigation, userId, region) {
    const results = {
      facebook: null,
      carousell: null,
      shopee: null,
    };
    
    const platforms = listing.relistStatus?.platforms || [];
    
    // Relist to each platform sequentially
    for (const platform of platforms) {
      if (platform === 'facebook') {
        results.facebook = await this.relistToFacebook(listing, navigation, userId);
      } else if (platform === 'carousell') {
        results.carousell = await this.relistToCarousell(listing, navigation, userId, region);
      } else if (platform === 'shopee') {
        results.shopee = await this.relistToShopee(listing, navigation, userId);
      }
      
      // Wait 2 seconds between platforms to avoid overwhelming the user
      if (platforms.indexOf(platform) < platforms.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return results;
  },
  
  /**
   * Update listing after successful relist
   * @param {string} listingId - Listing ID
   * @param {string} platform - Platform name (facebook, carousell, shopee)
   */
  async updateListingAfterRelist(listingId, platform) {
    try {
      console.log('[RELIST] Updating listing after relist:', listingId, platform);
      
      // Get all listings
      const listings = await storageService.getMyListings();
      
      // Find and update the listing
      const updatedListings = listings.map(listing => {
        if (listing.id === listingId) {
          return {
            ...listing,
            platforms: {
              ...listing.platforms,
              [platform]: {
                ...listing.platforms[platform],
                lastRelistedAt: new Date().toISOString(),
                relistCount: (listing.platforms[platform]?.relistCount || 0) + 1,
              },
            },
          };
        }
        return listing;
      });
      
      // Save updated listings
      await storageService.saveMyListings(updatedListings);
      
      console.log('[RELIST] Listing updated successfully');
      return { success: true };
    } catch (error) {
      console.error('[RELIST] Update listing error:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Batch relist multiple listings
   * @param {array} listings - Array of listing objects
   * @param {object} navigation - React Navigation object
   * @param {string} userId - User ID
   * @param {object} region - Carousell region (optional)
   */
  async batchRelist(listings, navigation, userId, region) {
    console.log('[RELIST] Starting batch relist for', listings.length, 'listings');
    
    const results = [];
    
    for (const listing of listings) {
      const result = await this.relistToAllPlatforms(listing, navigation, userId, region);
      results.push({
        listingId: listing.id,
        listingName: listing.name,
        ...result,
      });
      
      // Wait 3 seconds between listings
      if (listings.indexOf(listing) < listings.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    return results;
  },
};
