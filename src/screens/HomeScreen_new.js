import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { FAB, TabBar } from '../components';
import * as ImagePicker from 'expo-image-picker';

export const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [showImagePicker, setShowImagePicker] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(300)).current;

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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>SnapSell</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.premiumBadge}>
            <Ionicons name="crown" size={20} color="#FFD700" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarButton}>
            <Ionicons name="person-circle" size={40} color="#7C3AED" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Turn items into cash{'\n'}with AI magic</Text>
            <Text style={styles.heroSubtitle}>Snap a photo and let AI create your listing instantly</Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={handleOpenImagePicker}
            >
              <LinearGradient
                colors={['#7C3AED', '#FF6B35']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.exploreGradient}
              >
                <Text style={styles.exploreButtonText}>Start Selling</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={styles.heroImageContainer}>
            <Ionicons name="camera" size={80} color="rgba(255, 255, 255, 0.3)" />
          </View>
        </View>

        {/* Quick Actions */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsContainer}
        >
          <TouchableOpacity style={styles.quickActionItem} onPress={handleOpenImagePicker}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="camera-outline" size={24} color="#7C3AED" />
            </View>
            <Text style={styles.quickActionLabel}>Snap & Sell</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('My Listings')}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="list-outline" size={24} color="#7C3AED" />
            </View>
            <Text style={styles.quickActionLabel}>My Listings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="trending-up-outline" size={24} color="#7C3AED" />
            </View>
            <Text style={styles.quickActionLabel}>Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('Profile')}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="wallet-outline" size={24} color="#7C3AED" />
            </View>
            <Text style={styles.quickActionLabel}>Earnings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="settings-outline" size={24} color="#7C3AED" />
            </View>
            <Text style={styles.quickActionLabel}>Settings</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Sales Overview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sales Overview</Text>
        </View>

        {/* Stats Cards Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCardLarge}>
            <View style={styles.statCardIcon}>
              <Ionicons name="cash-outline" size={24} color="#000" />
            </View>
            <Text style={styles.statCardTitle}>Total Earnings</Text>
            <Text style={styles.statCardValue}>₱0</Text>
          </View>

          <View style={styles.statsRightColumn}>
            <View style={styles.statCardSmall}>
              <View style={styles.statCardIcon}>
                <Ionicons name="pricetag-outline" size={20} color="#000" />
              </View>
              <Text style={styles.statCardTitleSmall}>Active Listings</Text>
              <Text style={styles.statCardValueSmall}>0</Text>
            </View>

            <View style={styles.statCardSmall}>
              <View style={styles.statCardIcon}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#000" />
              </View>
              <Text style={styles.statCardTitleSmall}>Items Sold</Text>
              <Text style={styles.statCardValueSmall}>0</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('My Listings')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Cards */}
        <View style={styles.activityGrid}>
          <TouchableOpacity style={styles.activityCard}>
            <View style={styles.activityImagePlaceholder}>
              <Ionicons name="image-outline" size={40} color="#CCC" />
            </View>
            <View style={styles.activityOverlay}>
              <Text style={styles.activityLabel}>Latest Listing</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.activityCard}>
            <View style={[styles.activityImagePlaceholder, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="checkmark-circle" size={40} color="#4CAF50" />
            </View>
            <View style={styles.activityOverlay}>
              <Text style={styles.activityLabel}>Sold Items</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB onPress={handleOpenImagePicker} />

      {/* Bottom Navigation */}
      <TabBar navigation={navigation} activeTab="Home" />

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
    backgroundColor: '#FAFAFA' 
  },
  scrollView: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Montserrat_700Bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  premiumBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarButton: {
    width: 40,
    height: 40,
  },
  heroCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#7C3AED',
    borderRadius: 24,
    padding: 24,
    minHeight: 200,
    overflow: 'hidden',
    position: 'relative',
  },
  heroContent: {
    zIndex: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
    lineHeight: 32,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  exploreButton: {
    alignSelf: 'flex-start',
    borderRadius: 24,
    overflow: 'hidden',
  },
  exploreGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  exploreButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: 'Montserrat_700Bold',
  },
  heroImageContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  quickActionItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Montserrat_600SemiBold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Montserrat_700Bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B35',
    fontFamily: 'Montserrat_500Medium',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 28,
  },
  statCardLarge: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    minHeight: 200,
  },
  statsRightColumn: {
    flex: 1,
    gap: 12,
  },
  statCardSmall: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
  },
  statCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Montserrat_700Bold',
  },
  statCardTitleSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  statCardValueSmall: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Montserrat_700Bold',
  },
  activityGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  activityCard: {
    flex: 1,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  activityImagePlaceholder: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
    alignItems: 'center',
  },
  activityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    fontFamily: 'Montserrat_600SemiBold',
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
