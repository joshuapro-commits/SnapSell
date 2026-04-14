import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import * as ImagePicker from 'expo-image-picker';

export const ListingSuccessScreen = ({ navigation, route }) => {
  const { productName, selectedPlatforms, publishResults } = route.params || {};
  const animationRef = useRef(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;

  const publishedToCarousell = selectedPlatforms?.carousell && publishResults?.carousell?.success;
  const publishedToFacebook = selectedPlatforms?.facebook && publishResults?.facebook?.success;
  const publishedToShopee = selectedPlatforms?.shopee && publishResults?.shopee?.success;
  const hasErrors = publishResults?.errors && publishResults.errors.length > 0;

  useEffect(() => {
    animationRef.current?.play();
  }, []);

  useEffect(() => {
    if (showImagePicker) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [showImagePicker]);

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
    handleCloseImagePicker();
    await new Promise(resolve => setTimeout(resolve, 300));
    navigation.navigate('Camera');
  };

  const handleUploadPhoto = async () => {
    handleCloseImagePicker();
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled) {
        navigation.navigate('AnalyzingScreen', { imageUri: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open photo library');
    }
  };

  return (
    <View style={styles.container}>
      {/* Decorative shapes */}
      <View style={[styles.shape, styles.shape1]} />
      <View style={[styles.shape, styles.shape2]} />
      <View style={[styles.shape, styles.shape3]} />
      <View style={[styles.shape, styles.shape4]} />

      {/* Success Animation */}
      <View style={styles.iconContainer}>
        <LottieView
          ref={animationRef}
          source={require('../../assets/Success.json')}
          autoPlay
          loop={false}
          style={styles.lottieAnimation}
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Item Listed!</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Your item is now live on{' '}
        {publishedToCarousell && publishedToFacebook && publishedToShopee && (
          <Text style={styles.bold}>Carousell, Facebook & Shopee</Text>
        )}
        {publishedToCarousell && publishedToFacebook && !publishedToShopee && (
          <Text style={styles.bold}>Carousell & Facebook</Text>
        )}
        {publishedToCarousell && !publishedToFacebook && publishedToShopee && (
          <Text style={styles.bold}>Carousell & Shopee</Text>
        )}
        {!publishedToCarousell && publishedToFacebook && publishedToShopee && (
          <Text style={styles.bold}>Facebook & Shopee</Text>
        )}
        {publishedToCarousell && !publishedToFacebook && !publishedToShopee && (
          <Text style={styles.bold}>Carousell</Text>
        )}
        {!publishedToCarousell && publishedToFacebook && !publishedToShopee && (
          <Text style={styles.bold}>Facebook Marketplace</Text>
        )}
        {!publishedToCarousell && !publishedToFacebook && publishedToShopee && (
          <Text style={styles.bold}>Shopee</Text>
        )}
        .{' '}Good luck with the sale!
      </Text>

      {hasErrors && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={20} color="#FF6B35" />
          <Text style={styles.errorText}>
            Some platforms failed to publish. Check details below.
          </Text>
        </View>
      )}

      {/* Platform Cards */}
      <View style={styles.platformCards}>
        {publishedToFacebook && (
          <TouchableOpacity 
            style={styles.platformCard}
            onPress={async () => {
              const url = publishResults?.facebook?.listingUrl;
              console.log('Facebook listing URL:', url);
              
              if (url) {
                // Try to open the exact listing URL
                try {
                  const canOpen = await Linking.canOpenURL(url);
                  if (canOpen) {
                    await Linking.openURL(url);
                    return;
                  }
                } catch (err) {
                  console.log('Failed to open listing URL:', err);
                }
              }
              
              // Fallback to selling page
              const fallbackUrl = 'https://m.facebook.com/marketplace/you/selling';
              try {
                await Linking.openURL(fallbackUrl);
              } catch (err) {
                Alert.alert('Error', 'Could not open Facebook. Please check your Facebook app or browser.');
              }
            }}
          >
            <View style={styles.platformIconCircle}>
              <Ionicons name="logo-facebook" size={24} color="#1877F2" />
            </View>
            <View style={styles.platformTextContainer}>
              <View style={styles.platformHeader}>
                <Text style={styles.platformLabel}>FACEBOOK MARKETPLACE</Text>
                <View style={styles.successBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text style={styles.successText}>Published</Text>
                </View>
              </View>
              <Text style={styles.platformName}>View Your Listings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        )}

        {publishedToCarousell && (
          <TouchableOpacity 
            style={styles.platformCard}
            onPress={() => {
              const url = publishResults?.carousell?.listingUrl || 'https://www.carousell.ph/sell/';
              Linking.openURL(url).catch(() => {
                Alert.alert('Error', 'Could not open Carousell');
              });
            }}
          >
            <View style={[styles.platformIconCircle, { backgroundColor: '#FFE8E8' }]}>
              <Ionicons name="cart-outline" size={24} color="#D32F2F" />
            </View>
            <View style={styles.platformTextContainer}>
              <View style={styles.platformHeader}>
                <Text style={styles.platformLabel}>CAROUSELL</Text>
                <View style={styles.successBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text style={styles.successText}>Published</Text>
                </View>
              </View>
              <Text style={styles.platformName}>View Post on Carousell</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        )}

        {publishedToShopee && (
          <TouchableOpacity 
            style={styles.platformCard}
            onPress={() => {
              const url = publishResults?.shopee?.listingUrl || 'https://seller.shopee.ph/portal/product/list/all';
              Linking.openURL(url).catch(() => {
                Alert.alert('Error', 'Could not open Shopee');
              });
            }}
          >
            <View style={[styles.platformIconCircle, { backgroundColor: '#FFF0ED' }]}>
              <Ionicons name="bag-handle" size={24} color="#EE4D2D" />
            </View>
            <View style={styles.platformTextContainer}>
              <View style={styles.platformHeader}>
                <Text style={styles.platformLabel}>SHOPEE</Text>
                <View style={styles.successBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text style={styles.successText}>Published</Text>
                </View>
              </View>
              <Text style={styles.platformName}>View Post on Shopee</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        )}

        {hasErrors && publishResults.errors.map((error, index) => (
          <View key={index} style={[styles.platformCard, styles.platformCardError]}>
            <View style={[styles.platformIconCircle, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="close-circle" size={24} color="#EF4444" />
            </View>
            <View style={styles.platformTextContainer}>
              <View style={styles.platformHeader}>
                <Text style={styles.platformLabel}>{error.platform.toUpperCase()}</Text>
                <View style={styles.errorBadgeSmall}>
                  <Ionicons name="alert-circle" size={14} color="#EF4444" />
                  <Text style={styles.errorTextSmall}>Failed</Text>
                </View>
              </View>
              <Text style={styles.platformErrorText}>{error.error}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.listAnotherButton}
          onPress={() => setShowImagePicker(true)}
        >
          <LinearGradient
            colors={['#7C3AED', '#FF6B35']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.listAnotherText}>List Another Item</Text>
            <Ionicons name="add-circle" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.dashboardButton}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        >
          <Text style={styles.dashboardText}>Go to Dashboard</Text>
          <Ionicons name="grid" size={16} color="#666" />
        </TouchableOpacity>
      </View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  shape: {
    position: 'absolute',
    borderRadius: 8,
    opacity: 0.3,
  },
  shape1: {
    width: 40,
    height: 40,
    backgroundColor: '#D4A574',
    top: 40,
    left: 30,
    borderRadius: 20,
  },
  shape2: {
    width: 30,
    height: 30,
    backgroundColor: '#D4A574',
    top: 40,
    right: 150,
    borderRadius: 15,
  },
  shape3: {
    width: 35,
    height: 35,
    backgroundColor: '#00D9A5',
    top: 90,
    right: 30,
    transform: [{ rotate: '45deg' }],
  },
  shape4: {
    width: 40,
    height: 40,
    backgroundColor: '#00D9A5',
    top: 140,
    right: 300,
    transform: [{ rotate: '45deg' }],
  },
  iconContainer: {
    marginBottom: 24,
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 160,
    height: 160,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    fontFamily: 'Montserrat_700Bold',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  bold: {
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Montserrat_700Bold',
  },
  platformCards: {
    width: '100%',
    marginBottom: 24,
  },
  platformCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  platformIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  platformTextContainer: {
    flex: 1,
  },
  platformLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 0.5,
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  platformName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Montserrat_600SemiBold',
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  successText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
    fontFamily: 'Montserrat_600SemiBold',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
  },
  errorText: {
    fontSize: 13,
    color: '#92400E',
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
  },
  platformCardError: {
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  errorTextSmall: {
    fontSize: 10,
    fontWeight: '600',
    color: '#EF4444',
  },
  platformErrorText: {
    fontSize: 13,
    color: '#EF4444',
  },
  actionButtons: {
    width: '100%',
    alignItems: 'center',
  },
  listAnotherButton: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  listAnotherText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: 'Montserrat_700Bold',
  },
  dashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  dashboardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
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
