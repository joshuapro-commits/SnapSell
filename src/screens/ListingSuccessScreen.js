import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const ListingSuccessScreen = ({ navigation, route }) => {
  const { productName } = route.params || {};

  return (
    <View style={styles.container}>
      {/* Decorative shapes */}
      <View style={[styles.shape, styles.shape1]} />
      <View style={[styles.shape, styles.shape2]} />
      <View style={[styles.shape, styles.shape3]} />
      <View style={[styles.shape, styles.shape4]} />

      {/* Success Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <View style={styles.iconInner}>
            <Ionicons name="checkmark" size={60} color="#00D9A5" />
          </View>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Item Listed!</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Your item is now live on{'\n'}
        <Text style={styles.bold}>Facebook & Carousell</Text>. Good{'\n'}
        luck with the sale!
      </Text>

      {/* Platform Cards */}
      <View style={styles.platformCards}>
        <TouchableOpacity style={styles.platformCard}>
          <View style={styles.platformIconCircle}>
            <Ionicons name="logo-facebook" size={24} color="#4267B2" />
          </View>
          <View style={styles.platformTextContainer}>
            <Text style={styles.platformLabel}>PLATFORM</Text>
            <Text style={styles.platformName}>View Post on FB</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.platformCard}>
          <View style={[styles.platformIconCircle, { backgroundColor: '#FFE8E8' }]}>
            <Ionicons name="bag-handle" size={24} color="#FF4444" />
          </View>
          <View style={styles.platformTextContainer}>
            <Text style={styles.platformLabel}>PLATFORM</Text>
            <Text style={styles.platformName}>View Post on Carousell</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.listAnotherButton}
          onPress={() => navigation.navigate('Camera')}
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
    marginBottom: 32,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#00D9A5',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  bold: {
    fontWeight: '700',
    color: '#000',
  },
  platformCards: {
    width: '100%',
    marginBottom: 32,
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
  },
  platformName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
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
  },
});
