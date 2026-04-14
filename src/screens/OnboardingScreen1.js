import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaskedView from '@react-native-masked-view/masked-view';

export const OnboardingScreen1 = ({ onNext, currentIndex, isActive }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Circle animations
  const circle1 = useRef(new Animated.Value(0)).current;
  const circle2 = useRef(new Animated.Value(0)).current;
  const circle3 = useRef(new Animated.Value(0)).current;
  const circle4 = useRef(new Animated.Value(0)).current;
  const circle5 = useRef(new Animated.Value(0)).current;
  const circle6 = useRef(new Animated.Value(0)).current;
  const circle7 = useRef(new Animated.Value(0)).current;
  const circle8 = useRef(new Animated.Value(0)).current;
  const circle9 = useRef(new Animated.Value(0)).current;

  // Page indicator animation
  const indicator1Width = useRef(new Animated.Value(currentIndex === 0 ? 32 : 8)).current;
  const indicator2Width = useRef(new Animated.Value(currentIndex === 1 ? 32 : 8)).current;
  const indicator3Width = useRef(new Animated.Value(currentIndex === 2 ? 32 : 8)).current;

  useEffect(() => {
    if (isActive) {
      // Staggered circle animations
      Animated.stagger(80, [
        Animated.spring(circle1, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.spring(circle2, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.spring(circle3, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.spring(circle4, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.spring(circle5, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.spring(circle6, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.spring(circle7, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.spring(circle8, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.spring(circle9, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      ]).start();

      // Text animations
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
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

  const circles = [
    { anim: circle1, uri: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=200' },
    { anim: circle2, uri: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=200' },
    { anim: circle3, uri: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200' },
    { anim: circle4, uri: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200' },
    { anim: circle5, uri: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300' },
    { anim: circle6, uri: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=200' },
    { anim: circle7, uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200' },
    { anim: circle8, uri: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=200' },
    { anim: circle9, uri: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="close" size={28} color="#64748B" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.imageGrid}>
          <View style={styles.topRow}>
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                style={[
                  styles.circleSmall,
                  {
                    opacity: circles[i].anim,
                    transform: [
                      { scale: circles[i].anim },
                      {
                        translateY: circles[i].anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Image source={{ uri: circles[i].uri }} style={styles.circleImage} resizeMode="cover" />
              </Animated.View>
            ))}
          </View>
          <View style={styles.middleRow}>
            <Animated.View
              style={[
                styles.circleSmall,
                {
                  opacity: circles[3].anim,
                  transform: [{ scale: circles[3].anim }],
                },
              ]}
            >
              <Image source={{ uri: circles[3].uri }} style={styles.circleImage} resizeMode="cover" />
            </Animated.View>
            <Animated.View
              style={[
                styles.circleLarge,
                {
                  opacity: circles[4].anim,
                  transform: [{ scale: circles[4].anim }],
                },
              ]}
            >
              <Image source={{ uri: circles[4].uri }} style={styles.circleImage} resizeMode="cover" />
            </Animated.View>
            <Animated.View
              style={[
                styles.circleSmall,
                {
                  opacity: circles[5].anim,
                  transform: [{ scale: circles[5].anim }],
                },
              ]}
            >
              <Image source={{ uri: circles[5].uri }} style={styles.circleImage} resizeMode="cover" />
            </Animated.View>
          </View>
          <View style={styles.bottomRow}>
            {[6, 7, 8].map((i) => (
              <Animated.View
                key={i}
                style={[
                  styles.circleSmall,
                  {
                    opacity: circles[i].anim,
                    transform: [
                      { scale: circles[i].anim },
                      {
                        translateY: circles[i].anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-30, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Image source={{ uri: circles[i].uri }} style={styles.circleImage} resizeMode="cover" />
              </Animated.View>
            ))}
          </View>
        </View>

        <Animated.View 
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>Snap </Text>
          <MaskedView maskElement={<Text style={styles.title}>Once.</Text>}>
            <LinearGradient
              colors={['#D493FF', '#7704F4', '#FD7B3B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              locations={[0, 0.3, 1]}
            >
              <Text style={[styles.title, { opacity: 0 }]}>Once</Text>
            </LinearGradient>
          </MaskedView>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.descriptionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.description}>Take a quick photo of your item. Our AI</Text>
          <View style={styles.descriptionRow}>
            <Text style={styles.description}>automatically </Text>
            <MaskedView maskElement={<Text style={styles.enhancedText}>enhances</Text>}>
              <LinearGradient
                colors={['#D493FF', '#7704F4', '#FD7B3B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                locations={[0, 0.3, 1]}
              >
                <Text style={[styles.enhancedText, { opacity: 0 }]}>enhances</Text>
              </LinearGradient>
            </MaskedView>
            <Text style={styles.description}> the image for you.</Text>
          </View>
        </Animated.View>

        <View style={styles.pagination}>
          <Animated.View style={[styles.dot, { width: indicator1Width, backgroundColor: currentIndex === 0 ? '#FF7A2F' : '#CBD5E1' }]} />
          <Animated.View style={[styles.dot, { width: indicator2Width, backgroundColor: currentIndex === 1 ? '#FF7A2F' : '#CBD5E1' }]} />
          <Animated.View style={[styles.dot, { width: indicator3Width, backgroundColor: currentIndex === 2 ? '#FF7A2F' : '#CBD5E1' }]} />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity activeOpacity={0.9} onPress={onNext}>
          <LinearGradient
            colors={['#D493FF', '#7704F4', '#FD7B3B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            locations={[0, 0.3, 1]}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>Next</Text>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  imageGrid: {
    width: '100%',
    maxWidth: 360,
    marginBottom: 32,
    alignItems: 'center',
  },
  topRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    justifyContent: 'center',
  },
  middleRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  circleSmall: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  circleLarge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  circleImage: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Montserrat_700Bold',
  },
  descriptionContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Montserrat_400Regular',
  },
  enhancedText: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    fontFamily: 'Montserrat_700Bold',
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
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
