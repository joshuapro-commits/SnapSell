import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { ListingEditorScreen } from '../screens/ListingEditorScreen';
import { ListingSuccessScreen } from '../screens/ListingSuccessScreen';
import { AnalyzingScreen } from '../screens/AnalyzingScreen';
import { MainTabs } from './MainTabs';
import { COLORS, FONT_SIZES } from '../constants/theme';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: [],
  config: {
    screens: {},
  },
};

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  return (
    <NavigationContainer
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
          animation: 'fade_from_bottom',
          animationDuration: 300,
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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
