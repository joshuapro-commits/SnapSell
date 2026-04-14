import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useListings } from '../contexts/ListingsContext';
import { FAB, TabBar } from '../components';
import * as ImagePicker from 'expo-image-picker';

export const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { myListings } = useListings();
  const [showImagePicker, setShowImagePicker] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  const monthlyData = [
    { month: 'JAN', amount: 0 },
    { month: 'FEB', amount: 0 },
    { month: 'MAR', amount: 0 },
    { month: 'APR', amount: 0 },
    { month: 'MAY', amount: 0 },
    { month: 'JUN', amount: 0 },
  ];

  const maxAmount = 1000; // Default max for empty chart

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
      {/* Earnings Summary */}
      <View style={styles.earningsSection}>
        <Text style={styles.earningsTitle}>Earnings</Text>
        <Text style={styles.earningsSubtitle}>Track your sales performance and revenue growth.</Text>
        
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>₱0</Text>
          <View style={styles.percentageContainer}>
            <Ionicons name="trending-up" size={14} color="#00D9A5" />
            <Text style={styles.percentageText}>+0%</Text>
          </View>
        </View>
        <View style={styles.chartContainer}>
          {monthlyData.map((item, index) => (
            <View key={index} style={styles.chartColumn}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar,
                    { 
                      height: `${(item.amount / maxAmount) * 100}%`,
                      backgroundColor: item.month === 'MAR' ? '#FF6B35' : '#E0E0E0'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.monthLabel}>{item.month}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Premium Card */}
      <TouchableOpacity 
        style={styles.premiumCardWrapper}
        onPress={() => navigation.navigate('Paywall')}
      >
        <LinearGradient
          colors={['#7C3AED', '#FF6B35']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.premiumCard}
        >
          <View style={styles.premiumContent}>
            <Text style={styles.premiumTitle}>SnapSell Premium</Text>
            <Text style={styles.premiumSubtitle}>Boost your sales with{"\n"}Unlimited listings & AI Pro{"\n"}selling tools.</Text>
            <View style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </View>
          </View>
          <View style={styles.premiumDecoration}>
            <View style={[styles.star, { top: 20, right: 30 }]} />
            <View style={[styles.star, { top: 60, right: 20 }]} />
            <View style={[styles.star, { bottom: 40, right: 40 }]} />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: '#E8F9F4' }]}>
              <Ionicons name="people" size={20} color="#00D9A5" />
            </View>
            <Text style={styles.menuItemText}>Invite Friends</Text>
          </View>
          <View style={styles.menuItemRight}>
            <Text style={styles.rewardText}>Get ₱0</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: '#F5F5F5' }]}>
              <Ionicons name="settings-outline" size={20} color="#666" />
            </View>
            <Text style={styles.menuItemText}>Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ConnectPlatforms')}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: '#FFF0E8' }]}>
              <Ionicons name="link-outline" size={20} color="#FF6B35" />
            </View>
            <Text style={styles.menuItemText}>Connected Platforms</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: '#F5F5F5' }]}>
              <Ionicons name="help-circle-outline" size={20} color="#666" />
            </View>
            <Text style={styles.menuItemText}>Help Center</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={logout}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: '#FFE8E8' }]}>
              <Ionicons name="log-out-outline" size={20} color="#FF4444" />
            </View>
            <Text style={[styles.menuItemText, { color: '#FF4444' }]}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>v1.2.0 - BUILT FOR THE PINOY SELLER.</Text>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB onPress={handleOpenImagePicker} />

      {/* Bottom Navigation */}
      <TabBar navigation={navigation} activeTab="Profile" />

      {/* Image Picker Modal */}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFF',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B35',
    fontFamily: 'Montserrat_700Bold',
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFF',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: [{ translateX: -50 }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Montserrat_700Bold',
  },
  userHandle: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
  earningsSection: {
    backgroundColor: 'transparent',
    marginTop: 0,
    marginHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  earningsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Montserrat_700Bold',
  },
  earningsSubtitle: {
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
    marginBottom: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  earningsPeriod: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
  balanceContainer: {
    marginBottom: 20,
    marginTop: 8,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00D9A5',
    fontFamily: 'Montserrat_600SemiBold',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingHorizontal: 8,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  barContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 24,
    borderRadius: 6,
  },
  monthLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  premiumCardWrapper: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  premiumCard: {
    padding: 24,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  premiumContent: {
    zIndex: 1,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  premiumSubtitle: {
    fontSize: 13,
    color: '#FFF',
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.9,
    fontFamily: 'Montserrat_400Regular',
  },
  upgradeButton: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7C3AED',
    fontFamily: 'Montserrat_700Bold',
  },
  premiumDecoration: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '40%',
  },
  star: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ rotate: '45deg' }],
    borderRadius: 6,
  },
  menuSection: {
    backgroundColor: 'transparent',
    marginTop: 16,
    marginHorizontal: 16,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Montserrat_600SemiBold',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6B35',
    fontFamily: 'Montserrat_700Bold',
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
});
