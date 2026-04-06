import React, { useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { formatPrice, formatDate } from '../utils/helpers';
import { createFadeIn, createScale, pressAnimation } from '../utils/animations';

export const ProductCard = ({ listing, onPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

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
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {listing.name}
        </Text>
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
});
