import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { platformService } from '../services/platforms';

export const ConnectPlatformsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [connectedPlatforms, setConnectedPlatforms] = useState({
    carousell: false,
    facebook: false,
    shopee: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConnectedPlatforms();
  }, []);

  const loadConnectedPlatforms = async () => {
    try {
      const platforms = await platformService.getConnectedPlatforms(user.id);
      setConnectedPlatforms(platforms);
    } catch (error) {
      console.error('Error loading platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectCarousell = async () => {
    try {
      Alert.alert(
        'Connect Carousell',
        'This will open Carousell to authorize SnapSell to publish listings on your behalf.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: async () => {
              // Mock authentication for now (Phase 1)
              // In Phase 2, this will be real OAuth
              const result = await platformService.connectCarousell(user.id);
              
              if (result.success) {
                setConnectedPlatforms({ ...connectedPlatforms, carousell: true });
                Alert.alert('Success', 'Carousell account connected!');
              } else {
                Alert.alert('Error', result.error || 'Failed to connect Carousell');
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to Carousell');
    }
  };

  const handleConnectFacebook = async () => {
    try {
      Alert.alert(
        'Connect Facebook',
        'This will open Facebook to authorize SnapSell to publish to Marketplace on your behalf.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: async () => {
              // Mock authentication for now (Phase 1)
              // In Phase 2, this will be real Facebook Login
              const result = await platformService.connectFacebook(user.id);
              
              if (result.success) {
                setConnectedPlatforms({ ...connectedPlatforms, facebook: true });
                Alert.alert('Success', 'Facebook Marketplace connected!');
              } else {
                Alert.alert('Error', result.error || 'Failed to connect Facebook');
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to Facebook');
    }
  };

  const handleConnectShopee = async () => {
    try {
      Alert.alert(
        'Connect Shopee',
        'This will open Shopee to authorize SnapSell to publish listings on your behalf.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: async () => {
              // Mock authentication for now (Phase 1)
              // In Phase 2, this will be real Shopee OAuth
              const result = await platformService.connectShopee(user.id);
              
              if (result.success) {
                setConnectedPlatforms({ ...connectedPlatforms, shopee: true });
                Alert.alert('Success', 'Shopee account connected!');
              } else {
                Alert.alert('Error', result.error || 'Failed to connect Shopee');
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to Shopee');
    }
  };

  const handleDisconnect = (platform) => {
    const platformNames = {
      carousell: 'Carousell',
      facebook: 'Facebook Marketplace',
      shopee: 'Shopee',
    };
    
    Alert.alert(
      'Disconnect Platform',
      `Are you sure you want to disconnect ${platformNames[platform]}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await platformService.disconnectPlatform(user.id, platform);
            setConnectedPlatforms({ ...connectedPlatforms, [platform]: false });
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connect Platforms</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Description */}
        <View style={styles.descriptionCard}>
          <Ionicons name="rocket-outline" size={32} color="#FF6B35" />
          <Text style={styles.descriptionTitle}>Publish Everywhere at Once</Text>
          <Text style={styles.descriptionText}>
            Connect your marketplace accounts to publish listings directly from SnapSell. 
            One photo, multiple platforms! 🚀
          </Text>
        </View>

        {/* Carousell Card */}
        <View style={styles.platformCard}>
          <View style={styles.platformHeader}>
            <View style={styles.platformLogoContainer}>
              <View style={[styles.platformLogo, { backgroundColor: '#D32F2F' }]}>
                <Ionicons name="cart-outline" size={28} color="#FFF" />
              </View>
            </View>
            <View style={styles.platformInfo}>
              <Text style={styles.platformName}>Carousell</Text>
              <Text style={styles.platformDescription}>
                Philippines' leading marketplace
              </Text>
            </View>
            {connectedPlatforms.carousell && (
              <View style={styles.connectedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
            )}
          </View>

          <View style={styles.platformFeatures}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color="#10B981" />
              <Text style={styles.featureText}>Auto-publish listings</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color="#10B981" />
              <Text style={styles.featureText}>Sync listing updates</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color="#10B981" />
              <Text style={styles.featureText}>Track performance</Text>
            </View>
          </View>

          {connectedPlatforms.carousell ? (
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={() => handleDisconnect('carousell')}
            >
              <Text style={styles.disconnectButtonText}>Disconnect</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.connectButton}
              onPress={handleConnectCarousell}
            >
              <Text style={styles.connectButtonText}>Connect Carousell</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Facebook Marketplace Card */}
        <View style={styles.platformCard}>
          <View style={styles.platformHeader}>
            <View style={styles.platformLogoContainer}>
              <View style={[styles.platformLogo, { backgroundColor: '#1877F2' }]}>
                <Ionicons name="logo-facebook" size={28} color="#FFF" />
              </View>
            </View>
            <View style={styles.platformInfo}>
              <Text style={styles.platformName}>Facebook Marketplace</Text>
              <Text style={styles.platformDescription}>
                Reach millions of buyers
              </Text>
            </View>
            {connectedPlatforms.facebook && (
              <View style={styles.connectedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
            )}
          </View>

          <View style={styles.platformFeatures}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color="#10B981" />
              <Text style={styles.featureText}>Auto-publish listings</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color="#10B981" />
              <Text style={styles.featureText}>Sync listing updates</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color="#10B981" />
              <Text style={styles.featureText}>Track performance</Text>
            </View>
          </View>

          {connectedPlatforms.facebook ? (
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={() => handleDisconnect('facebook')}
            >
              <Text style={styles.disconnectButtonText}>Disconnect</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.connectButton}
              onPress={handleConnectFacebook}
            >
              <Text style={styles.connectButtonText}>Connect Facebook</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Shopee Card */}
        <View style={styles.platformCard}>
          <View style={styles.platformHeader}>
            <View style={styles.platformLogoContainer}>
              <View style={[styles.platformLogo, { backgroundColor: '#EE4D2D' }]}>
                <Ionicons name="bag-handle-outline" size={28} color="#FFF" />
              </View>
            </View>
            <View style={styles.platformInfo}>
              <Text style={styles.platformName}>Shopee</Text>
              <Text style={styles.platformDescription}>
                Leading online shopping platform
              </Text>
            </View>
            {connectedPlatforms.shopee && (
              <View style={styles.connectedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
            )}
          </View>

          <View style={styles.platformFeatures}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color="#10B981" />
              <Text style={styles.featureText}>Auto-publish listings</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color="#10B981" />
              <Text style={styles.featureText}>Sync listing updates</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color="#10B981" />
              <Text style={styles.featureText}>Track performance</Text>
            </View>
          </View>

          {connectedPlatforms.shopee ? (
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={() => handleDisconnect('shopee')}
            >
              <Text style={styles.disconnectButtonText}>Disconnect</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.connectButton}
              onPress={handleConnectShopee}
            >
              <Text style={styles.connectButtonText}>Connect Shopee</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Cross-Publish Card */}
        <View style={styles.crossPublishCardWrapper}>
          <View style={styles.bestValueBadge}>
            <Text style={styles.bestValueText}>BEST VALUE</Text>
          </View>
          <View style={styles.crossPublishCard}>
            <View style={styles.crossPublishLogos}>
              <View style={[styles.crossPublishLogo, { backgroundColor: '#5865F2' }]}>
                <Ionicons name="cart-outline" size={24} color="#FFF" />
              </View>
              <View style={[styles.crossPublishLogo, { backgroundColor: '#D32F2F', marginLeft: -12 }]}>
                <Ionicons name="pricetag" size={24} color="#FFF" />
              </View>
              <View style={[styles.crossPublishLogo, { backgroundColor: '#EE4D2D', marginLeft: -12 }]}>
                <Ionicons name="bag-handle" size={24} color="#FFF" />
              </View>
            </View>
            <View style={styles.crossPublishContent}>
              <Text style={styles.crossPublishTitle}>Cross-Publish to All</Text>
              <Text style={styles.crossPublishSubtitle}>Reach 5x more buyers instantly</Text>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#7C3AED" />
          <Text style={styles.infoText}>
            Your credentials are securely stored and never shared. 
            You can disconnect anytime.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
    color: '#000',
    marginTop: 12,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 20,
  },
  platformCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  platformLogoContainer: {
    marginRight: 12,
  },
  platformLogo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
    color: '#000',
    marginBottom: 4,
  },
  platformDescription: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  connectedBadge: {
    marginLeft: 8,
  },
  platformFeatures: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  connectButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  disconnectButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  disconnectButtonText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    marginLeft: 12,
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 18,
  },
  crossPublishCardWrapper: {
    position: 'relative',
    marginBottom: 24,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1,
  },
  bestValueText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 0.5,
  },
  crossPublishCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7C3AED',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  crossPublishLogos: {
    flexDirection: 'row',
    marginRight: 16,
  },
  crossPublishLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  crossPublishContent: {
    flex: 1,
  },
  crossPublishTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
    color: '#000',
    marginBottom: 4,
  },
  crossPublishSubtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
});
