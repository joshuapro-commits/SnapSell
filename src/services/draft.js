import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_KEY = '@snap_sell_draft_listing';

/**
 * Draft Service
 * Saves user's work in progress so they don't lose data when app closes
 */

export const draftService = {
  /**
   * Save draft listing data
   */
  async saveDraft(draftData) {
    try {
      await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify({
        ...draftData,
        savedAt: new Date().toISOString(),
      }));
      console.log('[Draft] Saved draft listing');
    } catch (error) {
      console.error('[Draft] Error saving draft:', error);
    }
  },

  /**
   * Get saved draft
   */
  async getDraft() {
    try {
      const draftString = await AsyncStorage.getItem(DRAFT_KEY);
      if (draftString) {
        const draft = JSON.parse(draftString);
        console.log('[Draft] Loaded draft from:', draft.savedAt);
        return draft;
      }
      return null;
    } catch (error) {
      console.error('[Draft] Error loading draft:', error);
      return null;
    }
  },

  /**
   * Clear draft after successful publish
   */
  async clearDraft() {
    try {
      await AsyncStorage.removeItem(DRAFT_KEY);
      console.log('[Draft] Cleared draft');
    } catch (error) {
      console.error('[Draft] Error clearing draft:', error);
    }
  },

  /**
   * Check if draft exists
   */
  async hasDraft() {
    try {
      const draft = await AsyncStorage.getItem(DRAFT_KEY);
      return draft !== null;
    } catch (error) {
      return false;
    }
  },
};
