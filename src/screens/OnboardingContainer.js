import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Animated, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingScreen1 } from './OnboardingScreen1';
import { OnboardingScreen2 } from './OnboardingScreen2';
import { OnboardingScreen3 } from './OnboardingScreen3';

const { width } = Dimensions.get('window');

export const OnboardingContainer = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const screens = [
    { id: '1', component: OnboardingScreen1 },
    { id: '2', component: OnboardingScreen2 },
    { id: '3', component: OnboardingScreen3 },
  ];

  const handleNext = () => {
    if (currentIndex < screens.length - 1) {
      flatListRef.current?.scrollToIndex({ 
        index: currentIndex + 1,
        animated: true 
      });
    }
  };

  const handleGetStarted = () => {
    onComplete();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item, index }) => {
    const ScreenComponent = item.component;

    return (
      <View style={styles.screenContainer}>
        <ScreenComponent 
          onNext={handleNext}
          onGetStarted={handleGetStarted}
          currentIndex={currentIndex}
          isActive={index === currentIndex}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <FlatList
        ref={flatListRef}
        data={screens}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  screenContainer: {
    width,
  },
});
