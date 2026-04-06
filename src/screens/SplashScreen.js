import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';

const { width, height } = Dimensions.get('window');

export const SplashScreen = ({ onContinue }) => {
  const textOpacity = useRef(new Animated.Value(0)).current;
  const splashCircleScale = useRef(new Animated.Value(0)).current;
  const splashCircleOpacity = useRef(new Animated.Value(0)).current;
  const raindropY = useRef(new Animated.Value(-100)).current;
  const raindropOpacity = useRef(new Animated.Value(0)).current;
  const raindropScale = useRef(new Animated.Value(1)).current;
  
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      Animated.sequence([
        Animated.delay(500),
        // Text appears first
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.delay(4000),
        // Then raindrop appears and falls from top
        Animated.parallel([
          Animated.timing(raindropOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(raindropY, {
            toValue: height / 2 - 50,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        // Raindrop hits and disappears
        Animated.parallel([
          Animated.timing(raindropScale, {
            toValue: 0.5,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(raindropOpacity, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        // Splash paint effect - circle expands from center
        Animated.parallel([
          Animated.timing(splashCircleOpacity, {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(splashCircleScale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(800),
      ]).start(() => {
        if (onContinue) {
          onContinue();
        }
      });
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const splashSize = Math.max(width, height) * 3;

  return (
    <View style={styles.mainContainer}>
      {/* Logo - Static */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/AppIcon.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Footer - Brand and Tagline */}
      <Animated.View style={[styles.footer, { opacity: textOpacity }]}>
        <View style={styles.brandTextWrapper}>
          <Text style={styles.brandText}>Snapsell</Text>
        </View>
        
        <View>
          <Text style={styles.taglineText}>
            Snap It. <Text style={styles.taglineHighlight}>Sell It.</Text>
          </Text>
        </View>
      </Animated.View>

      {/* Raindrop falling from top */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: 0,
            left: width / 2 - 15,
            width: 30,
            height: 40,
            zIndex: 999,
            opacity: raindropOpacity,
            transform: [
              { translateY: raindropY },
              { scale: raindropScale },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#8B5CF6', '#EC4899', '#F97316']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        />
      </Animated.View>

      {/* Splash Paint Circle Effect - ON TOP */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: height / 2,
            left: width / 2,
            width: splashSize,
            height: splashSize,
            marginLeft: -splashSize / 2,
            marginTop: -splashSize / 2,
            borderRadius: splashSize / 2,
            overflow: 'hidden',
            zIndex: 1000,
            opacity: splashCircleOpacity,
            transform: [{ scale: splashCircleScale }],
          },
        ]}
      >
        <LinearGradient
          colors={['#8B5CF6', '#EC4899', '#F97316']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 250,
    height: 250,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  brandTextWrapper: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  brandText: {
    fontSize: 28,
    fontFamily: 'Montserrat_600SemiBold',
    letterSpacing: -1,
    color: '#000000',
  },
  taglineText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4B5563',
    letterSpacing: -0.3,
    fontFamily: 'Montserrat_700Bold',
    textAlign: 'center',
  },
  taglineHighlight: {
    color: '#702AE1',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
});
