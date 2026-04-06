// DrawerNavigator is not currently in use - @react-navigation/drawer package not installed
// Uncomment and install package if needed: npm install @react-navigation/drawer

/*
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { MyListingsScreen } from '../screens/MyListingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SPACING } from '../constants/theme';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const { user, logout } = useAuth();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Snap & Sell</Text>
        <Text style={styles.drawerSubtitle}>Hello, {user?.name || 'User'}</Text>
      </View>
      
      <View style={styles.drawerItems}>
        <TouchableOpacity 
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('Home')}
        >
          <Ionicons name="home-outline" size={24} color={COLORS.text} />
          <Text style={styles.drawerItemText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('Sell')}
        >
          <Ionicons name="camera-outline" size={24} color={COLORS.text} />
          <Text style={styles.drawerItemText}>Snap & Sell</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('MyListings')}
        >
          <Ionicons name="list-outline" size={24} color={COLORS.text} />
          <Text style={styles.drawerItemText}>My Listings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={24} color={COLORS.text} />
          <Text style={styles.drawerItemText}>Profile</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity 
          style={styles.drawerItem}
          onPress={logout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={[styles.drawerItemText, { color: '#FF3B30' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 280,
          backgroundColor: COLORS.background,
        },
        drawerType: 'front',
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        swipeEnabled: true,
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Sell" component={CameraScreen} />
      <Drawer.Screen name="MyListings" component={MyListingsScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  drawerHeader: {
    padding: SPACING.xl,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  drawerSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  drawerItems: {
    paddingTop: SPACING.lg,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  drawerItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
    marginHorizontal: SPACING.xl,
  },
});
*/
