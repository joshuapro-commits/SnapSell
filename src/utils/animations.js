import { Animated, Easing } from 'react-native';

export const createFadeIn = (duration = 400) => {
  const opacity = new Animated.Value(0);
  Animated.timing(opacity, {
    toValue: 1,
    duration,
    useNativeDriver: true,
    easing: Easing.out(Easing.ease),
  }).start();
  return opacity;
};

export const createSlideUp = (duration = 400) => {
  const translateY = new Animated.Value(20);
  Animated.timing(translateY, {
    toValue: 0,
    duration,
    useNativeDriver: true,
    easing: Easing.out(Easing.ease),
  }).start();
  return translateY;
};

export const createScale = (duration = 200) => {
  const scale = new Animated.Value(0.95);
  Animated.spring(scale, {
    toValue: 1,
    friction: 8,
    tension: 40,
    useNativeDriver: true,
  }).start();
  return scale;
};

export const pressAnimation = (scale) => {
  Animated.sequence([
    Animated.timing(scale, {
      toValue: 0.96,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }),
  ]).start();
};
