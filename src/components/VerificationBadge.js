import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const VerificationBadge = ({ verification, size = 'medium', showLabel = true, variant = 'full', onInfoPress }) => {
  if (!verification || !verification.badge) {
    return null;
  }

  // Only show badge for scores 60+ (Bronze, Silver, Gold)
  if (verification.score < 60) {
    return null;
  }

  const badge = verification.badge;
  
  const sizes = {
    small: { icon: 14, text: 11, padding: 6, gap: 4 },
    medium: { icon: 16, text: 13, padding: 8, gap: 6 },
    large: { icon: 18, text: 14, padding: 10, gap: 6 },
  };

  const currentSize = sizes[size] || sizes.medium;
  
  const displayLabel = variant === 'compact' ? badge.shortLabel : badge.label;

  // Color scheme based on level
  const colorScheme = {
    gold: { bg: '#1E3A5F', icon: '#FFD700', text: '#FFFFFF' },
    silver: { bg: '#1E3A5F', icon: '#E8E8E8', text: '#FFFFFF' },
    bronze: { bg: '#1E3A5F', icon: '#CD7F32', text: '#FFFFFF' },
    unverified: { bg: '#F5F5F5', icon: '#999', text: '#666' },
  };

  const colors = colorScheme[verification.level] || colorScheme.unverified;

  return (
    <View style={styles.badgeWrapper}>
      <View
        style={[
          styles.badge,
          { 
            backgroundColor: colors.bg,
            paddingHorizontal: currentSize.padding * 1.5,
            paddingVertical: currentSize.padding,
            gap: currentSize.gap,
          }
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: colors.icon }]}>
          <Ionicons 
            name="checkmark" 
            size={currentSize.icon - 4} 
            color={verification.level === 'unverified' ? '#FFF' : '#1E3A5F'} 
          />
        </View>
        {showLabel && (
          <Text style={[
            styles.badgeText,
            { fontSize: currentSize.text, color: colors.text }
          ]}>
            {displayLabel}
          </Text>
        )}
      </View>
      {onInfoPress && (
        <TouchableOpacity onPress={onInfoPress} style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
        </TouchableOpacity>
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
  badgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: 'Montserrat_600SemiBold',
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
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
