import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { MyListingsScreen } from '../screens/MyListingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { display: 'none' },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />
      <Tab.Screen
        name="Sell"
        component={CameraScreen}
      />
      <Tab.Screen
        name="My Listings"
        component={MyListingsScreen}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
};
