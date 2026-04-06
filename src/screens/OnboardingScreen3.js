import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const OnboardingScreen3 = ({ onGetStarted }) => {
  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerPlaceholder} />
        
        <TouchableOpacity>
          <Ionicons name="close" size={28} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      {/* Main Visual Section */}
      <View style={styles.visualContainer}>
        {/* Product Images Grid at Top */}
        <View style={styles.platformGrid}>
          <View style={styles.platformRow}>
            <View style={styles.productImageBox}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200' }}
                style={styles.productImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.productImageBox}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200' }}
                style={styles.productImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.productImageBox}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200' }}
                style={styles.productImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.productImageBox}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=200' }}
                style={styles.productImage}
                resizeMode="cover"
              />
            </View>
          </View>
          <View style={styles.platformRow}>
            <View style={styles.productImageBox}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=200' }}
                style={styles.productImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.productImageBox}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200' }}
                style={styles.productImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.productImageBox}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=200' }}
                style={styles.productImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.productImageBox}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=200' }}
                style={styles.productImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        {/* Platform Logos - Facebook and Carousell */}
        <View style={styles.platformLogosContainer}>
          <View style={styles.facebookLogoBox}>
            <Ionicons name="logo-facebook" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.carousellLogoBox}>
            <Ionicons name="bag-handle" size={40} color="#FF4444" />
          </View>
        </View>
      </View>

      {/* Text Content */}
      <View style={styles.textContent}>
        <View>
          <Text style={styles.title}>Sell Faster,</Text>
          <MaskedView
            maskElement={
              <Text style={[styles.titleGradient, { backgroundColor: 'transparent' }]}>
                Everywhere
              </Text>
            }
          >
            <LinearGradient
              colors={['#7C3AED', '#FF7A2F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.titleGradient, { opacity: 0 }]}>
                Everywhere
              </Text>
            </LinearGradient>
          </MaskedView>
        </View>
        
        <Text style={styles.description}>
          One tap to publish on Facebook Marketplace and Carousell. Clean photos, better listings, faster sales.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={onGetStarted}>
          <LinearGradient
            colors={['#7C3AED', '#FF7A2F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Pagination */}
        <View style={styles.pagination}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <LinearGradient
            colors={['#7C3AED', '#FF7A2F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.activeDot}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerPlaceholder: {
    flex: 1,
  },
  visualContainer: {
    height: 380,
    paddingHorizontal: 20,
    paddingTop: 20,
    position: 'relative',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  platformGrid: {
    width: '100%',
    gap: 16,
    marginBottom: 40,
  },
  platformRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  platformIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productImageBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  platformLogosContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  facebookLogoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#1877F2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  carousellLogoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -20,
    marginBottom: 30,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 46,
    fontFamily: 'Montserrat_700Bold',
  },
  titleGradient: {
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 46,
    fontFamily: 'Montserrat_700Bold',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.2,
    marginTop: 16,
    maxWidth: 320,
    fontFamily: 'Montserrat_400Regular',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 24,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_700Bold',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
  },
  activeDot: {
    width: 32,
    height: 8,
    borderRadius: 4,
  },
});
