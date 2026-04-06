import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useAuth } from '../contexts/AuthContext';
import Svg, { Circle, Path, Rect, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

export const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const userName = user?.name?.split(' ')[0] || 'User';
  const floatAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarButton}>
            <Ionicons name="person-circle-outline" size={24} color="#000" />
          </View>
          <Text style={styles.appName}>Snapsell</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Title */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.mainTitle}>Ready to sell </Text>
            <MaskedView
              maskElement={<Text style={styles.mainTitle}>something</Text>}
            >
              <LinearGradient
                colors={['#D493FF', '#7704F4', '#FD7B3B']}
                locations={[0, 0.3, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.mainTitle, { opacity: 0 }]}>something</Text>
              </LinearGradient>
            </MaskedView>
          </View>
          <MaskedView
            maskElement={<Text style={styles.mainTitle}>today?</Text>}
          >
            <LinearGradient
              colors={['#D493FF', '#7704F4', '#FD7B3B']}
              locations={[0, 0.3, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.mainTitle, { opacity: 0 }]}>today?</Text>
            </LinearGradient>
          </MaskedView>
        </View>

        {/* Reminder Card */}
        <View style={styles.reminderCardWrapper}>
          <LinearGradient
            colors={['#D493FF', '#7704F4', '#FD7B3B']}
            locations={[0, 0.3, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.reminderCard}
          >
            <View style={styles.reminderContent}>
              <View style={styles.reminderTextContainer}>
                <Text style={styles.reminderTitle}>Turn clutter into cash</Text>
                <Text style={styles.reminderSubtitle}>Just snap a photo of your item and the AI will do the rest.</Text>
                <TouchableOpacity 
                  style={styles.setNowButton}
                  onPress={() => navigation.navigate('Sell')}
                >
                  <View style={styles.setNowButtonWhite}>
                    <Ionicons name="camera" size={16} color="#7704F4" />
                    <Text style={styles.setNowButtonText}>Sell Now</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.bellIconContainer}>
                <View style={styles.vaseIconWrapper}>
                  <Ionicons name="wine-outline" size={60} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Cards Grid */}
        <View style={styles.statsGrid}>
          {/* Left Card - Total Earnings */}
          <LinearGradient
            colors={['#F8FFF8', '#F0FFF0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.statCardLarge}
          >
            <View style={styles.statCardHeader}>
              <View style={styles.statCardIcon}>
                <Ionicons name="cash-outline" size={24} color="#000" />
              </View>
              <TouchableOpacity style={styles.statCardButton}>
                <Ionicons name="ellipse" size={20} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.statCardTitle}>Total Earnings</Text>
            <Text style={styles.statCardValue}>₱0</Text>
            <View style={styles.decorativeIconContainer}>
              <Ionicons name="wallet-outline" size={70} color="rgba(0,0,0,0.08)" />
            </View>
          </LinearGradient>

          {/* Right Cards Stack */}
          <View style={styles.statsRightColumn}>
            {/* Active Listings */}
            <View style={[styles.statCardSmall, { backgroundColor: '#FFF5F5' }]}>
              <View style={styles.statCardHeader}>
                <View style={styles.statCardIcon}>
                  <Ionicons name="pricetag-outline" size={20} color="#000" />
                </View>
                <TouchableOpacity style={styles.statCardButton}>
                  <Ionicons name="checkmark-circle" size={20} color="#000" />
                </TouchableOpacity>
              </View>
              <Text style={styles.statCardTitleSmall}>Active Listings</Text>
              <Text style={styles.statCardValueSmall}>0</Text>
            </View>

            {/* Items Sold */}
            <View style={[styles.statCardSmall, { backgroundColor: '#FFF9F5' }]}>
              <View style={styles.statCardHeader}>
                <View style={styles.statCardIcon}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#000" />
                </View>
                <TouchableOpacity style={styles.statCardButton}>
                  <Ionicons name="alarm-outline" size={20} color="#000" />
                </TouchableOpacity>
              </View>
              <Text style={styles.statCardTitleSmall}>Items Sold</Text>
              <Text style={styles.statCardValueSmall}>0</Text>
            </View>
          </View>
        </View>

        {/* Recent Listings Section */}
        <View style={styles.recentListingsSection}>
          <View style={styles.recentListingsHeader}>
            <Text style={styles.recentListingsTitle}>Recent Listings</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {/* Listing Item 1 */}
          <View style={styles.listingItem}>
            <View style={styles.listingLeft}>
              <View style={[styles.listingIconCircle, { backgroundColor: '#FFE8D6' }]}>
                <Ionicons name="laptop-outline" size={20} color="#FF8C42" />
              </View>
              <View style={styles.listingTextContainer}>
                <Text style={styles.listingItemTitle}>MacBook Pro 2021</Text>
                <View style={styles.listingSubtextRow}>
                  <Text style={styles.listingPrice}>₱45,000</Text>
                  <View style={styles.platformLogos}>
                    <View style={styles.fbLogo}>
                      <Ionicons name="logo-facebook" size={12} color="#1877F2" />
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.listingRight}>
              <View style={[styles.listingCheckCircle, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="checkmark" size={16} color="#FFF" />
              </View>
            </View>
          </View>

          {/* Listing Item 2 */}
          <View style={styles.listingItem}>
            <View style={styles.listingLeft}>
              <View style={[styles.listingIconCircle, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="shirt-outline" size={20} color="#66BB6A" />
              </View>
              <View style={styles.listingTextContainer}>
                <Text style={styles.listingItemTitle}>Nike Air Jordan 1</Text>
                <View style={styles.listingSubtextRow}>
                  <Text style={styles.listingPrice}>₱8,500</Text>
                  <View style={styles.platformLogos}>
                    <View style={styles.carousellLogo}>
                      <Ionicons name="bag-handle" size={12} color="#FF4444" />
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.listingRight}>
              <View style={[styles.listingCheckCircle, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="checkmark" size={16} color="#FFF" />
              </View>
            </View>
          </View>

          {/* Listing Item 3 */}
          <View style={styles.listingItem}>
            <View style={styles.listingLeft}>
              <View style={[styles.listingIconCircle, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="watch-outline" size={20} color="#AB47BC" />
              </View>
              <View style={styles.listingTextContainer}>
                <Text style={styles.listingItemTitle}>Apple Watch Series 7</Text>
                <View style={styles.listingSubtextRow}>
                  <Text style={styles.listingPrice}>₱18,000</Text>
                  <View style={styles.platformLogos}>
                    <View style={styles.fbLogo}>
                      <Ionicons name="logo-facebook" size={12} color="#1877F2" />
                    </View>
                    <View style={styles.carousellLogo}>
                      <Ionicons name="bag-handle" size={12} color="#FF4444" />
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.listingRight}>
              <View style={[styles.listingCheckCircle, styles.listingCheckCircleEmpty]} />
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={20} color="#000" />
          <Text style={styles.navLabelActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Sell')}
        >
          <View style={styles.sellButton}>
            <Ionicons name="add" size={28} color="#FFF" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('My Listings')}
        >
          <Ionicons name="list-outline" size={20} color="#666" />
          <Text style={styles.navLabel}>My Listings</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={20} color="#666" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FAFAFA' 
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Montserrat_600SemiBold',
  },
  notificationButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '400',
    color: '#000',
    lineHeight: 36,
    fontFamily: 'Montserrat_400Regular',
  },
  boldText: {
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
  reminderCardWrapper: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  reminderCard: {
    borderRadius: 20,
    padding: 24,
    paddingVertical: 28,
  },
  reminderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderTextContainer: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 6,
    fontFamily: 'Montserrat_700Bold',
  },
  reminderSubtitle: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 2,
    fontFamily: 'Montserrat_400Regular',
  },
  setNowButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  setNowButtonWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  setNowButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7704F4',
    fontFamily: 'Montserrat_600SemiBold',
  },
  bellIconContainer: {
    marginLeft: 0,
  },
  vaseIconWrapper: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCardLarge: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    minHeight: 200,
  },
  statsRightColumn: {
    flex: 1,
    gap: 12,
  },
  statCardSmall: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCardButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Montserrat_700Bold',
  },
  decorativeIconContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  statCardTitleSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  statCardValueSmall: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Montserrat_700Bold',
  },

  recentListingsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  recentListingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentListingsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Montserrat_600SemiBold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF8C42',
    fontFamily: 'Montserrat_500Medium',
  },
  listingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  listingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listingIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listingTextContainer: {
    flex: 1,
  },
  listingItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  listingSubtextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listingPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Montserrat_600SemiBold',
  },
  platformLogos: {
    flexDirection: 'row',
    gap: 6,
  },
  fbLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E7F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carousellLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFE8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listingCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingCheckCircleEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    paddingBottom: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  sellButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7704F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  navLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  navLabelActive: {
    fontSize: 10,
    color: '#000',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
});
