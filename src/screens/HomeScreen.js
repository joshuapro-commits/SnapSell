import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useListings } from '../contexts/ListingsContext';
import { RelistBanner } from '../components/RelistBanner';
import { RelistModal } from '../components/RelistModal';
import { getRelistCount, getListingsNeedingRelist } from '../utils/relistHelper';
import { relistService } from '../services/relistService';
import * as ImagePicker from 'expo-image-picker';

export const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { myListings, allListings } = useListings();
  const [selectedFilter, setSelectedFilter] = React.useState('All');
  const [imagePickerVisible, setImagePickerVisible] = React.useState(false);
  const [showRelistModal, setShowRelistModal] = React.useState(false);
  const [relistingListing, setRelistingListing] = React.useState(null);
  const slideAnim = React.useRef(new Animated.Value(300)).current;
  
  // Calculate relist count for active listings
  const relistCount = React.useMemo(() => 
    getRelistCount(myListings.filter(l => l.status === 'active' || !l.status)),
    [myListings]
  );

  // Real-time statistics - based on MY listings only
  const totalListings = React.useMemo(() => myListings.length, [myListings]);
  const activeListings = React.useMemo(() => 
    myListings.filter(l => l.status === 'active').length, 
    [myListings]
  );
  const soldListings = React.useMemo(() => 
    myListings.filter(l => l.status === 'sold').length, 
    [myListings]
  );
  const totalEarnings = React.useMemo(() => 
    myListings.filter(l => l.status === 'sold').reduce((sum, l) => sum + (l.price || 0), 0),
    [myListings]
  );

  const templates = [
    {
      id: '1',
      title: 'Just take a photo',
      description: 'Snap a picture of your item and let AI analyze it. Get instant product details, descriptions, and smart pricing suggestions.',
      icon: 'camera',
      iconBg: '#E8F4FD',
      iconColor: '#1E88E5',
      used: totalListings,
      action: 'modal',
    },
    {
      id: '2',
      title: 'Track your listings',
      description: 'Monitor all your active and sold items in one place. Edit details, update prices, and manage your inventory effortlessly.',
      icon: 'list',
      iconBg: '#FFF3E0',
      iconColor: '#FB8C00',
      used: activeListings,
      action: 'Earnings',
    },
    {
      id: '3',
      title: 'Publish anywhere',
      description: 'Cross-post to Carousell, Facebook Marketplace, and Shopee simultaneously. Reach more buyers with one tap.',
      icon: 'share-social',
      iconBg: '#F3E5F5',
      iconColor: '#8E24AA',
      used: soldListings,
      action: 'ConnectPlatforms',
    },
  ];

  const handleFABPress = () => {
    setImagePickerVisible(true);
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
      setImagePickerVisible(false);
    });
  };

  const handleTakePicture = () => {
    // Close modal first, then navigate
    handleCloseImagePicker();
    
    // Small delay to ensure modal closes before navigation
    setTimeout(() => {
      navigation.navigate('Sell');
    }, 300);
  };

  const handleUploadPhoto = async () => {
    try {
      // 1. Request permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your photos to upload.');
        return;
      }

      // 2. Launch picker FIRST (while modal is still visible)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      // 3. Close modal AFTER picker interaction is done
      handleCloseImagePicker();

      // 4. Navigate if image was selected
      if (!result.canceled) {
        navigation.navigate('AnalyzingScreen', { imageUri: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      handleCloseImagePicker();
    }
  };
  
  // Relist handlers
  const handleRelistAll = async () => {
    const listingsToRelist = getListingsNeedingRelist(myListings.filter(l => l.status === 'active' || !l.status));
    
    if (listingsToRelist.length === 0) {
      Alert.alert('No Listings', 'No listings need relisting at this time.');
      return;
    }
    
    Alert.alert(
      'Relist All Listings',
      `Relist ${listingsToRelist.length} listing${listingsToRelist.length > 1 ? 's' : ''}? This will push them back to the top of search results.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'View Listings',
          onPress: () => navigation.navigate('MyListings'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <View style={styles.menuButtonInner}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search-outline" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Relist Banner - Show if there are listings needing relist */}
        {relistCount > 0 && (
          <RelistBanner 
            count={relistCount}
            onRelistAll={handleRelistAll}
          />
        )}
        
        <View style={styles.content}>
          <Text style={styles.title}>
            Start <Text style={styles.titleBold}>Selling</Text> in{' \n'}
            Minutes <Text style={styles.titleBold}>with AI-{' \n'}
            Powered</Text> Listings
          </Text>

          <View style={styles.filterContainer}>
            <TouchableOpacity 
              style={[styles.filterChip, selectedFilter === 'All' && styles.filterChipActive]}
              onPress={() => setSelectedFilter('All')}
            >
              <Text style={[styles.filterText, selectedFilter === 'All' && styles.filterTextActive]}>
                All {totalListings}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterChip, selectedFilter === 'Active' && styles.filterChipActive]}
              onPress={() => setSelectedFilter('Active')}
            >
              <Text style={[styles.filterText, selectedFilter === 'Active' && styles.filterTextActive]}>
                Active {activeListings}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterChip, selectedFilter === 'Sold' && styles.filterChipActive]}
              onPress={() => setSelectedFilter('Sold')}
            >
              <Text style={[styles.filterText, selectedFilter === 'Sold' && styles.filterTextActive]}>
                Sold {soldListings}
              </Text>
            </TouchableOpacity>
          </View>

          {templates.map((template) => (
            <TouchableOpacity 
              key={template.id} 
              style={styles.templateCard}
              onPress={() => {
                if (template.action === 'modal') {
                  handleFABPress();
                } else {
                  navigation.navigate(template.action);
                }
              }}
            >
              <View style={styles.templateIcons}>
                <View style={[styles.iconCircle, { backgroundColor: template.iconBg }]}>
                  <Ionicons name={template.icon} size={28} color={template.iconColor} />
                </View>
              </View>
              <View style={styles.templateContent}>
                <Text style={styles.templateTitle}>{template.title}</Text>
                <Text style={styles.templateDescription}>{template.description}</Text>
                <View style={styles.templateFooter}>
                  <View style={styles.usedBadge}>
                    <Text style={styles.usedText}>Used {template.used}</Text>
                  </View>
                  <View style={styles.startButton}>
                    <Text style={styles.startButtonText}>Start</Text>
                    <Ionicons name="play" size={14} color="#000" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* Image Picker Modal */}
      <Modal
        visible={imagePickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseImagePicker}
      >
        <TouchableOpacity 
          style={styles.imagePickerOverlay}
          activeOpacity={1}
          onPress={handleCloseImagePicker}
        >
          <TouchableOpacity activeOpacity={1}>
            <Animated.View 
              style={[
                styles.imagePickerSheet,
                {
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.sheetHandle} />
            
            <Text style={styles.sheetTitle}>Add Product Photo</Text>
            <Text style={styles.sheetSubtitle}>Choose how you'd like to add your product image</Text>
            
            <View style={styles.optionsContainer}>
                <TouchableOpacity 
                  style={styles.optionButton}
                  onPress={handleTakePicture}
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
            </Animated.View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* FAB Button */}
      <TouchableOpacity 
        style={styles.fabButton}
        onPress={handleFABPress}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F5F5F5',
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonInner: {
    gap: 4,
  },
  menuLine: {
    width: 20,
    height: 2,
    backgroundColor: '#FFF',
    borderRadius: 1,
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
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    lineHeight: 42,
    color: '#000',
    marginTop: 8,
    marginBottom: 24,
    fontFamily: 'Montserrat_400Regular',
  },
  titleBold: {
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
  },
  filterChipActive: {
    backgroundColor: '#1A1A1A',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'Montserrat_500Medium',
  },
  filterTextActive: {
    color: '#FFF',
  },
  templateCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  templateIcons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateContent: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  templateDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#666',
    marginBottom: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  templateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usedBadge: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  usedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'Montserrat_500Medium',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Montserrat_600SemiBold',
  },
  fabButton: {
    position: 'absolute',
    bottom: 110,
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
  },
  imagePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  imagePickerSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    minHeight: 320,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  sheetSubtitle: {
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
