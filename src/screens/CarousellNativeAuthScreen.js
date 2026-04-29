import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authenticateWithGoogle, injectCookiesIntoWebView } from '../services/carousellAuth';
import { storageService } from '../services/storage';

/**
 * Native Carousell Authentication Screen
 * 
 * This screen provides two authentication options:
 * 1. Native OAuth (opens system browser) - RECOMMENDED
 * 2. WebView login (fallback)
 * 
 * The native approach is preferred because:
 * - Google/Facebook trust system browsers
 * - Users can use saved passwords/biometrics
 * - No WebView security blocks
 */
export const CarousellNativeAuthScreen = ({ navigation, route }) => {
  const { userId, region } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState(null);
  
  const domain = region?.domain || 'carousell.ph';
  
  // Handle deep link callback from browser
  useEffect(() => {
    const handleDeepLink = async (event) => {
      const url = event.url;
      console.log('[NATIVE_AUTH] Deep link received:', url);
      
      // In development client, the URL format is: exp+snapsell://expo-development-client/?url=...
      // In production, it will be: snapsell://oauth/callback
      // We need to handle both cases
      
      const isOAuthCallback = url.includes('oauth/callback') || 
                              url.includes('expo-development-client');
      
      if (isOAuthCallback && loading && method === 'native') {
        console.log('[NATIVE_AUTH] OAuth callback detected, marking as connected');
        
        // Save connection
        const connectionData = {
          connected: true,
          connectedAt: new Date().toISOString(),
          userName: 'Carousell User',
          region: region?.id,
          regionName: region?.name,
          domain: domain,
          authMethod: 'native',
        };
        
        await storageService.savePlatformToken(userId, 'carousell', connectionData);
        
        setLoading(false);
        setMethod(null);
        
        Alert.alert(
          'Connected Successfully',
          `Your Carousell ${region?.name} account is now connected!\n\nYou can now publish listings to Carousell.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    };
    
    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    return () => subscription.remove();
  }, [userId, region, domain, navigation, loading, method]);
  
  const handleNativeAuth = async () => {
    setLoading(true);
    setMethod('native');
    
    try {
      console.log('[NATIVE_AUTH] Starting native authentication');
      
      // Open system browser for login
      const result = await authenticateWithGoogle(domain);
      
      if (result.success) {
        console.log('[NATIVE_AUTH] Authentication successful');
        
        // Inject cookies into WebView
        await injectCookiesIntoWebView(domain, result.cookies);
        
        // Save connection to platform tokens
        const connectionData = {
          connected: true,
          connectedAt: new Date().toISOString(),
          userName: 'Carousell User',
          region: region.id,
          regionName: region.name,
          domain: domain,
          authMethod: 'native',
        };
        
        await storageService.savePlatformToken(userId, 'carousell', connectionData);
        
        Alert.alert(
          'Connected Successfully',
          `Your Carousell ${region.name} account is now connected!\\n\\nYou can now publish listings to Carousell.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        console.log('[NATIVE_AUTH] Authentication failed:', result.error);
        Alert.alert(
          'Authentication Failed',
          result.error || 'Could not connect to Carousell. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('[NATIVE_AUTH] Error:', error);
      Alert.alert(
        'Error',
        'An error occurred during authentication. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setMethod(null);
    }
  };
  
  const handleWebViewAuth = () => {
    // Navigate to the WebView-based authentication
    navigation.replace('CarousellWebView', {
      mode: 'login',
      userId,
      region,
    });
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Ionicons name="close" size={28} color="#000" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Connect Carousell</Text>
        
        <View style={{ width: 40 }} />
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="cart" size={64} color="#D32F2F" />
        </View>
        
        <Text style={styles.title}>Connect Your Carousell Account</Text>
        <Text style={styles.subtitle}>
          Sign in with your Carousell email and password
        </Text>
        
        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark" size={20} color="#10B981" />
          <Text style={styles.infoText}>
            Your login is secure. We'll automatically detect when you're signed in.
          </Text>
        </View>
        
        {/* Primary Login Button */}
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleWebViewAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="mail" size={24} color="#FFF" />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonText}>Sign in with Email & Password</Text>
                <Text style={styles.buttonSubtext}>Fast & Reliable</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
        
        {/* How it Works */}
        <View style={styles.howItWorksBox}>
          <Text style={styles.howItWorksTitle}>How it works:</Text>
          <View style={styles.howItWorksStep}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Enter your Carousell email and password</Text>
          </View>
          <View style={styles.howItWorksStep}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>We'll automatically detect when you're logged in</Text>
          </View>
          <View style={styles.howItWorksStep}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Start publishing listings instantly!</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFE8E8',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Montserrat_400Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#D32F2F',
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#D32F2F',
  },
  buttonTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#FFF',
  },
  buttonSubtext: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  secondaryButtonText: {
    color: '#D32F2F',
  },
  secondaryButtonSubtext: {
    color: '#999',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#999',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
    color: '#15803D',
    lineHeight: 20,
  },
  howItWorksBox: {
    marginTop: 32,
    padding: 20,
    backgroundColor: '#F8F9FC',
    borderRadius: 12,
  },
  howItWorksTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#1A1D1F',
    marginBottom: 16,
  },
  howItWorksStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D32F2F',
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    color: '#6F7787',
    lineHeight: 20,
  },
});
