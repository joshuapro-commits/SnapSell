import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { LoginFormScreen } from '../screens/LoginFormScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { ListingEditorScreen } from '../screens/ListingEditorScreen';
import { ListingSuccessScreen } from '../screens/ListingSuccessScreen';
import { AnalyzingScreen } from '../screens/AnalyzingScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { ConnectPlatformsScreen } from '../screens/ConnectPlatformsScreen';
import { FacebookLoginWebView } from '../screens/FacebookLoginWebView';
import { FacebookUnifiedWebView } from '../screens/FacebookUnifiedWebView';
import { CarousellWebView } from '../screens/CarousellWebView';
import { CarousellNativeAuthScreen } from '../screens/CarousellNativeAuthScreen';
import { EarningsScreen } from '../screens/EarningsScreen';
import InventoryDashboardScreen from '../screens/InventoryDashboardScreen';
import { MainTabs } from './MainTabs';
import { COLORS, FONT_SIZES } from '../constants/theme';

const Stack = createStackNavigator();

const linking = {
  prefixes: ['snapsell://', 'exp://'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Home: 'home',
          Sell: 'sell',
          MyListings: 'listings',
          Profile: 'profile',
        },
      },
      CarousellNativeAuth: 'oauth/callback',
    },
  },
};

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: '#F5F5F5' }} />;
  }

  return (
    <NavigationContainer
      linking={linking}
      fallback={<View style={{ flex: 1, backgroundColor: '#F5F5F5' }} />}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.surface,
          },
          headerTitleStyle: {
            fontSize: FONT_SIZES.lg,
            fontWeight: '700',
            color: COLORS.text,
          },
          headerTintColor: COLORS.primary,
          headerShadowVisible: false,
          ...TransitionPresets.SlideFromRightIOS,
        }}
      >
        {!user ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="LoginForm"
              component={LoginFormScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Sell"
              component={CameraScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ListingEditor"
              component={ListingEditorScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ListingSuccess"
              component={ListingSuccessScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AnalyzingScreen"
              component={AnalyzingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ConnectPlatforms"
              component={ConnectPlatformsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="FacebookLoginWebView"
              component={FacebookLoginWebView}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="FacebookUnifiedWebView"
              component={FacebookUnifiedWebView}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CarousellNativeAuth"
              component={CarousellNativeAuthScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CarousellWebView"
              component={CarousellWebView}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Earnings"
              component={EarningsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="InventoryDashboard"
              component={InventoryDashboardScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
