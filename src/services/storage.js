import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER: '@snap_sell_user',
  LISTINGS: '@snap_sell_listings',
  MY_LISTINGS: '@snap_sell_my_listings',
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
};
