import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';

const LETTER_DELAY = 80;
const DURATION = 800;

const AnimatedLetter = ({ letter, index, totalLetters, fontSize = 40, snapColor = '#000', sellColor = '#F59E0B', startDelay = 0 }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(index % 2 === 0 ? -50 : 50)).current;
  const translateX = useRef(new Animated.Value((index - totalLetters / 2) * 30)).current;
  const rotate = useRef(new Animated.Value(Math.random() * 90 - 45)).current;

  useEffect(() => {
    const delay = startDelay + (index * LETTER_DELAY);
    
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: DURATION,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: DURATION,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        delay,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: 0,
        duration: DURATION,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [-45, 45],
    outputRange: ['-45deg', '45deg'],
  });

  const color = index < 4 ? snapColor : sellColor;

  return (
    <Animated.View
      style={{
        opacity,
        transform: [
          { translateY },
          { translateX },
          { scale },
          { rotate: rotateInterpolate },
        ],
      }}
    >
      <Text style={[styles.letter, { fontSize, color }]}>{letter}</Text>
    </Animated.View>
  );
};

export default function SnapSellIntro({ text = "SnapSell", fontSize, snapColor, sellColor, containerStyle, startDelay = 1000 }) {
  const letters = text.split("");
  
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.row}>
        {letters.map((char, index) => (
          <AnimatedLetter 
            key={`${char}-${index}`} 
            letter={char} 
            index={index} 
            totalLetters={letters.length}
            fontSize={fontSize}
            snapColor={snapColor}
            sellColor={sellColor}
            startDelay={startDelay}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  letter: {
    fontWeight: '500',
    textAlign: 'center',
  },
});
