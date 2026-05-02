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
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@snap_sell_onboarding_complete';
const FIRST_LAUNCH_KEY = '@snap_sell_first_launch';

export default function App() {
  const [showSplash, setShowSplash] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    // Check if this is first launch and if onboarding is complete
    const checkAppState = async () => {
      try {
        const isFirstLaunch = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
        const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_KEY);
        
        console.log('[APP] First launch:', isFirstLaunch === null);
        console.log('[APP] Onboarding completed:', onboardingComplete === 'true');
        
        if (isFirstLaunch === null) {
          // First time ever opening the app
          await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'true');
          setShowSplash(true);
          setShowOnboarding(true);
        } else if (onboardingComplete !== 'true') {
          // Not first launch but onboarding not complete
          setShowSplash(true);
          setShowOnboarding(true);
        } else {
          // Returning user - skip splash and onboarding
          setShowSplash(false);
          setShowOnboarding(false);
        }
      } catch (error) {
        console.error('[APP] Error checking app state:', error);
        setShowSplash(true);
        setShowOnboarding(true);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    checkAppState();
  }, []);

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      console.log('[APP] Onboarding marked as complete');
      setShowOnboarding(false);
    } catch (error) {
      console.error('[APP] Error saving onboarding status:', error);
      setShowOnboarding(false);
    }
  };

  if (!fontsLoaded || isCheckingOnboarding) {
    return null;
  }

  if (showSplash) {
    return <SplashScreen onContinue={() => setShowSplash(false)} />;
  }

  if (showOnboarding) {
    return <OnboardingContainer onComplete={handleOnboardingComplete} />;
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
