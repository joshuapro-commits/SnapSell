import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Google OAuth Client IDs
const WEB_CLIENT_ID = '72999929916-h1o5qo7hrt4qqbr76r0n7ee1sen6djss.apps.googleusercontent.com';
const IOS_CLIENT_ID = '72999929916-u2jrcfqpjh9atk069tulkk104au6iuvh.apps.googleusercontent.com';

export const googleSignInService = {
  /**
   * Configure Google Sign-In
   * Must be called before any sign-in attempts
   */
  configure() {
    try {
      GoogleSignin.configure({
        webClientId: WEB_CLIENT_ID,
        iosClientId: IOS_CLIENT_ID,
        offlineAccess: true,
        forceCodeForRefreshToken: true,
        scopes: ['profile', 'email'],
      });
      console.log('[GOOGLE_SIGNIN] Configured successfully');
    } catch (error) {
      console.error('[GOOGLE_SIGNIN] Configuration error:', error);
    }
  },

  /**
   * Sign in with Google
   * Returns user info and tokens
   */
  async signIn() {
    try {
      console.log('[GOOGLE_SIGNIN] Starting sign-in flow...');
      
      // Check if device supports Google Play Services (Android)
      await GoogleSignin.hasPlayServices();
      
      // Trigger native Google Sign-In UI
      const userInfo = await GoogleSignin.signIn();
      
      console.log('[GOOGLE_SIGNIN] ✅ Sign-in successful');
      console.log('[GOOGLE_SIGNIN] User:', userInfo.user.email);
      
      // Get tokens
      const tokens = await GoogleSignin.getTokens();
      
      return {
        success: true,
        user: {
          id: userInfo.user.id,
          email: userInfo.user.email,
          name: userInfo.user.name,
          photo: userInfo.user.photo,
        },
        tokens: {
          idToken: tokens.idToken,
          accessToken: tokens.accessToken,
        },
      };
    } catch (error) {
      console.error('[GOOGLE_SIGNIN] Sign-in error:', error);
      
      // Handle specific error codes
      if (error.code === 'SIGN_IN_CANCELLED') {
        return {
          success: false,
          error: 'Sign-in cancelled by user',
          code: 'CANCELLED',
        };
      } else if (error.code === 'IN_PROGRESS') {
        return {
          success: false,
          error: 'Sign-in already in progress',
          code: 'IN_PROGRESS',
        };
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        return {
          success: false,
          error: 'Google Play Services not available',
          code: 'PLAY_SERVICES_ERROR',
        };
      }
      
      return {
        success: false,
        error: error.message || 'Sign-in failed',
        code: 'UNKNOWN_ERROR',
      };
    }
  },

  /**
   * Sign out from Google
   */
  async signOut() {
    try {
      await GoogleSignin.signOut();
      console.log('[GOOGLE_SIGNIN] Signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('[GOOGLE_SIGNIN] Sign-out error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Check if user is currently signed in
   */
  async isSignedIn() {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      return isSignedIn;
    } catch (error) {
      console.error('[GOOGLE_SIGNIN] Check sign-in status error:', error);
      return false;
    }
  },

  /**
   * Get current user info (if signed in)
   */
  async getCurrentUser() {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      return {
        success: true,
        user: userInfo.user,
      };
    } catch (error) {
      console.error('[GOOGLE_SIGNIN] Get current user error:', error);
      return { success: false };
    }
  },
};
