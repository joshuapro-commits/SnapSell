import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Modal, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useAuth } from '../contexts/AuthContext';
import { useListings } from '../contexts/ListingsContext';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Circle, Path, Rect, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

export const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { myListings } = useListings();
  const userName = user?.name?.split(' ')[0] || 'User';
  const floatAnim = React.useRef(new Animated.Value(0)).current;
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [selectedListing, setSelectedListing] = React.useState(null);
  const [imagePickerVisible, setImagePickerVisible] = React.useState(false);
  const slideAnim = React.useRef(new Animated.Value(300)).current;
  
  // Card animations
  const card1Anim = React.useRef(new Animated.Value(0)).current;
  const card2Anim = React.useRef(new Animated.Value(0)).current;
  const card3Anim = React.useRef(new Animated.Value(0)).current;
  const card4Anim = React.useRef(new Animated.Value(0)).current;

  // Get 3 most recent listings
  const recentListings = myListings.slice(0, 3);

  // Calculate stats
  const activeListingsCount = myListings.filter(l => l.status === 'active' || !l.status).length;
  const soldListingsCount = myListings.filter(l => l.status === 'sold').length;
  const totalEarnings = myListings
    .filter(l => l.status === 'sold')
    .reduce((sum, l) => sum + (l.price || 0), 0);

  const handleMenuPress = (listingId) => {
    setSelectedListing(listingId);
    setMenuVisible(true);
  };

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

  const handleTakePicture = async () => {
    setImagePickerVisible(false);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      navigation.navigate('AnalyzingScreen', { imageUri: result.assets[0].uri });
    }
  };

  const handleUploadPhoto = async () => {
    setImagePickerVisible(false);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      navigation.navigate('AnalyzingScreen', { imageUri: result.assets[0].uri });
    }
  };

  const handleEdit = () => {
    setMenuVisible(false);
    // Navigate to edit screen
    Alert.alert('Edit', 'Edit functionality coming soon');
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          Alert.alert('Deleted', 'Listing has been deleted');
        }}
      ]
    );
  };

  React.useEffect(() => {
    // Float animation for vase icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Staggered card animations
    Animated.stagger(100, [
      Animated.spring(card1Anim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(card2Anim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(card3Anim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(card4Anim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  // Card animation interpolations
  const card1Transform = {
    opacity: card1Anim,
    transform: [
      {
        translateX: card1Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-50, 0],
        }),
      },
      {
        scale: card1Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
  };

  const card2Transform = {
    opacity: card2Anim,
    transform: [
      {
        translateX: card2Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
      {
        scale: card2Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
  };

  const card3Transform = {
    opacity: card3Anim,
    transform: [
      {
        translateX: card3Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
      {
        scale: card3Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
  };

  const card4Transform = {
    opacity: card4Anim,
    transform: [
      {
        translateX: card4Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
      {
        scale: card4Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarButton}>
            <Ionicons name="person-circle-outline" size={24} color="#000" />
          </View>
          <Text style={styles.appName}>Snapsell</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Title */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.mainTitle}>Ready to sell </Text>
            <MaskedView
              maskElement={<Text style={styles.mainTitle}>something</Text>}
            >
              <LinearGradient
                colors={['#D493FF', '#7704F4', '#FD7B3B']}
                locations={[0, 0.3, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.mainTitle, { opacity: 0 }]}>something</Text>
              </LinearGradient>
            </MaskedView>
          </View>
          <MaskedView
            maskElement={<Text style={styles.mainTitle}>today?</Text>}
          >
            <LinearGradient
              colors={['#D493FF', '#7704F4', '#FD7B3B']}
              locations={[0, 0.3, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.mainTitle, { opacity: 0 }]}>today?</Text>
            </LinearGradient>
          </MaskedView>
        </View>

        {/* Reminder Card */}
        <View style={styles.reminderCardWrapper}>
          <LinearGradient
            colors={['#D493FF', '#7704F4', '#FD7B3B']}
            locations={[0, 0.3, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.reminderCard}
          >
            <View style={styles.reminderContent}>
              <View style={styles.reminderTextContainer}>
                <Text style={styles.reminderTitle}>Turn clutter into cash</Text>
                <Text style={styles.reminderSubtitle}>Just snap a photo of your item and the AI will do the rest.</Text>
                <TouchableOpacity 
                  style={styles.setNowButton}
                  onPress={handleFABPress}
                >
                  <View style={styles.setNowButtonWhite}>
                    <Ionicons name="camera" size={16} color="#7704F4" />
                    <Text style={styles.setNowButtonText}>Sell Now</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.bellIconContainer}>
                <View style={styles.vaseIconWrapper}>
                  <Ionicons name="wine-outline" size={60} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Cards Grid */}
        <View style={styles.statsGrid}>
          {/* Left Card - Total Earnings */}
          <Animated.View style={[styles.statCardLarge, card1Transform]}>
            <Text style={styles.statCardTitle}>Total Earnings</Text>
            <Text style={styles.statCardValue}>₱{totalEarnings.toLocaleString()}</Text>
          </Animated.View>

          {/* Right Cards Stack */}
          <View style={styles.statsRightColumn}>
            {/* Active Listings */}
            <Animated.View style={[styles.statCardSmall, card2Transform]}>
              <Text style={styles.statCardTitleSmall}>Active Listings</Text>
              <Text style={styles.statCardValueSmall}>{activeListingsCount}</Text>
            </Animated.View>

            {/* Items Sold */}
            <Animated.View style={[styles.statCardSmall, card3Transform]}>
              <Text style={styles.statCardTitleSmall}>Items Sold</Text>
              <Text style={styles.statCardValueSmall}>{soldListingsCount}</Text>
            </Animated.View>
          </View>
        </View>

        {/* Recent Listings Section */}
        <Animated.View style={[styles.recentListingsSection, card4Transform]}>
          <View style={styles.recentListingsHeader}>
            <Text style={styles.recentListingsTitle}>Recent Listings</Text>
            <TouchableOpacity onPress={() => navigation.navigate('My Listings')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {recentListings.length > 0 ? (
            recentListings.map((item) => (
              <TouchableOpacity 
                key={item.id}
                style={styles.listingItem}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ListingEditor', { listing: item })}
              >
                <View style={styles.listingLeft}>
                  <View style={styles.listingImageContainer}>
                    {item.imageUri ? (
                      <Image source={{ uri: item.imageUri }} style={styles.listingImage} />
                    ) : (
                      <View style={[styles.listingIconCircle, { backgroundColor: '#FFE8D6' }]}>
                        <Ionicons name="image-outline" size={20} color="#FF8C42" />
                      </View>
                    )}
                  </View>
                  <View style={styles.listingTextContainer}>
                    <Text style={styles.listingItemTitle} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.listingPrice}>₱{item.price?.toLocaleString()}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.menuButton} onPress={() => handleMenuPress(item.id)}>
                  <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyListingsContainer}>
              <Ionicons name="cube-outline" size={48} color="#CCCCCC" />
              <Text style={styles.emptyListingsText}>No listings yet</Text>
              <Text style={styles.emptyListingsSubtext}>
                Start selling by taking a photo of your item
              </Text>
            </View>
          )}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuModal}>
            <TouchableOpacity style={styles.menuOption} onPress={handleEdit}>
              <Ionicons name="create-outline" size={22} color="#000" />
              <Text style={styles.menuOptionText}>Edit Listing</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuOption} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={22} color="#FF3B30" />
              <Text style={[styles.menuOptionText, { color: '#FF3B30' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
          <Animated.View 
            style={[
              styles.imagePickerSheet,
              {
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
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
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* FAB Button */}
      <TouchableOpacity 
        style={styles.fabButton}
        onPress={handleFABPress}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={20} color="#000" />
          <Text style={styles.navLabelActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('My Listings')}
        >
          <Ionicons name="list-outline" size={20} color="#666" />
          <Text style={styles.navLabel}>My Listings</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={20} color="#666" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Montserrat_600SemiBold',
  },
  notificationButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '400',
    color: '#000',
    lineHeight: 36,
    fontFamily: 'Montserrat_400Regular',
  },
  boldText: {
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
  reminderCardWrapper: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  reminderCard: {
    borderRadius: 20,
    padding: 24,
    paddingVertical: 28,
  },
  reminderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderTextContainer: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 6,
    fontFamily: 'Montserrat_700Bold',
  },
  reminderSubtitle: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 2,
    fontFamily: 'Montserrat_400Regular',
  },
  setNowButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  setNowButtonWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  setNowButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7704F4',
    fontFamily: 'Montserrat_600SemiBold',
  },
  bellIconContainer: {
    marginLeft: 0,
  },
  vaseIconWrapper: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCardLarge: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    minHeight: 200,
    justifyContent: 'center',
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
    justifyContent: 'center',
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
  emptyListingsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
  },
  emptyListingsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  emptyListingsSubtext: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },

  recentListingsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  recentListingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentListingsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Montserrat_600SemiBold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF8C42',
    fontFamily: 'Montserrat_500Medium',
  },
  listingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  listingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listingImageContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#F5F5F5',
  },
  listingIconCircle: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  listingTextContainer: {
    flex: 1,
  },
  listingItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  listingPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Montserrat_600SemiBold',
  },
  menuButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModal: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: 240,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  menuOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    fontFamily: 'Montserrat_500Medium',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
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
});
