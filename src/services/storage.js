import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER: '@snap_sell_user',
  USERS: '@snap_sell_users',
  LISTINGS: '@snap_sell_listings',
  MY_LISTINGS: '@snap_sell_my_listings',
  PLATFORM_TOKENS: '@snap_sell_platform_tokens',
  ONBOARDING_COMPLETE: '@snap_sell_onboarding_complete',
  FB_DISCONNECT: '@snap_sell_fb_disconnect',
};

export const storageService = {
  async saveUser(user) {
    try {
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  },

  async getUser() {
    try {
      const user = await AsyncStorage.getItem(KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async removeUser() {
    try {
      await AsyncStorage.removeItem(KEYS.USER);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  },

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

  // Onboarding
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
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
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
};
