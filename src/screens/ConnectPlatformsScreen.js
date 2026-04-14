import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { platformService } from '../services/platforms';
import { CustomAlert } from '../components/CustomAlert';

export const ConnectPlatformsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [connectedPlatforms, setConnectedPlatforms] = useState({
    carousell: false,
    facebook: false,
    shopee: false,
  });
  const [loading, setLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [],
    icon: null,
    iconColor: null,
    iconBackground: null,
  });

  const showAlert = (config) => {
    setAlertConfig({ ...config, visible: true });
  };

  const hideAlert = () => {
    setAlertConfig({ ...alertConfig, visible: false });
  };

  useEffect(() => {
    loadConnectedPlatforms();
  }, []);

  // Reload when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadConnectedPlatforms();
    });
    return unsubscribe;
  }, [navigation]);

  const loadConnectedPlatforms = async () => {
    try {
      setLoading(true);
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
      showAlert({
        title: 'Connect Carousell',
        message: 'This will open Carousell to authorize SnapSell to publish listings on your behalf.',
        icon: 'cart-outline',
        iconColor: '#D32F2F',
        iconBackground: '#FFEBEE',
        buttons: [
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: hideAlert,
          },
          {
            text: 'Continue',
            onPress: async () => {
              hideAlert();
              const result = await platformService.connectCarousell(user.id);
              
              if (result.success) {
                setConnectedPlatforms({ ...connectedPlatforms, carousell: true });
                showAlert({
                  title: 'Successfully Connected',
                  message: 'Your Carousell account has been successfully connected. You can now publish listings directly to Carousell.',
                  icon: 'checkmark-circle',
                  iconColor: '#10B981',
                  iconBackground: '#ECFDF5',
                  buttons: [
                    {
                      text: 'OK',
                      onPress: () => {
                        hideAlert();
                        navigation.goBack();
                      },
                    },
                  ],
                });
              } else {
                showAlert({
                  title: 'Error',
                  message: result.error || 'Failed to connect Carousell',
                  icon: 'alert-circle',
                  iconColor: '#EF4444',
                  iconBackground: '#FEF2F2',
                  buttons: [{ text: 'OK', onPress: hideAlert }],
                });
              }
            },
          },
        ],
      });
    } catch (error) {
      showAlert({
        title: 'Error',
        message: 'Failed to connect to Carousell',
        icon: 'alert-circle',
        iconColor: '#EF4444',
        iconBackground: '#FEF2F2',
        buttons: [{ text: 'OK', onPress: hideAlert }],
      });
    }
  };

  const handleConnectFacebook = async () => {
    try {
      const platforms = await platformService.getConnectedPlatforms(user.id);
      const isReconnecting = !platforms.facebook;
      
      showAlert({
        title: 'Connect Facebook',
        message: 'You will be redirected to Facebook to log in. Once logged in, your session will be saved for publishing listings.',
        icon: 'logo-facebook',
        iconColor: '#1877F2',
        iconBackground: '#E8F0FE',
        buttons: [
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: hideAlert,
          },
          {
            text: 'Continue',
            onPress: () => {
              hideAlert();
              navigation.navigate('FacebookLoginWebView', { 
                userId: user.id,
                isReconnecting: isReconnecting
              });
            },
          },
        ],
      });
    } catch (error) {
      showAlert({
        title: 'Error',
        message: 'Failed to connect to Facebook',
        icon: 'alert-circle',
        iconColor: '#EF4444',
        iconBackground: '#FEF2F2',
        buttons: [{ text: 'OK', onPress: hideAlert }],
      });
    }
  };

  const handleConnectShopee = async () => {
    try {
      showAlert({
        title: 'Connect Shopee',
        message: 'This will open Shopee to authorize SnapSell to publish listings on your behalf.',
        icon: 'bag-handle-outline',
        iconColor: '#EE4D2D',
        iconBackground: '#FFF0ED',
        buttons: [
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: hideAlert,
          },
          {
            text: 'Continue',
            onPress: async () => {
              hideAlert();
              const result = await platformService.connectShopee(user.id);
              
              if (result.success) {
                setConnectedPlatforms({ ...connectedPlatforms, shopee: true });
                showAlert({
                  title: 'Successfully Connected',
                  message: 'Your Shopee account has been successfully connected. You can now publish listings directly to Shopee.',
                  icon: 'checkmark-circle',
                  iconColor: '#10B981',
                  iconBackground: '#ECFDF5',
                  buttons: [
                    {
                      text: 'OK',
                      onPress: () => {
                        hideAlert();
                        navigation.goBack();
                      },
                    },
                  ],
                });
              } else {
                showAlert({
                  title: 'Error',
                  message: result.error || 'Failed to connect Shopee',
                  icon: 'alert-circle',
                  iconColor: '#EF4444',
                  iconBackground: '#FEF2F2',
                  buttons: [{ text: 'OK', onPress: hideAlert }],
                });
              }
            },
          },
        ],
      });
    } catch (error) {
      showAlert({
        title: 'Error',
        message: 'Failed to connect to Shopee',
        icon: 'alert-circle',
        iconColor: '#EF4444',
        iconBackground: '#FEF2F2',
        buttons: [{ text: 'OK', onPress: hideAlert }],
      });
    }
  };

  const handleDisconnect = (platform) => {
    const platformNames = {
      carousell: 'Carousell',
      facebook: 'Facebook Marketplace',
      shopee: 'Shopee',
    };
    
    const platformIcons = {
      carousell: { icon: 'cart-outline', color: '#D32F2F', bg: '#FFEBEE' },
      facebook: { icon: 'logo-facebook', color: '#1877F2', bg: '#E8F0FE' },
      shopee: { icon: 'bag-handle-outline', color: '#EE4D2D', bg: '#FFF0ED' },
    };
    
    showAlert({
      title: 'Disconnect Platform',
      message: `Are you sure you want to disconnect ${platformNames[platform]}?`,
      icon: platformIcons[platform].icon,
      iconColor: platformIcons[platform].color,
      iconBackground: platformIcons[platform].bg,
      buttons: [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: hideAlert,
        },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            hideAlert();
            try {
              const result = await platformService.disconnectPlatform(user.id, platform);
              
              if (result.success) {
                await loadConnectedPlatforms();
                
                const disconnectMessage = platform === 'facebook'
                  ? `${platformNames[platform]} has been disconnected. When you reconnect, you'll be able to log in with a different Facebook account.`
                  : `${platformNames[platform]} has been disconnected. You can now connect a different account.`;
                
                showAlert({
                  title: 'Disconnected',
                  message: disconnectMessage,
                  icon: 'checkmark-circle',
                  iconColor: '#10B981',
                  iconBackground: '#ECFDF5',
                  buttons: [{ text: 'OK', onPress: hideAlert }],
                });
              } else {
                showAlert({
                  title: 'Error',
                  message: result.error || 'Failed to disconnect platform.',
                  icon: 'alert-circle',
                  iconColor: '#EF4444',
                  iconBackground: '#FEF2F2',
                  buttons: [{ text: 'OK', onPress: hideAlert }],
                });
              }
            } catch (error) {
              console.error('Error disconnecting platform:', error);
              showAlert({
                title: 'Error',
                message: 'Failed to disconnect platform. Please try again.',
                icon: 'alert-circle',
                iconColor: '#EF4444',
                iconBackground: '#FEF2F2',
                buttons: [{ text: 'OK', onPress: hideAlert }],
              });
            }
          },
        },
      ],
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Connect Platforms</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Processing...</Text>
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

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
        iconBackground={alertConfig.iconBackground}
      />
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Montserrat_500Medium',
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
