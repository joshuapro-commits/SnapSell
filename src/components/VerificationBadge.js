import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const VerificationBadge = ({ verification, size = 'medium', showLabel = true, variant = 'full' }) => {
  if (!verification || !verification.verified) {
    return null;
  }

  const badge = verification.badge;
  const sizes = {
    small: { icon: 14, text: 11, padding: 4, gap: 3 },
    medium: { icon: 16, text: 12, padding: 6, gap: 4 },
    large: { icon: 20, text: 14, padding: 8, gap: 6 },
  };

  const currentSize = sizes[size] || sizes.medium;
  
  // Use shortLabel for compact display, full label for prominent display
  const displayLabel = variant === 'compact' ? badge.shortLabel : badge.label;

  return (
    <View style={[
      styles.badge,
      { 
        backgroundColor: `${badge.color}15`,
        paddingHorizontal: currentSize.padding * 2,
        paddingVertical: currentSize.padding,
        gap: currentSize.gap,
        borderWidth: 1,
        borderColor: `${badge.color}40`,
      }
    ]}>
      <Ionicons 
        name={badge.icon} 
        size={currentSize.icon} 
        color={badge.color} 
      />
      {showLabel && (
        <Text style={[
          styles.badgeText,
          { 
            color: badge.color,
            fontSize: currentSize.text,
          }
        ]}>
          {displayLabel}
        </Text>
      )}
    </View>
  );
};

export const VerificationScore = ({ verification }) => {
  if (!verification) return null;

  const getScoreColor = (score) => {
    if (score >= 90) return '#FFD700';
    if (score >= 75) return '#C0C0C0';
    if (score >= 60) return '#CD7F32';
    return '#999';
  };

  return (
    <View style={styles.scoreContainer}>
      <View style={styles.scoreBar}>
        <View 
          style={[
            styles.scoreBarFill,
            { 
              width: `${verification.score}%`,
              backgroundColor: getScoreColor(verification.score),
            }
          ]} 
        />
      </View>
      <Text style={styles.scoreText}>{verification.score}% Trust Score</Text>
    </View>
  );
};

export const SellerVerificationBadge = ({ sellerScore, size = 'medium' }) => {
  if (!sellerScore || sellerScore.level === 'new') {
    return (
      <View style={styles.sellerBadgeNew}>
        <Ionicons name="person-outline" size={16} color="#999" />
        <Text style={styles.sellerBadgeTextNew}>New Seller</Text>
      </View>
    );
  }

  const levelConfig = {
    gold: { color: '#FFD700', icon: 'trophy', label: 'Gold Seller' },
    silver: { color: '#C0C0C0', icon: 'medal', label: 'Silver Seller' },
    bronze: { color: '#CD7F32', icon: 'ribbon', label: 'Bronze Seller' },
  };

  const config = levelConfig[sellerScore.level] || levelConfig.bronze;
  const sizeConfig = {
    small: { icon: 16, text: 12, padding: 8 },
    medium: { icon: 20, text: 14, padding: 12 },
    large: { icon: 32, text: 18, padding: 16 },
  };
  const currentSize = sizeConfig[size] || sizeConfig.medium;

  return (
    <View style={[
      styles.sellerBadgeVerified,
      { 
        backgroundColor: `${config.color}15`,
        borderColor: `${config.color}40`,
        padding: currentSize.padding,
      }
    ]}>
      <View style={[
        styles.iconCircle,
        { 
          backgroundColor: config.color,
          width: currentSize.icon * 2,
          height: currentSize.icon * 2,
        }
      ]}>
        <Ionicons name={config.icon} size={currentSize.icon} color="#FFF" />
      </View>
      <View style={styles.badgeContent}>
        <Text style={[
          styles.sellerBadgeTitle,
          { fontSize: currentSize.text, color: config.color }
        ]}>
          {config.label}
        </Text>
        <Text style={[
          styles.sellerBadgePercentage,
          { fontSize: currentSize.text - 2 }
        ]}>
          {sellerScore.verificationRate}% Verified
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontFamily: 'Montserrat_600SemiBold',
  },
  scoreContainer: {
    marginTop: 8,
  },
  scoreBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  scoreText: {
    fontSize: 11,
    fontFamily: 'Montserrat_500Medium',
    color: '#666',
  },
  sellerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  sellerBadgeText: {
    fontSize: 11,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#666',
  },
  sellerBadgeNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sellerBadgeTextNew: {
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#999',
  },
  sellerBadgeVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 2,
  },
  iconCircle: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContent: {
    flex: 1,
  },
  sellerBadgeTitle: {
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 2,
  },
  sellerBadgePercentage: {
    fontFamily: 'Montserrat_500Medium',
    color: '#6F7787',
  },
});
