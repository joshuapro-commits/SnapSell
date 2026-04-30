import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Trial Status Banner
 * Shows remaining trial days and prompts for subscription
 */
export const TrialStatusBanner = ({ trialStartDate, onUpgrade }) => {
  const [daysLeft, setDaysLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!trialStartDate) return;

    const calculateDaysLeft = () => {
      const now = Date.now();
      const trialStart = new Date(trialStartDate).getTime();
      const daysPassed = (now - trialStart) / (1000 * 60 * 60 * 24);
      const remaining = Math.max(0, 7 - Math.floor(daysPassed));
      
      setDaysLeft(remaining);
      setIsExpired(remaining === 0);
    };

    calculateDaysLeft();
    const interval = setInterval(calculateDaysLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [trialStartDate]);

  if (!trialStartDate) return null;

  // Trial active
  if (!isExpired) {
    return (
      <LinearGradient
        colors={['#FFD700', '#FFA500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.banner}
      >
        <View style={styles.content}>
          <Ionicons name="star" size={20} color="#FFF" />
          <Text style={styles.text}>
            {daysLeft === 0 
              ? 'Last day of Premium trial!' 
              : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left in Premium trial`}
          </Text>
        </View>
        {daysLeft <= 2 && (
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <Text style={styles.upgradeButtonText}>Subscribe</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    );
  }

  // Trial expired
  return (
    <LinearGradient
      colors={['#FF6B35', '#FF8C42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.banner}
    >
      <View style={styles.content}>
        <Ionicons name="alert-circle" size={20} color="#FFF" />
        <Text style={styles.text}>Your trial has ended</Text>
      </View>
      <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
        <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  text: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#FFF',
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeButtonText: {
    fontSize: 13,
    fontFamily: 'Montserrat_700Bold',
    color: '#FF6B35',
  },
});
