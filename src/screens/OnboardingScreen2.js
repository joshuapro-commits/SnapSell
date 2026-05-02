import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export const OnboardingScreen2 = ({ onNext, currentIndex, isActive }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(50)).current;

  const indicator1Width = useRef(new Animated.Value(currentIndex === 0 ? 32 : 8)).current;
  const indicator2Width = useRef(new Animated.Value(currentIndex === 1 ? 32 : 8)).current;
  const indicator3Width = useRef(new Animated.Value(currentIndex === 2 ? 32 : 8)).current;

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(card1Anim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
          delay: 100,
        }),
        Animated.spring(card2Anim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
          delay: 200,
        }),
        Animated.spring(textAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
          delay: 300,
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
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="close" size={28} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Two Containers Side by Side */}
        <View style={styles.cardsContainer}>
          {/* Left Container - Plain Image */}
          <Animated.View 
            style={[
              styles.card,
              {
                opacity: card1Anim,
                transform: [
                  { scale: card1Anim },
                  {
                    translateX: card1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400' }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            {/* Camera Frame Overlay */}
            <View style={styles.cameraFrame}>
              <View style={styles.cameraCornerTL} />
              <View style={styles.cameraCornerTR} />
              <View style={styles.cameraCornerBL} />
              <View style={styles.cameraCornerBR} />
            </View>
            <View style={styles.beforeBadge}>
              <Text style={styles.beforeText}>BEFORE</Text>
            </View>
          </Animated.View>

          {/* Right Container - Image with Details Overlay */}
          <Animated.View 
            style={[
              styles.card,
              {
                opacity: card2Anim,
                transform: [
                  { scale: card2Anim },
                  {
                    translateX: card2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400' }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={styles.overlay}>
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={12} color="#FFFFFF" />
                <Text style={styles.aiText}>AI ENHANCED</Text>
              </View>
              
              <View style={styles.detailsCard}>
                <View style={styles.detailsHeader}>
                  <Text style={styles.productTitle} numberOfLines={1} ellipsizeMode="tail">
                    Louis Vuitton Bag
                  </Text>
                  <Text style={styles.productPrice}>₱45,000</Text>
                </View>
                
                <Text style={styles.productDescription}>
                  Authentic luxury handbag in excellent condition. Classic design with premium leather.
                </Text>
                
                <View style={styles.tagsRow}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>#Luxury</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>#Fashion</Text>
                  </View>
                </View>
              </View>
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
          <View style={styles.titleContainer}>
            <Text style={styles.titleWhite}>AI Does the{' '}</Text>
            <MaskedView
              maskElement={<Text style={styles.titleMask}>Magic</Text>}
            >
              <LinearGradient
                colors={['#D493FF', '#7704F4', '#FD7B3B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                locations={[0, 0.3, 1]}
              >
                <Text style={[styles.titleMask, { opacity: 0 }]}>Magic</Text>
              </LinearGradient>
            </MaskedView>
          </View>
          
          <Text style={styles.description}>
            Our AI analyzes your photo and instantly creates a complete listing
          </Text>
        </Animated.View>

        <View style={styles.pagination}>
          <Animated.View style={[styles.dot, { width: indicator1Width, backgroundColor: currentIndex === 0 ? '#FF7A2F' : '#CBD5E1' }]} />
          <Animated.View style={[styles.dot, { width: indicator2Width, backgroundColor: currentIndex === 1 ? '#FF7A2F' : '#CBD5E1' }]} />
          <Animated.View style={[styles.dot, { width: indicator3Width, backgroundColor: currentIndex === 2 ? '#FF7A2F' : '#CBD5E1' }]} />
        </View>
      </View>

      {/* Footer */}
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
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  card: {
    width: 165,
    height: 260,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  beforeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  beforeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: 'Montserrat_700Bold',
  },
  cameraFrame: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
  },
  cameraCornerTL: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#FFFFFF',
    borderTopLeftRadius: 4,
  },
  cameraCornerTR: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#FFFFFF',
    borderTopRightRadius: 4,
  },
  cameraCornerBL: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  cameraCornerBR: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#FFFFFF',
    borderBottomRightRadius: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    justifyContent: 'space-between',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7704F4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  aiText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: 'Montserrat_700Bold',
  },
  detailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 12,
    gap: 6,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    fontFamily: 'Montserrat_700Bold',
    numberOfLines: 2,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7704F4',
    fontFamily: 'Montserrat_700Bold',
  },
  productDescription: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
    fontFamily: 'Montserrat_400Regular',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#475569',
    fontFamily: 'Montserrat_600SemiBold',
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
    marginTop: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'center',
  },
  titleWhite: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    fontFamily: 'Montserrat_700Bold',
  },
  titleMask: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'Montserrat_700Bold',
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Montserrat_400Regular',
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
