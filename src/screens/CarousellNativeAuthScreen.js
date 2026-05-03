import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
    <LinearGradient
      colors={['#FFE8E8', '#FFF5F5', '#FFFFFF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={24} color="#1A1D1F" />
          </TouchableOpacity>
        </View>
        
        {/* Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="cart" size={72} color="#D32F2F" />
          </View>
          
          {/* Title */}
          <Text style={styles.title}>Connect to{"\n"}Carousell</Text>
          
          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Reach millions of buyers across Southeast Asia.{"\n"}
            List once, sell fast.
          </Text>
        </View>
        
        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            <Text style={styles.infoText}>
              Your login is secure. We'll automatically detect when you're signed in.
            </Text>
          </View>
          
          {/* Primary Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleWebViewAuth}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="mail" size={22} color="#FFF" />
                <Text style={styles.primaryButtonText}>Sign in with Email & Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Montserrat_700Bold',
    color: '#1A1D1F',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    color: '#6F7787',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    fontFamily: 'Montserrat_500Medium',
    color: '#1A1D1F',
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D32F2F',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#FFF',
  },
});
