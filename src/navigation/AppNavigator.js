import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { MainTabs } from './MainTabs';
import { COLORS, FONT_SIZES } from '../constants/theme';

const Stack = createNativeStackNavigator();

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

const NAVIGATION_STATE_KEY = '@snap_sell_navigation_state';

export const AppNavigator = () => {
  const { user, loading } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();
  const navigationRef = useRef();

  // Restore navigation state on app start (only if user is logged in)
  useEffect(() => {
    const restoreState = async () => {
      try {
        // Only restore state if user is logged in
        if (user) {
          const savedStateString = await AsyncStorage.getItem(NAVIGATION_STATE_KEY);
          const state = savedStateString ? JSON.parse(savedStateString) : undefined;

          if (state !== undefined) {
            console.log('[Navigation] Restoring state');
            setInitialState(state);
          }
        } else {
          // Clear saved state if no user
          await AsyncStorage.removeItem(NAVIGATION_STATE_KEY);
          console.log('[Navigation] Cleared state (no user)');
        }
      } catch (e) {
        console.log('[Navigation] Failed to restore state:', e);
        // Clear corrupted state
        await AsyncStorage.removeItem(NAVIGATION_STATE_KEY);
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady && !loading) {
      restoreState();
    }
  }, [isReady, loading, user]);

  // Clear navigation state when user logs out
  useEffect(() => {
    if (!user && isReady) {
      AsyncStorage.removeItem(NAVIGATION_STATE_KEY);
      console.log('[Navigation] Cleared state (user logged out)');
    }
  }, [user, isReady]);

  // Don't render until auth check and state restoration complete
  if (!isReady || loading) {
    return <View style={{ flex: 1, backgroundColor: '#F5F5F5' }} />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      initialState={initialState}
      onStateChange={(state) => {
        // Only save state if user is logged in
        if (user) {
          try {
            AsyncStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify(state));
          } catch (e) {
            console.log('[Navigation] Failed to save state:', e);
          }
        }
      }}
      onReady={() => {
        console.log('[Navigation] Container ready');
      }}
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
          animation: 'ios_from_right',
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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
