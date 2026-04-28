import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { SplashScreen } from './src/screens/SplashScreen';
import { OnboardingContainer } from './src/screens/OnboardingContainer';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { AuthProvider } from './src/contexts/AuthContext';
import { ListingsProvider } from './src/contexts/ListingsContext';
import { CarousellWebViewProvider } from './src/contexts/CarousellWebViewContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { storageService } from './src/services/storage';

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
    // DISABLED FOR PRODUCTION: Clear platform tokens on app start
    // This was for development only - keeping sessions persistent now
    // const clearTokens = async () => {
    //   try {
    //     const user = await storageService.getUser();
    //     if (user) {
    //       await storageService.clearAllPlatformTokens(user.id);
    //     }
    //   } catch (error) {
    //     console.error('Error clearing tokens:', error);
    //   }
    // };
    // clearTokens();
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
        <CarousellWebViewProvider>
          <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />
          <ExpoStatusBar style="auto" />
          <AppNavigator />
        </CarousellWebViewProvider>
      </ListingsProvider>
    </AuthProvider>
  );
}
