import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useListings } from '../contexts/ListingsContext';
import { verificationService } from '../services/verification';
import { SellerVerificationBadge } from '../components/VerificationBadge';
import * as ImagePicker from 'expo-image-picker';

export const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { myListings, allListings } = useListings();
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [sellerScore, setSellerScore] = useState(null);
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  useEffect(() => {
    // Calculate seller verification score
    const calculateScore = async () => {
      const score = await verificationService.getSellerScore(user.id, allListings);
      setSellerScore(score);
    };
    calculateScore();
  }, [user.id, allListings]);

  const totalEarnings = myListings
    .filter(l => l.status === 'sold')
    .reduce((sum, l) => sum + (l.price || 0), 0);

  const handleOpenImagePicker = async () => {
    setShowImagePicker(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const handleCloseImagePicker = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowImagePicker(false);
    });
  };

  const handleTakePhoto = async () => {
    try {
      setShowImagePicker(false);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled) {
        navigation.navigate('AnalyzingScreen', { 
          imageUri: result.assets[0].uri 
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Camera is not available on iOS Simulator. Please use a physical device.');
    }
  };

  const handleUploadPhoto = async () => {
    try {
      setShowImagePicker(false);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled) {
        navigation.navigate('AnalyzingScreen', { 
          imageUri: result.assets[0].uri 
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to open photo library: ' + error.message);
    }
  };

  const menuItems = [
    {
      id: 'premium',
      icon: 'star',
      iconColor: '#FFB800',
      bgColor: '#FFF9E6',
      label: 'SnapSell Premium',
      description: 'Unlock unlimited listings',
      action: () => navigation.navigate('Paywall'),
    },
    {
      id: 'earnings',
      icon: 'stats-chart',
      iconColor: '#10B981',
      bgColor: '#E8F9F4',
      label: 'Track Your Earnings',
      description: 'View sales analytics',
      action: () => navigation.navigate('Earnings'),
    },
    {
      id: 'platforms',
      icon: 'link',
      iconColor: '#1877F2',
      bgColor: '#E7F3FF',
      label: 'Connected Platforms',
      description: 'Manage your integrations',
      action: () => navigation.navigate('ConnectPlatforms'),
    },
    {
      id: 'invite',
      icon: 'people',
      iconColor: '#EE4D2D',
      bgColor: '#FFF0ED',
      label: 'Invite Friends',
      description: 'Earn rewards together',
      action: () => {},
    },
    {
      id: 'settings',
      icon: 'settings-outline',
      iconColor: '#6F7787',
      bgColor: '#F5F5F5',
      label: 'Settings',
      description: 'Preferences and privacy',
      action: () => {},
    },
    {
      id: 'help',
      icon: 'help-circle-outline',
      iconColor: '#6F7787',
      bgColor: '#F5F5F5',
      label: 'Help Center',
      description: 'Get support',
      action: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="person-circle-outline" size={26} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={22} color="#6F7787" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          <Text style={styles.titleRegular}>Your </Text>
          <Text style={styles.titleBold}>Profile</Text>
          <Text style={styles.titleRegular}> & Settings</Text>
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>Listings</Text>
            <Text style={styles.statCount}>{myListings.length}</Text>
          </View>
          <View style={[styles.statPill, styles.statPillActive]}>
            <Text style={styles.statLabelActive}>Sold</Text>
            <Text style={styles.statCountActive}>{myListings.filter(l => l.status === 'sold').length}</Text>
          </View>
        </View>

        {/* Seller Verification Badge */}
        {sellerScore && (
          <View style={styles.sellerScoreCard}>
            <View style={styles.verificationHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#10B981" />
              <Text style={styles.verificationTitle}>Seller Trust Score</Text>
            </View>
            
            <SellerVerificationBadge sellerScore={sellerScore} size="large" />
            
            {sellerScore.level !== 'new' && (
              <>
                <Text style={styles.sellerScoreText}>
                  {sellerScore.verifiedListings} of {sellerScore.totalListings} listings verified
                </Text>
                <Text style={styles.verificationSubtitle}>
                  Verified by SnapSell AI
                </Text>
              </>
            )}
            
            {sellerScore.level === 'new' && (
              <Text style={styles.sellerScoreText}>
                Create your first verified listing to build trust
              </Text>
            )}
          </View>
        )}

        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuCard, { backgroundColor: item.bgColor }]}
              onPress={item.action}
            >
              <View style={styles.menuCardLeft}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name={item.icon} size={28} color={item.iconColor} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6F7787" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutCard}
          onPress={logout}
        >
          <View style={styles.menuCardLeft}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#FFE8E8' }]}>
              <Ionicons name="log-out-outline" size={28} color="#FF4444" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuLabel, { color: '#FF4444' }]}>Logout</Text>
              <Text style={styles.menuDescription}>Sign out of your account</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#FF4444" />
        </TouchableOpacity>

        <Text style={styles.footer}>v1.2.0 - BUILT FOR THE PINOY SELLER.</Text>
        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={showImagePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseImagePicker}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={handleCloseImagePicker}
        >
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalHandle} />
              
              <Text style={styles.modalTitle}>Add Product Photo</Text>
              <Text style={styles.modalSubtitle}>Choose how you'd like to add your product image</Text>
              
              <View style={styles.optionsContainer}>
                <TouchableOpacity 
                  style={styles.optionButton}
                  onPress={handleTakePhoto}
                >
                  <View style={[styles.optionIconContainer, { backgroundColor: '#F0F9FF' }]}>
                    <Ionicons name="camera" size={28} color="#0EA5E9" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Take a Picture</Text>
                    <Text style={styles.optionDescription}>Use your camera to capture the product</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.optionButton}
                  onPress={handleUploadPhoto}
                >
                  <View style={[styles.optionIconContainer, { backgroundColor: '#F0FDF4' }]}>
                    <Ionicons name="images" size={28} color="#10B981" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Upload Photo</Text>
                    <Text style={styles.optionDescription}>Choose from your photo library</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCloseImagePicker}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <TouchableOpacity 
        style={styles.fabButton}
        onPress={handleOpenImagePicker}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home-outline" size={20} color="#666" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('My Listings')}
        >
          <Ionicons name="list-outline" size={20} color="#666" />
          <Text style={styles.navLabel}>My Listings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={20} color="#000" />
          <Text style={styles.navLabelActive}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuButton: {
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
  title: {
    fontSize: 32,
    lineHeight: 40,
    marginBottom: 24,
    marginTop: 8,
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
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
  menuList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
  },
  menuCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#1A1D1F',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
    color: '#6F7787',
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 20,
    marginTop: 12,
    marginHorizontal: 20,
    backgroundColor: '#FFF',
  },
  footer: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 32,
    fontFamily: 'Montserrat_400Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    minHeight: 320,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 28,
    fontFamily: 'Montserrat_400Regular',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  optionDescription: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Montserrat_400Regular',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    fontFamily: 'Montserrat_600SemiBold',
  },
  fabButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    paddingBottom: 28,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  navLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  navLabelActive: {
    fontSize: 10,
    color: '#000',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  sellerScoreContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sellerScoreGradient: {
    padding: 24,
    alignItems: 'center',
  },
  sellerScoreCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  verificationTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    color: '#1A1D1F',
  },
  sellerScoreText: {
    fontSize: 13,
    fontFamily: 'Montserrat_500Medium',
    color: '#6F7787',
    marginTop: 8,
    textAlign: 'center',
  },
  verificationSubtitle: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
});
