import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useListings } from '../contexts/ListingsContext';

export const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { myListings } = useListings();

  const monthlyData = [
    { month: 'JAN', amount: 5000 },
    { month: 'FEB', amount: 8000 },
    { month: 'MAR', amount: 15000 },
    { month: 'APR', amount: 12000 },
    { month: 'MAY', amount: 18000 },
    { month: 'JUN', amount: 10000 },
  ];

  const maxAmount = Math.max(...monthlyData.map(d => d.amount));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.logo}>SnapSell</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#FFF" />
          </View>
          <View style={styles.levelBadge}>
            <Ionicons name="star" size={12} color="#FFF" />
            <Text style={styles.levelText}>Level 3 Seller</Text>
          </View>
        </View>
        <Text style={styles.userName}>Alex Reyes</Text>
        <Text style={styles.userHandle}>@alexreyes_de</Text>
      </View>

      {/* Earnings Summary */}
      <View style={styles.earningsSection}>
        <View style={styles.earningsHeader}>
          <Text style={styles.earningsTitle}>Earnings Summary</Text>
          <Text style={styles.earningsPeriod}>Last 30 Days</Text>
        </View>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>₱42,580</Text>
          <View style={styles.percentageContainer}>
            <Ionicons name="trending-up" size={14} color="#00D9A5" />
            <Text style={styles.percentageText}>+18%</Text>
          </View>
        </View>
        <View style={styles.chartContainer}>
          {monthlyData.map((item, index) => (
            <View key={index} style={styles.chartColumn}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar,
                    { 
                      height: `${(item.amount / maxAmount) * 100}%`,
                      backgroundColor: item.month === 'MAR' ? '#FF6B35' : '#E0E0E0'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.monthLabel}>{item.month}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Premium Card */}
      <TouchableOpacity style={styles.premiumCardWrapper}>
        <LinearGradient
          colors={['#7C3AED', '#FF6B35']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.premiumCard}
        >
          <View style={styles.premiumContent}>
            <Text style={styles.premiumTitle}>SnapSell Premium</Text>
            <Text style={styles.premiumSubtitle}>Boost your sales with{"\n"}Unlimited listings & AI Pro{"\n"}selling tools.</Text>
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.premiumDecoration}>
            <View style={[styles.star, { top: 20, right: 30 }]} />
            <View style={[styles.star, { top: 60, right: 20 }]} />
            <View style={[styles.star, { bottom: 40, right: 40 }]} />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: '#E8F9F4' }]}>
              <Ionicons name="people" size={20} color="#00D9A5" />
            </View>
            <Text style={styles.menuItemText}>Invite Friends</Text>
          </View>
          <View style={styles.menuItemRight}>
            <Text style={styles.rewardText}>Get ₱50</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: '#F5F5F5' }]}>
              <Ionicons name="settings-outline" size={20} color="#666" />
            </View>
            <Text style={styles.menuItemText}>Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: '#F5F5F5' }]}>
              <Ionicons name="help-circle-outline" size={20} color="#666" />
            </View>
            <Text style={styles.menuItemText}>Help Center</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={logout}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: '#FFE8E8' }]}>
              <Ionicons name="log-out-outline" size={20} color="#FF4444" />
            </View>
            <Text style={[styles.menuItemText, { color: '#FF4444' }]}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>v1.2.0 - BUILT FOR THE PINOY SELLER.</Text>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home-outline" size={20} color="#666" />
          <Text style={styles.navLabel}>Home</Text>
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
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={20} color="#000" />
          <Text style={styles.navLabelActive}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFF',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B35',
    fontFamily: 'Montserrat_700Bold',
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFF',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: [{ translateX: -50 }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Montserrat_700Bold',
  },
  userHandle: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
  earningsSection: {
    backgroundColor: '#FFF',
    marginTop: 12,
    padding: 20,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  earningsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Montserrat_700Bold',
  },
  earningsPeriod: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
  balanceContainer: {
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00D9A5',
    fontFamily: 'Montserrat_600SemiBold',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingHorizontal: 8,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  barContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 24,
    borderRadius: 6,
  },
  monthLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  premiumCardWrapper: {
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  premiumCard: {
    padding: 24,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  premiumContent: {
    zIndex: 1,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  premiumSubtitle: {
    fontSize: 13,
    color: '#FFF',
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.9,
    fontFamily: 'Montserrat_400Regular',
  },
  upgradeButton: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7C3AED',
    fontFamily: 'Montserrat_700Bold',
  },
  premiumDecoration: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '40%',
  },
  star: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ rotate: '45deg' }],
    borderRadius: 6,
  },
  menuSection: {
    backgroundColor: '#FFF',
    marginTop: 12,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Montserrat_600SemiBold',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6B35',
    fontFamily: 'Montserrat_700Bold',
  },
  footer: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 32,
    fontFamily: 'Montserrat_400Regular',
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
