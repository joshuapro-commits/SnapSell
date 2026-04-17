import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { MyListingsScreen } from '../screens/MyListingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: 90,
          paddingTop: 10,
          paddingBottom: 30,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Montserrat_500Medium',
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="My Listings"
        component={MyListingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={20} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
