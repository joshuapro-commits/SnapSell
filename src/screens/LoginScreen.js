import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { useAuth } from '../contexts/AuthContext';

export const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const animationRef = useRef(null);

  useEffect(() => {
    animationRef.current?.play();
  }, []);

  const handlePhoneEmail = () => {
    login('demo@snapsell.com', 'demo123');
  };

  const handleGoogleSignup = () => {
    login('demo@snapsell.com', 'demo123');
  };

  const handleFacebookSignup = () => {
    login('demo@snapsell.com', 'demo123');
  };

  const handleAppleSignup = () => {
    login('demo@snapsell.com', 'demo123');
  };

  const handleCreateAccount = () => {
    login('demo@snapsell.com', 'demo123');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Lottie Animation */}
        <LottieView
          ref={animationRef}
          source={require('../../assets/Login Character Animation.json')}
          style={styles.animation}
          autoPlay
          loop
        />

        {/* Title */}
        <Text style={styles.title}>Let's you in</Text>

        {/* Social Login Buttons */}
        <TouchableOpacity style={styles.socialButton} onPress={handleFacebookSignup}>
          <Ionicons name="logo-facebook" size={24} color="#1877F2" />
          <Text style={styles.socialButtonText}>Continue with Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignup}>
          <Ionicons name="logo-google" size={24} color="#DB4437" />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} onPress={handleAppleSignup}>
          <Ionicons name="logo-apple" size={24} color="#000" />
          <Text style={styles.socialButtonText}>Continue with Apple</Text>
        </TouchableOpacity>

        {/* Divider */}
        <Text style={styles.dividerText}>or  Log in with</Text>

        {/* Phone/Email Button */}
        <TouchableOpacity style={styles.primaryButton} onPress={handlePhoneEmail}>
          <Text style={styles.primaryButtonText}>Phone Number/Email</Text>
        </TouchableOpacity>

        {/* Create Account */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>New to Leafboard? </Text>
          <TouchableOpacity onPress={handleCreateAccount}>
            <Text style={styles.signupLink}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  animation: {
    width: 280,
    height: 280,
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    color: '#1A1D1F',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'Montserrat_600SemiBold',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    gap: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D1F',
    fontFamily: 'Montserrat_600SemiBold',
  },
  dividerText: {
    fontSize: 14,
    color: '#6A707C',
    textAlign: 'center',
    marginVertical: 32,
    fontFamily: 'Montserrat_400Regular',
  },
  primaryButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupText: {
    fontSize: 15,
    color: '#1A1D1F',
    fontFamily: 'Montserrat_400Regular',
  },
  signupLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1D1F',
    fontFamily: 'Montserrat_700Bold',
  },
});
