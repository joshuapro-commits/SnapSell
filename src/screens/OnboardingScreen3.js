import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export const OnboardingScreen3 = ({ onGetStarted, currentIndex, isActive }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const gridAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(50)).current;

  const indicator1Width = useRef(new Animated.Value(currentIndex === 0 ? 32 : 8)).current;
  const indicator2Width = useRef(new Animated.Value(currentIndex === 1 ? 32 : 8)).current;
  const indicator3Width = useRef(new Animated.Value(currentIndex === 2 ? 32 : 8)).current;

  useEffect(() => {
    if (isActive) {
      Animated.sequence([
        Animated.spring(gridAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(logoAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(textAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
          delay: 400,
        }),
      ]).start();
    }
  }, [isActive]);

  useEffect(() => {
    Animated.timing(indicator1Width, {
      toValue: currentIndex === 0 ? 32 : 8,
      duration: 300,
      useNativeDriver: false,
    }).start();
    Animated.timing(indicator2Width, {
      toValue: currentIndex === 1 ? 32 : 8,
      duration: 300,
      useNativeDriver: false,
    }).start();
    Animated.timing(indicator3Width, {
      toValue: currentIndex === 2 ? 32 : 8,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentIndex]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerPlaceholder} />
        
        <TouchableOpacity>
          <Ionicons name="close" size={28} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Main Visual Section */}
      <View style={styles.visualContainer}>
        {/* Product Images Grid at Top */}
        <Animated.View 
          style={[
            styles.platformGrid,
            {
              opacity: gridAnim,
              transform: [
                { scale: gridAnim },
                {
                  translateY: gridAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
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
        </Animated.View>

        {/* Platform Logos - Facebook and Carousell */}
        <Animated.View 
          style={[
            styles.platformLogosContainer,
            {
              opacity: logoAnim,
              transform: [
                { scale: logoAnim },
                {
                  translateY: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.facebookLogoBox}>
            <Ionicons name="logo-facebook" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.carousellLogoBox}>
            <Ionicons name="bag-handle" size={40} color="#FF4444" />
          </View>
        </Animated.View>
      </View>

      {/* Text Content */}
      <Animated.View 
        style={[
          styles.textContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: textAnim }],
          },
        ]}
      >
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
      </Animated.View>

      {/* Pagination */}
      <View style={styles.pagination}>
        <Animated.View style={[styles.dot, { width: indicator1Width, backgroundColor: currentIndex === 0 ? '#FF7A2F' : '#CBD5E1' }]} />
        <Animated.View style={[styles.dot, { width: indicator2Width, backgroundColor: currentIndex === 1 ? '#FF7A2F' : '#CBD5E1' }]} />
        <Animated.View style={[styles.dot, { width: indicator3Width, backgroundColor: currentIndex === 2 ? '#FF7A2F' : '#CBD5E1' }]} />
      </View>

      {/* Footer */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity activeOpacity={0.9} onPress={onGetStarted}>
          <LinearGradient
            colors={['#7C3AED', '#FF7A2F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingHorizontal: 24,
    paddingTop: 8,
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
    marginBottom: 24,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    justifyContent: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
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
  buttonContainer: {
    padding: 24,
    paddingBottom: 32,
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#7704F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
});
