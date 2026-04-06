import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen } from './src/screens/SplashScreen';
import { OnboardingContainer } from './src/screens/OnboardingContainer';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { AuthProvider } from './src/contexts/AuthContext';
import { ListingsProvider } from './src/contexts/ListingsContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    // Removed automatic timer - let SplashScreen animation control the transition
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  if (showSplash) {
    return <SplashScreen onContinue={() => setShowSplash(false)} />;
  }

  if (showOnboarding) {
    return <OnboardingContainer onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <AuthProvider>
      <ListingsProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </ListingsProvider>
    </AuthProvider>
  );
}
