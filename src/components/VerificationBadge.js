import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const VerificationBadge = ({ verification, size = 'medium', showLabel = true }) => {
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

  return (
    <View style={[
      styles.badge,
      { 
        backgroundColor: `${badge.color}15`,
        paddingHorizontal: currentSize.padding * 2,
        paddingVertical: currentSize.padding,
        gap: currentSize.gap,
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
          {badge.label}
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
      <View style={styles.sellerBadge}>
        <Ionicons name="person-outline" size={14} color="#999" />
        <Text style={styles.sellerBadgeText}>New Seller</Text>
      </View>
    );
  }

  const levelColors = {
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
  };

  const color = levelColors[sellerScore.level] || '#999';

  return (
    <View style={[styles.sellerBadge, { backgroundColor: `${color}15` }]}>
      <Ionicons name="star" size={14} color={color} />
      <Text style={[styles.sellerBadgeText, { color }]}>
        {sellerScore.verificationRate}% Verified
      </Text>
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
});
