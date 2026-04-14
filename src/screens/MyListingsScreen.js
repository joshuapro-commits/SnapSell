import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FAB, TabBar } from '../components';
import { useListings } from '../contexts/ListingsContext';
import { useAuth } from '../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';

export const MyListingsScreen = ({ navigation }) => {
  const { myListings, loading, deleteListing, refreshListings } = useListings();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Active');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const slideAnim = React.useRef(new Animated.Value(300)).current;
  const menuSlideAnim = React.useRef(new Animated.Value(300)).current;

  // Calculate counts dynamically
  const activeCount = myListings.filter(l => l.status === 'active' || !l.status).length;
  const soldCount = myListings.filter(l => l.status === 'sold').length;
  const draftCount = myListings.filter(l => l.status === 'draft').length;

  const tabs = [
    `Active (${activeCount})`, 
    `Sold (${soldCount})`, 
    `Drafts (${draftCount})`
  ];

  // Filter listings based on selected tab
  const filteredListings = myListings.filter(listing => {
    if (selectedTab === 'Active') return listing.status === 'active' || !listing.status;
    if (selectedTab === 'Sold') return listing.status === 'sold';
    if (selectedTab === 'Drafts') return listing.status === 'draft';
    return true;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshListings();
    setRefreshing(false);
  };

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

  const handleOpenMenu = (listing) => {
    setSelectedListing(listing);
    setShowMenuModal(true);
    Animated.spring(menuSlideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const handleCloseMenu = () => {
    Animated.timing(menuSlideAnim, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowMenuModal(false);
      setSelectedListing(null);
    });
  };

  const handleEditListing = () => {
    handleCloseMenu();
    setTimeout(() => {
      navigation.navigate('ListingEditor', { listing: selectedListing });
    }, 300);
  };

  const handleDeleteListing = () => {
    handleCloseMenu();
    setTimeout(() => {
      Alert.alert(
        'Delete Listing',
        `Are you sure you want to delete "${selectedListing.name}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteListing(selectedListing.id),
          },
        ]
      );
    }, 300);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderListingCard = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('ListingEditor', { listing: item })}
      activeOpacity={0.7}
    >
      <View style={styles.cardLeft}>
        <View style={styles.cardImageContainer}>
          {item.imageUri ? (
            <Image source={{ uri: item.imageUri }} style={styles.cardImage} />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <Ionicons name="image-outline" size={24} color="#CCC" />
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardPrice}>₱{item.price.toLocaleString()}</Text>
          
          {/* Platform Badges */}
          {(item.publishedPlatforms || item.selectedPlatforms) && (
            <View style={styles.platformBadges}>
              {(item.publishedPlatforms?.carousell || item.selectedPlatforms?.carousell) && (
                <View style={[styles.platformBadge, { backgroundColor: '#FFE8E8' }]}>
                  <Ionicons name="cart-outline" size={12} color="#D32F2F" />
                  <Text style={[styles.platformBadgeText, { color: '#D32F2F' }]}>Carousell</Text>
                </View>
              )}
              {(item.publishedPlatforms?.facebook || item.selectedPlatforms?.facebook) && (
                <View style={[styles.platformBadge, { backgroundColor: '#E8F0FE' }]}>
                  <Ionicons name="logo-facebook" size={12} color="#1877F2" />
                  <Text style={[styles.platformBadgeText, { color: '#1877F2' }]}>Facebook</Text>
                </View>
              )}
              {(item.publishedPlatforms?.shopee || item.selectedPlatforms?.shopee) && (
                <View style={[styles.platformBadge, { backgroundColor: '#FFF0ED' }]}>
                  <Ionicons name="bag-handle" size={12} color="#EE4D2D" />
                  <Text style={[styles.platformBadgeText, { color: '#EE4D2D' }]}>Shopee</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity 
        style={styles.cardMenu}
        onPress={() => handleOpenMenu(item)}
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>My Listings</Text>
        <Text style={styles.subtitle}>Manage your active, sold, and draft items effortlessly.</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                selectedTab === tab.split(' ')[0] && styles.tabActive
              ]}
              onPress={() => setSelectedTab(tab.split(' ')[0])}
            >
              <Text 
                style={[
                  styles.tabText,
                  selectedTab === tab.split(' ')[0] && styles.tabTextActive
                ]}
                numberOfLines={1}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Listings */}
      <FlatList
        data={filteredListings}
        keyExtractor={(item) => item.id}
        renderItem={renderListingCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#FF6B35"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={56} color="#CCCCCC" />
            <Text style={styles.emptyText}>No listings yet</Text>
            <Text style={styles.emptySubtext}>
              Start selling by taking a photo of your item
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Sell')}
            >
              <Text style={styles.emptyButtonText}>Create Listing</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating Action Button */}
      <FAB onPress={handleOpenImagePicker} />

      {/* Bottom Navigation */}
      <TabBar navigation={navigation} activeTab="My Listings" />

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

      {/* Menu Modal */}
      <Modal
        visible={showMenuModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseMenu}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={handleCloseMenu}
        >
          <Animated.View 
            style={[
              styles.menuModalContent,
              {
                transform: [{ translateY: menuSlideAnim }]
              }
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalHandle} />
              
              <Text style={styles.menuModalTitle}>Listing Options</Text>
              {selectedListing && (
                <Text style={styles.menuModalSubtitle}>{selectedListing.name}</Text>
              )}
              
              <View style={styles.menuOptionsContainer}>
                <TouchableOpacity 
                  style={styles.menuOptionButton}
                  onPress={handleEditListing}
                >
                  <View style={[styles.menuOptionIconContainer, { backgroundColor: '#F0F9FF' }]}>
                    <Ionicons name="pencil" size={24} color="#0EA5E9" />
                  </View>
                  <View style={styles.menuOptionTextContainer}>
                    <Text style={styles.menuOptionTitle}>Edit Listing</Text>
                    <Text style={styles.menuOptionDescription}>Update details and pricing</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuOptionButton}
                  onPress={handleDeleteListing}
                >
                  <View style={[styles.menuOptionIconContainer, { backgroundColor: '#FEF2F2' }]}>
                    <Ionicons name="trash" size={24} color="#EF4444" />
                  </View>
                  <View style={styles.menuOptionTextContainer}>
                    <Text style={[styles.menuOptionTitle, { color: '#EF4444' }]}>Delete Listing</Text>
                    <Text style={styles.menuOptionDescription}>Remove from marketplace</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCloseMenu}
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
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FAFAFA',
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
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Montserrat_700Bold',
  },
  subtitle: {
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
    fontFamily: 'Montserrat_400Regular',
  },
  tabContainer: {
    backgroundColor: '#FAFAFA',
    paddingVertical: 12,
  },
  tabContent: {
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: '#FF6B35',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Montserrat_600SemiBold',
  },
  tabTextActive: {
    color: '#FFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardImageContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#F5F5F5',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  cardPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 8,
  },
  platformBadges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  platformBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  cardMenu: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Montserrat_400Regular',
  },
  emptyButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#FF6B35',
    borderRadius: 24,
  },
  emptyButtonText: {
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
  menuModalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    minHeight: 320,
  },
  menuModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Montserrat_700Bold',
  },
  menuModalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 28,
    fontFamily: 'Montserrat_400Regular',
  },
  menuOptionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  menuOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuOptionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuOptionTextContainer: {
    flex: 1,
  },
  menuOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  menuOptionDescription: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Montserrat_400Regular',
  },
});
