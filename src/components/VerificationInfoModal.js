import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'camera',
    color: '#FF6B35',
    title: 'Photo Source',
    points: '25 points',
    description: 'Photos taken with your camera get higher trust scores than gallery uploads.',
    detail: 'Camera: 25 pts • Gallery: 10 pts',
  },
  {
    icon: 'sparkles',
    color: '#7704F4',
    title: 'AI Verification',
    points: '40 points',
    description: 'Our AI double-checks that your photo matches the description you provided.',
    detail: 'Passed: 40 pts • Failed: 20 pts',
  },
  {
    icon: 'information-circle',
    color: '#10B981',
    title: 'Photo Metadata',
    points: '15 points',
    description: 'Original photos with camera data (EXIF) prove authenticity.',
    detail: 'Complete: 15 pts • Partial: 5 pts',
  },
  {
    icon: 'time',
    color: '#3B82F6',
    title: 'Freshness',
    points: '20 points',
    description: 'Recent photos show you\'re an active seller with fresh listings.',
    detail: '<24hrs: 20 pts • <7days: 15 pts • Older: 5 pts',
  },
  {
    icon: 'trophy',
    color: '#FFD700',
    title: 'Trust Levels',
    points: '0-100 scale',
    description: 'Your total score determines your verification badge level.',
    detail: 'Gold: 80+ • Silver: 60+ • Bronze: 40+',
  },
];

export const VerificationInfoModal = ({ visible, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const modalWidth = width - 40;

  React.useEffect(() => {
    if (visible) {
      setCurrentIndex(0);
    }
  }, [visible]);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / modalWidth);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index) => {
    scrollViewRef.current?.scrollTo({ x: index * modalWidth, animated: true });
    setCurrentIndex(index);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1}
        onPress={onClose}
      >
        <View 
          style={styles.modalContainer}
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="shield-checkmark" size={24} color="#FF6B35" />
            </View>
            <Text style={styles.headerTitle}>How Verification Works</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.scrollView}
          >
            {SLIDES.map((slide, index) => (
              <View key={index} style={styles.slide}>
                <View style={[styles.iconContainer, { backgroundColor: `${slide.color}15` }]}>
                  <Ionicons name={slide.icon} size={48} color={slide.color} />
                </View>
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsText}>{slide.points}</Text>
                </View>
                <Text style={styles.slideTitle}>{slide.title}</Text>
                <Text style={styles.slideDescription}>{slide.description}</Text>
                <View style={styles.detailBox}>
                  <Text style={styles.detailText}>{slide.detail}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.pagination}>
            {SLIDES.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => scrollToIndex(index)}
                style={[
                  styles.dot,
                  currentIndex === index && styles.dotActive,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.gotItButton} onPress={onClose}>
            <Text style={styles.gotItText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    width: width - 40,
    maxWidth: 400,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    color: '#000',
    marginLeft: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    height: 380,
  },
  slide: {
    width: width - 40,
    paddingHorizontal: 30,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  pointsText: {
    fontSize: 13,
    fontFamily: 'Montserrat_700Bold',
    color: '#666',
  },
  slideTitle: {
    fontSize: 22,
    fontFamily: 'Montserrat_700Bold',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  slideDescription: {
    fontSize: 15,
    fontFamily: 'Montserrat_400Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  detailBox: {
    backgroundColor: '#F8F9FC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  detailText: {
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#444',
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#FF6B35',
  },
  gotItButton: {
    backgroundColor: '#FF6B35',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  gotItText: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    color: '#FFF',
  },
});
