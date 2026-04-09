import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice, formatDate } from '../utils/helpers';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';
import { CONDITIONS } from '../constants/categories';

export const ProductDetailScreen = ({ route, navigation }) => {
  const { listing } = route.params;
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const cartBounceAnim = useRef(new Animated.Value(1)).current;
  const cartFlyAnim = useRef(new Animated.Value(0)).current;
  const cartOpacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isMyListing = false; // Always show buyer view

  const handleContact = () => {
    // Cart stagger animation
    Animated.sequence([
      // Bounce effect
      Animated.spring(cartBounceAnim, {
        toValue: 1.3,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(cartBounceAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      // Fly up animation
      Animated.parallel([
        Animated.timing(cartFlyAnim, {
          toValue: -300,
          duration: 600,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(cartOpacityAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Reset animations
      cartBounceAnim.setValue(1);
      cartFlyAnim.setValue(0);
      cartOpacityAnim.setValue(1);
      
      // Navigate to MainTabs and then to Home tab
      navigation.navigate('MainTabs', {
        screen: 'Home',
        params: { cartItemAdded: true },
      });
    });
  };

  const handleEdit = () => {
    navigation.navigate('ListingEditor', { productData: listing, isEdit: true });
  };

  return (
    <View style={styles.container}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: listing.imageUri }} style={styles.image} />
        
        {/* Back & Favorite Buttons */}
        <View style={styles.topButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? "#FF6B6B" : COLORS.text} 
            />
          </TouchableOpacity>
        </View>

        {/* Image Dots */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      {/* Content Section */}
      <Animated.View 
        style={[
          styles.contentContainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
          }
        ]}
      >
        <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Badges */}
        <View style={styles.badgesRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {CONDITIONS.find(c => c.id === listing.condition)?.label || listing.condition}
            </Text>
          </View>
          <View style={[styles.badge, styles.categoryBadge]}>
            <Text style={styles.badgeText}>{listing.category}</Text>
          </View>
        </View>

        {/* Platform Badges */}
        {(listing.publishedPlatforms || listing.selectedPlatforms) && (
          <View style={styles.platformBadgesRow}>
            <Text style={styles.platformBadgesLabel}>Published on:</Text>
            <View style={styles.platformBadgesContainer}>
              {(listing.publishedPlatforms?.carousell || listing.selectedPlatforms?.carousell) && (
                <View style={[styles.platformBadge, { backgroundColor: '#FFE8E8' }]}>
                  <Ionicons name="cart-outline" size={14} color="#D32F2F" />
                  <Text style={[styles.platformBadgeText, { color: '#D32F2F' }]}>Carousell</Text>
                </View>
              )}
              {(listing.publishedPlatforms?.facebook || listing.selectedPlatforms?.facebook) && (
                <View style={[styles.platformBadge, { backgroundColor: '#E8F0FE' }]}>
                  <Ionicons name="logo-facebook" size={14} color="#1877F2" />
                  <Text style={[styles.platformBadgeText, { color: '#1877F2' }]}>Facebook</Text>
                </View>
              )}
              {(listing.publishedPlatforms?.shopee || listing.selectedPlatforms?.shopee) && (
                <View style={[styles.platformBadge, { backgroundColor: '#FFF0ED' }]}>
                  <Ionicons name="bag-handle" size={14} color="#EE4D2D" />
                  <Text style={[styles.platformBadgeText, { color: '#EE4D2D' }]}>Shopee</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Rating */}
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={18} color="#FFB800" />
          <Text style={styles.ratingText}>4.8 (24 reviews)</Text>
        </View>

        {/* Product Title */}
        <Text style={styles.title}>{listing.name?.toUpperCase()}</Text>

        {/* Subtitle/Brand */}
        {listing.brand && (
          <Text style={styles.subtitle}>{listing.brand}</Text>
        )}

        {/* Product Details Cards */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailCard}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.detailCardLabel}>Condition</Text>
              <Text style={styles.detailCardValue}>
                {CONDITIONS.find(c => c.id === listing.condition)?.label || 'Good'}
              </Text>
            </View>

            <View style={styles.detailCard}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="grid" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.detailCardLabel}>Category</Text>
              <Text style={styles.detailCardValue}>{listing.category}</Text>
            </View>

            {listing.brand && (
              <View style={styles.detailCard}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="ribbon" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.detailCardLabel}>Brand</Text>
                <Text style={styles.detailCardValue}>{listing.brand}</Text>
              </View>
            )}

            <View style={styles.detailCard}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="calendar" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.detailCardLabel}>Listed</Text>
              <Text style={styles.detailCardValue}>{formatDate(listing.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text 
            style={styles.description} 
            numberOfLines={showFullDescription ? undefined : 4}
          >
            {listing.description}
          </Text>
          <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
            <Text style={styles.readMore}>
              {showFullDescription ? 'Show less' : 'Read more'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Seller Information */}
        <View style={styles.sellerSection}>
          <Text style={styles.sectionTitle}>Seller Information</Text>
          <View style={styles.sellerCard}>
            <View style={styles.sellerAvatarLarge}>
              <Ionicons name="person" size={28} color={COLORS.primary} />
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{listing.userName}</Text>
              <View style={styles.sellerRatingRow}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Text style={styles.sellerRating}>4.8 (24 reviews)</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.messageIconButton}>
              <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Spacer for bottom bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
      </Animated.View>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Final price</Text>
          <Text style={styles.price}>₱{listing.price?.toLocaleString()}</Text>
        </View>
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={isMyListing ? handleEdit : handleContact}
        >
          <Text style={styles.addToCartText}>
            {isMyListing ? 'Edit Listing' : 'Buy Now'}
          </Text>
          <Animated.View style={[
            styles.cartIcon,
            {
              transform: [
                { scale: cartBounceAnim },
                { translateY: cartFlyAnim },
              ],
              opacity: cartOpacityAnim,
            }
          ]}>
            <Ionicons 
              name={isMyListing ? "create-outline" : "cart-outline"} 
              size={20} 
              color={COLORS.text} 
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    width: '100%',
    height: 380,
    position: 'relative',
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topButtons: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: SPACING.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#000',
    width: 24,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 120,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  badge: {
    backgroundColor: '#E8E8E8',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
  },
  badgeNew: {
    backgroundColor: COLORS.primary,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
    textTransform: 'capitalize',
    fontFamily: 'Montserrat_600SemiBold',
  },
  categoryBadge: {
    backgroundColor: COLORS.secondary,
  },
  platformBadgesRow: {
    marginBottom: SPACING.md,
  },
  platformBadgesLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  platformBadgesContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  platformBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.md,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: 'Montserrat_600SemiBold',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    letterSpacing: 0.3,
    fontFamily: 'Montserrat_700Bold',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
    fontFamily: 'Montserrat_400Regular',
  },
  detailsSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    fontFamily: 'Montserrat_700Bold',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  detailCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FAFAFA',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0EFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailCardLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  detailCardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    textTransform: 'capitalize',
    fontFamily: 'Montserrat_600SemiBold',
  },
  descriptionSection: {
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.xs,
    fontFamily: 'Montserrat_400Regular',
  },
  readMore: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SPACING.sm,
    fontFamily: 'Montserrat_600SemiBold',
  },
  sellerSection: {
    marginBottom: SPACING.lg,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  sellerAvatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0EFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  sellerRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerRating: {
    fontSize: 13,
    color: COLORS.textLight,
    fontFamily: 'Montserrat_400Regular',
  },
  messageIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacer: {
    height: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: SPACING.md,
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: 'Montserrat_700Bold',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  addToCartText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: 'Montserrat_600SemiBold',
  },
  cartIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
