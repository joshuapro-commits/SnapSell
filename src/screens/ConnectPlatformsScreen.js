import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { platformService } from '../services/platforms';

export const ConnectPlatformsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [connectedPlatforms, setConnectedPlatforms] = useState({
    facebook: false,
    shopee: false,
    carousell: false,
  });
  const [platformData, setPlatformData] = useState({
    facebook: null,
    shopee: null,
    carousell: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadConnectedPlatforms();
    });
    return unsubscribe;
  }, [navigation]);

  const loadConnectedPlatforms = async () => {
    try {
      const tokens = await platformService.getPlatformTokens(user.id);
      const platforms = {
        facebook: tokens.facebook?.connected || false,
        shopee: tokens.shopee?.connected || false,
        carousell: tokens.carousell?.connected || false,
      };
      setConnectedPlatforms(platforms);
      setPlatformData({
        facebook: tokens.facebook,
        shopee: tokens.shopee,
        carousell: tokens.carousell,
      });
    } catch (error) {
      console.error('Error loading platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform) => {
    if (platform === 'facebook') {
      navigation.navigate('FacebookUnifiedWebView', {
        mode: 'login',
        userId: user.id,
      });
    } else {
      navigation.goBack();
    }
  };

  const handleDisconnect = async (platform) => {
    Alert.alert(
      'Disconnect Platform',
      `Are you sure you want to disconnect ${platform.charAt(0).toUpperCase() + platform.slice(1)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await platformService.disconnectPlatform(user.id, platform);
              if (result.success) {
                setConnectedPlatforms({ ...connectedPlatforms, [platform]: false });
                Alert.alert('Disconnected', `${platform.charAt(0).toUpperCase() + platform.slice(1)} has been disconnected.`);
              } else {
                Alert.alert('Error', result.error || 'Failed to disconnect');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to disconnect platform');
            }
          },
        },
      ]
    );
  };

  const platforms = [
    {
      id: 'facebook',
      name: 'Facebook Marketplace',
      icon: 'logo-facebook',
      color: '#1877F2',
      bgColor: '#E7F3FF',
      description: 'Reach millions of local buyers. List your items and connect with your community instantly.',
    },
    {
      id: 'shopee',
      name: 'Shopee',
      icon: 'bag-handle',
      color: '#EE4D2D',
      bgColor: '#FFF0ED',
      description: 'Tap into Southeast Asia\'s largest marketplace. Sell to millions across the region.',
    },
    {
      id: 'carousell',
      name: 'Carousell',
      icon: 'cart-outline',
      color: '#D32F2F',
      bgColor: '#FFE8E8',
      description: 'Join the trusted classifieds community. Quick listings, fast sales, local deals.',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={22} color="#6F7787" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          <Text style={styles.titleRegular}>Connect Your </Text>
          <Text style={styles.titleBold}>Selling Platforms</Text>
          <Text style={styles.titleRegular}> in Minutes</Text>
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>All</Text>
            <Text style={styles.statCount}>3</Text>
          </View>
          <View style={[styles.statPill, styles.statPillActive]}>
            <Text style={styles.statLabelActive}>Connected</Text>
            <Text style={styles.statCountActive}>
              {Object.values(connectedPlatforms).filter(Boolean).length}
            </Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>Available</Text>
            <Text style={styles.statCount}>
              {3 - Object.values(connectedPlatforms).filter(Boolean).length}
            </Text>
          </View>
        </View>

        <View style={styles.platformsList}>
          {platforms.map((platform) => (
            <View key={platform.id} style={[styles.platformCard, { backgroundColor: platform.bgColor }]}>
              <View style={styles.platformIcons}>
                <View style={styles.mainIconContainer}>
                  <Ionicons name={platform.icon} size={32} color={platform.color} />
                </View>
              </View>

              <View style={styles.platformContent}>
                <Text style={styles.platformName}>{platform.name}</Text>
                <Text style={styles.platformDescription}>{platform.description}</Text>

                <View style={styles.platformFooter}>
                  {connectedPlatforms[platform.id] ? (
                    <View style={styles.connectedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.connectedBadgeText}>Connected</Text>
                    </View>
                  ) : (
                    <View style={styles.usageBadge}>
                      <Text style={styles.usageText}>Ready to connect</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => 
                      connectedPlatforms[platform.id] 
                        ? handleDisconnect(platform.id)
                        : handleConnect(platform.id)
                    }
                  >
                    <Text style={styles.actionButtonText}>
                      {connectedPlatforms[platform.id] ? 'Disconnect' : 'Connect'}
                    </Text>
                    <Ionicons 
                      name={connectedPlatforms[platform.id] ? 'close' : 'arrow-forward'} 
                      size={18} 
                      color="#1A1D1F" 
                    />
                  </TouchableOpacity>
                </View>

                {connectedPlatforms[platform.id] && platformData[platform.id]?.userName && (
                  <View style={styles.userInfo}>
                    <Text style={styles.userInfoText}>
                      Connected as {platformData[platform.id].userName}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1D1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    marginBottom: 24,
    marginTop: 8,
  },
  titleRegular: {
    fontFamily: 'Montserrat_400Regular',
    color: '#1A1D1F',
  },
  titleBold: {
    fontFamily: 'Montserrat_700Bold',
    color: '#1A1D1F',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#E8EAED',
  },
  statPillActive: {
    backgroundColor: '#1A1D1F',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#6F7787',
  },
  statLabelActive: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#FFF',
  },
  statCount: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#1A1D1F',
  },
  statCountActive: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#FFF',
  },
  platformsList: {
    gap: 16,
  },
  platformCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
  },
  platformIcons: {
    flexDirection: 'row',
    gap: -12,
    marginBottom: 20,
  },
  mainIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  platformContent: {
    gap: 12,
  },
  platformName: {
    fontSize: 22,
    fontFamily: 'Montserrat_700Bold',
    color: '#1A1D1F',
    marginBottom: 4,
  },
  platformDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Montserrat_400Regular',
    color: '#6F7787',
    marginBottom: 8,
  },
  platformFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  connectedBadgeText: {
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#10B981',
  },
  usageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  usageText: {
    fontSize: 13,
    fontFamily: 'Montserrat_500Medium',
    color: '#6F7787',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#1A1D1F',
  },
  userInfo: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  userInfoText: {
    fontSize: 13,
    fontFamily: 'Montserrat_500Medium',
    color: '#6F7787',
  },
  bottomPadding: {
    height: 40,
  },
});
