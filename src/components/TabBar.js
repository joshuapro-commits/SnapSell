import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const TabBar = ({ navigation, activeTab }) => {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons 
          name={activeTab === 'Home' ? 'home' : 'home-outline'} 
          size={20} 
          color={activeTab === 'Home' ? '#000' : '#666'} 
        />
        <Text style={activeTab === 'Home' ? styles.navLabelActive : styles.navLabel}>
          Home
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('My Listings')}
      >
        <Ionicons 
          name={activeTab === 'My Listings' ? 'list' : 'list-outline'} 
          size={20} 
          color={activeTab === 'My Listings' ? '#000' : '#666'} 
        />
        <Text style={activeTab === 'My Listings' ? styles.navLabelActive : styles.navLabel}>
          My Listings
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('Profile')}
      >
        <Ionicons 
          name={activeTab === 'Profile' ? 'person' : 'person-outline'} 
          size={20} 
          color={activeTab === 'Profile' ? '#000' : '#666'} 
        />
        <Text style={activeTab === 'Profile' ? styles.navLabelActive : styles.navLabel}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    paddingBottom: 28,
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
