import React, { useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { formatPrice, formatDate } from '../utils/helpers';
import { createFadeIn, createScale, pressAnimation } from '../utils/animations';
import { VerificationBadge } from './VerificationBadge';
import { calculateRelistStatus, formatDaysOld } from '../utils/relistHelper';

export const ProductCard = ({ listing, onPress, onRelist, showRelistButton = false }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  
  // Calculate relist status
  const relistStatus = calculateRelistStatus(listing);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = () => {
    pressAnimation(pressScale);
    onPress?.();
  };
  
  const handleRelistPress = (e) => {
    e.stopPropagation(); // Prevent card press
    onRelist?.(listing);
  };

  return (
    <Animated.View style={[{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity 
        style={styles.card} 
        onPress={handlePress} 
        activeOpacity={1}
      >
        <Animated.View style={{ transform: [{ scale: pressScale }] }}>
      <Image 
        source={{ uri: listing.imageUri }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      {/* Relist Button Badge - Shows if listing needs relisting */}
      {showRelistButton && relistStatus.needsRelist && (
        <TouchableOpacity 
          style={styles.relistBadge}
          onPress={handleRelistPress}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={14} color="#FFF" />
          <Text style={styles.relistText}>
            Relist ({relistStatus.daysOld}d)
          </Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {listing.name}
        </Text>
        
        {/* Verification Badge */}
        {listing.verification && (
          <View style={styles.verificationContainer}>
            <VerificationBadge 
              verification={listing.verification} 
              size="small" 
              showLabel={true}
              variant="compact"
            />
          </View>
        )}
        
        <Text style={styles.brand} numberOfLines={1}>
          {listing.brand}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>{formatPrice(listing.price)}</Text>
          <Text style={styles.date}>{formatDate(listing.createdAt)}</Text>
        </View>
        <View style={styles.conditionBadge}>
          <Text style={styles.conditionText}>{listing.condition}</Text>
        </View>
      </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.border,
  },
  content: {
    padding: SPACING.md,
  },
  verificationContainer: {
    marginVertical: SPACING.xs,
  },
  name: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  brand: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  date: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  conditionBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  conditionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.surface,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  relistBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  relistText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
});
