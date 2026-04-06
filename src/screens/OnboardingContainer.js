import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, Dimensions, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingScreen1 } from './OnboardingScreen1';
import { OnboardingScreen2 } from './OnboardingScreen2';
import { OnboardingScreen3 } from './OnboardingScreen3';

const { width } = Dimensions.get('window');

export const OnboardingContainer = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const screens = [
    { id: '1', component: OnboardingScreen1 },
    { id: '2', component: OnboardingScreen2 },
    { id: '3', component: OnboardingScreen3 },
  ];

  const handleNext = () => {
    if (currentIndex < screens.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleGetStarted = () => {
    onComplete();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item }) => {
    const ScreenComponent = item.component;
    return (
      <View style={[styles.screenContainer, { backgroundColor: '#FFFFFF' }]}>
        <ScreenComponent onGetStarted={item.id === '3' ? handleGetStarted : undefined} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <FlatList
          ref={flatListRef}
          data={screens}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainContent: {
    flex: 1,
  },
  screenContainer: {
    width,
  },
});
