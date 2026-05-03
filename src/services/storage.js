import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USERS: '@snap_sell_users',
  LISTINGS: '@snap_sell_listings',
  MY_LISTINGS: '@snap_sell_my_listings',
  PLATFORM_TOKENS: '@snap_sell_platform_tokens',
  ONBOARDING_COMPLETE: '@snap_sell_onboarding_complete',
  FB_DISCONNECT: '@snap_sell_fb_disconnect',
  PUBLISH_PROGRESS: '@snap_sell_publish_progress',
  FB_LAST_PUBLISH: '@snap_sell_fb_last_publish',
};

export const storageService = {
  // Remove all user session methods - no persistence
  // Keep only data storage methods

  async saveListings(listings) {
    try {
      await AsyncStorage.setItem(KEYS.LISTINGS, JSON.stringify(listings));
    } catch (error) {
      console.error('Error saving listings:', error);
    }
  },

  async getListings() {
    try {
      const listings = await AsyncStorage.getItem(KEYS.LISTINGS);
      return listings ? JSON.parse(listings) : [];
    } catch (error) {
      console.error('Error getting listings:', error);
      return [];
    }
  },

  async saveMyListings(listings) {
    try {
      await AsyncStorage.setItem(KEYS.MY_LISTINGS, JSON.stringify(listings));
    } catch (error) {
      console.error('Error saving my listings:', error);
    }
  },

  async getMyListings() {
    try {
      const listings = await AsyncStorage.getItem(KEYS.MY_LISTINGS);
      return listings ? JSON.parse(listings) : [];
    } catch (error) {
      console.error('Error getting my listings:', error);
      return [];
    }
  },

  // Platform Token Management
  async getPlatformTokens(userId) {
    try {
      const key = `${KEYS.PLATFORM_TOKENS}_${userId}`;
      const tokens = await AsyncStorage.getItem(key);
      return tokens ? JSON.parse(tokens) : { carousell: null, facebook: null, shopee: null };
    } catch (error) {
      console.error('Error getting platform tokens:', error);
      return { carousell: null, facebook: null, shopee: null };
    }
  },

  async savePlatformToken(userId, platform, token) {
    try {
      const key = `${KEYS.PLATFORM_TOKENS}_${userId}`;
      const tokens = await this.getPlatformTokens(userId);
      tokens[platform] = token;
      await AsyncStorage.setItem(key, JSON.stringify(tokens));
    } catch (error) {
      console.error('Error saving platform token:', error);
    }
  },

  async removePlatformToken(userId, platform) {
    try {
      const key = `${KEYS.PLATFORM_TOKENS}_${userId}`;
      console.log(`[STORAGE] Removing token for platform: ${platform}, key: ${key}`);
      
      const tokens = await this.getPlatformTokens(userId);
      console.log(`[STORAGE] Current tokens before removal:`, tokens);
      
      tokens[platform] = null;
      await AsyncStorage.setItem(key, JSON.stringify(tokens));
      
      console.log(`[STORAGE] Tokens after removal:`, tokens);
    } catch (error) {
      console.error('Error removing platform token:', error);
    }
  },

  async clearAllPlatformTokens(userId) {
    try {
      const key = `${KEYS.PLATFORM_TOKENS}_${userId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing platform tokens:', error);
    }
  },

  // User Management
  async getAllUsers() {
    try {
      const users = await AsyncStorage.getItem(KEYS.USERS);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  },

  async saveAllUsers(users) {
    try {
      await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving all users:', error);
    }
  },

  async addUser(user) {
    try {
      const users = await this.getAllUsers();
      users.push(user);
      await this.saveAllUsers(users);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  },

  async findUserByEmail(email) {
    try {
      const users = await this.getAllUsers();
      return users.find(u => u.email === email);
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  },

  // Onboarding - keep this for first-time experience
  async setOnboardingComplete() {
    try {
      await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, 'true');
    } catch (error) {
      console.error('Error setting onboarding complete:', error);
    }
  },

  async isOnboardingComplete() {
    try {
      const complete = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
      return complete === 'true';
    } catch (error) {
      console.error('Error checking onboarding:', error);
      return false;
    }
  },

  // Clear all data (for testing/reset)
  async clearAll() {
    try {
      console.log('[STORAGE] Clearing ALL AsyncStorage data...');
      await AsyncStorage.clear();
      console.log('[STORAGE] All data cleared successfully');
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  },

  // Clear only app-specific data (keeps system data)
  async clearAppData() {
    try {
      console.log('[STORAGE] Clearing ALL AsyncStorage data...');
      await AsyncStorage.clear();
      console.log('[STORAGE] All AsyncStorage cleared');
    } catch (error) {
      console.error('Error clearing app data:', error);
      throw error;
    }
  },

  // Generic data storage
  async saveData(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  },

  async getData(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting data:', error);
      return null;
    }
  },

  // Publish progress — persists the current step and listing data so the
  // bot can resume from the exact field if the app is killed mid-publish
  async savePublishProgress(userId, progress) {
    try {
      const key = `${KEYS.PUBLISH_PROGRESS}_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving publish progress:', error);
    }
  },

  async getPublishProgress(userId) {
    try {
      const key = `${KEYS.PUBLISH_PROGRESS}_${userId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting publish progress:', error);
      return null;
    }
  },

  async clearPublishProgress(userId) {
    try {
      const key = `${KEYS.PUBLISH_PROGRESS}_${userId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing publish progress:', error);
    }
  },

  async getLastPublishTime(userId) {
    try {
      const val = await AsyncStorage.getItem(`${KEYS.FB_LAST_PUBLISH}_${userId}`);
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  },

  async setLastPublishTime(userId) {
    try {
      const now = Date.now();
      await AsyncStorage.setItem(`${KEYS.FB_LAST_PUBLISH}_${userId}`, now.toString());
      
      // Also add to history
      const history = await this.getPublishHistory(userId);
      history.push(now);
      
      // Keep only last 24 hours of history
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      const recentHistory = history.filter(time => time > oneDayAgo);
      
      await AsyncStorage.setItem(`@snap_sell_fb_publish_history_${userId}`, JSON.stringify(recentHistory));
    } catch (error) {
      console.error('Error saving last publish time:', error);
    }
  },

  async getPublishHistory(userId) {
    try {
      const val = await AsyncStorage.getItem(`@snap_sell_fb_publish_history_${userId}`);
      if (!val) return [];
      
      const history = JSON.parse(val);
      
      // Filter out old entries (older than 24 hours)
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      return history.filter(time => time > oneDayAgo);
    } catch {
      return [];
    }
  },
};
