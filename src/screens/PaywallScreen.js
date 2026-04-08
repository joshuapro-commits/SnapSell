import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export const PaywallScreen = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState('annual');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Close Button */}
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={28} color="#FFF" />
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Character Face */}
        <View style={styles.faceContainer}>
          <View style={styles.eyebrowLeft} />
          <View style={styles.eyebrowRight} />
          
          <View style={styles.eyesContainer}>
            <View style={styles.eye}>
              <View style={styles.pupil} />
            </View>
            <View style={styles.eye}>
              <View style={styles.pupil} />
            </View>
          </View>
          
          <View style={styles.mouth} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Boost your sales with</Text>
        <Text style={styles.subtitle}>SnapSell Premium</Text>

        {/* Pricing */}
        <Text style={styles.pricing}>₱299/year (₱24.92/month)</Text>

        {/* Plan Toggle */}
        <View style={styles.planToggle}>
          <TouchableOpacity
            style={[styles.planButton, selectedPlan === 'annual' && styles.planButtonActive]}
            onPress={() => setSelectedPlan('annual')}
          >
            <Text style={[styles.planButtonText, selectedPlan === 'annual' && styles.planButtonTextActive]}>
              Annual 40% off
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.planButton, selectedPlan === 'monthly' && styles.planButtonActive]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <Text style={[styles.planButtonText, selectedPlan === 'monthly' && styles.planButtonTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Ionicons name="infinite" size={24} color="#FFF" />
            <Text style={styles.featureText}>
              Unlimited listings{'\n'}without restrictions.
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="flash" size={24} color="#FFF" />
            <Text style={styles.featureText}>
              Priority AI processing{'\n'}for faster listing creation.
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="analytics" size={24} color="#FFF" />
            <Text style={styles.featureText}>
              Advanced analytics{'\n'}to track your sales performance.
            </Text>
          </View>
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity style={styles.subscribeButton}>
          <Text style={styles.subscribeButtonText}>Subscribe</Text>
        </TouchableOpacity>

        {/* Footer Links */}
        <View style={styles.footer}>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Restore</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Terms</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Privacy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B35',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  faceContainer: {
    width: 120,
    height: 120,
    marginBottom: 40,
    position: 'relative',
  },
  eyebrowLeft: {
    position: 'absolute',
    top: 10,
    left: 20,
    width: 30,
    height: 8,
    backgroundColor: '#D4A574',
    borderRadius: 4,
    transform: [{ rotate: '-10deg' }],
  },
  eyebrowRight: {
    position: 'absolute',
    top: 10,
    right: 20,
    width: 30,
    height: 8,
    backgroundColor: '#D4A574',
    borderRadius: 4,
    transform: [{ rotate: '10deg' }],
  },
  eyesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginTop: 30,
  },
  eye: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pupil: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3D2817',
  },
  mouth: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 20,
    backgroundColor: '#8B4513',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '400',
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Montserrat_700Bold',
  },
  pricing: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'Montserrat_400Regular',
  },
  planToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    padding: 4,
    marginBottom: 40,
    width: '100%',
  },
  planButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 26,
    alignItems: 'center',
  },
  planButtonActive: {
    backgroundColor: '#FFF',
  },
  planButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  planButtonTextActive: {
    color: '#FF6B35',
  },
  features: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#FFF',
    lineHeight: 24,
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
  },
  subscribeButton: {
    width: '100%',
    backgroundColor: '#FFF',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 24,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B35',
    fontFamily: 'Montserrat_700Bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  footerLink: {
    fontSize: 14,
    color: '#FFF',
    fontFamily: 'Montserrat_400Regular',
  },
});
