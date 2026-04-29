import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Prominent "Verified by SnapSell" banner for product detail pages
 * Shows full branding and trust messaging
 */
export const SnapSellVerificationBanner = ({ verification }) => {
  if (!verification || !verification.verified) {
    return null;
  }

  const badge = verification.badge;
  
  // Gradient colors based on verification level
  const gradients = {
    gold: ['#FFD700', '#FFA500'],
    silver: ['#C0C0C0', '#A8A8A8'],
    bronze: ['#CD7F32', '#B8860B'],
  };

  const gradient = gradients[verification.level] || ['#E5E7EB', '#D1D5DB'];

  return (
    <LinearGradient
      colors={[`${badge.color}20`, `${badge.color}10`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: badge.color }]}>
          <Ionicons name="shield-checkmark" size={24} color="#FFF" />
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.brandText}>Verified by</Text>
          <Text style={styles.snapSellText}>SnapSell</Text>
        </View>
        
        <Text style={styles.description}>{badge.description}</Text>
        
        <View style={styles.scoreRow}>
          <View style={styles.scoreBar}>
            <View 
              style={[
                styles.scoreBarFill,
                { 
                  width: `${verification.score}%`,
                  backgroundColor: badge.color,
                }
              ]} 
            />
          </View>
          <Text style={styles.scoreText}>{verification.score}% Trust Score</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  brandText: {
    fontSize: 13,
    fontFamily: 'Montserrat_500Medium',
    color: '#666',
  },
  snapSellText: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    color: '#FF6B35',
  },
  description: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    color: '#666',
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  scoreText: {
    fontSize: 11,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#666',
    minWidth: 80,
  },
});
