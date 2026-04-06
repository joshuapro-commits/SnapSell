import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { aiService } from '../services/ai';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const AnalyzingScreen = ({ route, navigation }) => {
  const { imageUri } = route.params || {};
  const [progress, setProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [fadeAnim] = useState(new Animated.Value(1));
  const [currentStep, setCurrentStep] = useState(0);
  const [aiComplete, setAiComplete] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const steps = [
    'Removing background',
    'Finding market prices',
    'Writing description',
    'Detecting brand',
    'Finalizing'
  ];

  useEffect(() => {
    const analyzeImage = async () => {
      try {
        const result = await aiService.analyzeImage(imageUri);
        setAiResult(result);
        setAiComplete(true);
      } catch (error) {
        navigation.goBack();
      }
    };

    if (imageUri) {
      analyzeImage();
    }
  }, [imageUri]);

  useEffect(() => {
    if (aiComplete && progress >= 100) {
      setTimeout(() => {
        if (aiResult?.success) {
          navigation.replace('ListingEditor', { productData: aiResult.data });
        } else {
          navigation.goBack();
        }
      }, 500);
    }
  }, [aiComplete, progress]);

  useEffect(() => {
    // Fade out and in for text
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();

    // Animate progress
    const targetProgress = ((currentStep + 1) / steps.length) * 100;
    
    Animated.timing(progressAnim, {
      toValue: targetProgress,
      duration: 1500,
      useNativeDriver: false
    }).start();

    const listener = progressAnim.addListener(({ value }) => {
      setProgress(Math.round(value));
    });

    // Move to next step
    if (currentStep < steps.length - 1) {
      if (!aiComplete || currentStep < steps.length - 2) {
        setTimeout(() => setCurrentStep(currentStep + 1), 2000);
      } else if (aiComplete) {
        setTimeout(() => setCurrentStep(steps.length - 1), 2000);
      }
    }

    return () => progressAnim.removeListener(listener);
  }, [currentStep, aiComplete]);

  const radius = 80;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.container}>
      {/* Left Gradient */}
      <LinearGradient
        colors={['rgba(168, 85, 247, 0.15)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.leftGradient}
      />
      
      {/* Right Gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(236, 72, 153, 0.15)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.rightGradient}
      />

      <View style={styles.content}>
        {/* Circular Progress */}
        <View style={styles.circularProgressContainer}>
          <Svg width={radius * 2 + strokeWidth * 2} height={radius * 2 + strokeWidth * 2}>
            <Defs>
              <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#A855F7" />
                <Stop offset="50%" stopColor="#EC4899" />
                <Stop offset="100%" stopColor="#F97316" />
              </SvgLinearGradient>
            </Defs>
            {/* Background Circle */}
            <Circle
              cx={radius + strokeWidth}
              cy={radius + strokeWidth}
              r={radius}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress Circle */}
            <AnimatedCircle
              cx={radius + strokeWidth}
              cy={radius + strokeWidth}
              r={radius}
              stroke="url(#gradient)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${radius + strokeWidth}, ${radius + strokeWidth}`}
            />
          </Svg>
          
          {/* Percentage in Center */}
          <View style={styles.percentageContainer}>
            <Text style={styles.percentageText}>{progress}%</Text>
          </View>
        </View>

        {/* Fade in/out text */}
        <Animated.View style={[styles.stepTextContainer, { opacity: fadeAnim }]}>
          <Text style={styles.stepText}>{steps[currentStep]}...</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  leftGradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 150,
  },
  rightGradient: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 150,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgressContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  percentageContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_700Bold',
  },
  stepTextContainer: {
    alignItems: 'center',
  },
  stepText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
});
