import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaskedView from '@react-native-masked-view/masked-view';

export const OnboardingScreen1 = () => {
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
            <View style={styles.circleSmall}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=200' }}
                style={styles.circleImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.circleSmall}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=200' }}
                style={styles.circleImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.circleSmall}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200' }}
                style={styles.circleImage}
                resizeMode="cover"
              />
            </View>
          </View>
          <View style={styles.middleRow}>
            <View style={styles.circleSmall}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200' }}
                style={styles.circleImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.circleLarge}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300' }}
                style={styles.circleImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.circleSmall}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=200' }}
                style={styles.circleImage}
                resizeMode="cover"
              />
            </View>
          </View>
          <View style={styles.bottomRow}>
            <View style={styles.circleSmall}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200' }}
                style={styles.circleImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.circleSmall}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=200' }}
                style={styles.circleImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.circleSmall}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200' }}
                style={styles.circleImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Snap </Text>
          <MaskedView
            maskElement={<Text style={styles.title}>Once.</Text>}
          >
            <LinearGradient
              colors={['#D493FF', '#7704F4', '#FD7B3B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              locations={[0, 0.3, 1]}
            >
              <Text style={[styles.title, { opacity: 0 }]}>Once</Text>
            </LinearGradient>
          </MaskedView>
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Take a quick photo of your item. Our AI
          </Text>
          <View style={styles.descriptionRow}>
            <Text style={styles.description}>automatically </Text>
            <MaskedView
              maskElement={<Text style={styles.enhancedText}>enhances</Text>}
            >
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
        </View>

        <View style={styles.pagination}>
          <View style={styles.activeDot} />
          <View style={styles.inactiveDot} />
          <View style={styles.inactiveDot} />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity activeOpacity={0.9}>
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
  activeDot: {
    width: 32,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF7A2F',
  },
  inactiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
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
