import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';

export const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();

  const handleEmailSignup = () => {
    // Navigate to email signup or login with demo account
    login('demo@snapsell.com', 'demo123');
  };

  const handleGoogleSignup = () => {
    // Handle Google signup
    login('demo@snapsell.com', 'demo123');
  };

  const handleFacebookSignup = () => {
    // Handle Facebook signup
    login('demo@snapsell.com', 'demo123');
  };

  const handleAppleSignup = () => {
    // Handle Apple signup
    login('demo@snapsell.com', 'demo123');
  };

  const handleSignIn = () => {
    // Navigate to sign in or use demo
    login('demo@snapsell.com', 'demo123');
  };

  const handleGuestView = () => {
    // Handle login
    login('demo@snapsell.com', 'demo123');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <Image 
        source={require('../../assets/Screenshot_2026-04-02_055309-removebg-preview.png')} 
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Welcome Text */}
      <Text style={styles.welcomeTitle}>Welcome back</Text>
      <Text style={styles.welcomeSubtitle}>SnapSell - Snap it and sell it</Text>

      {/* Sign up with Email Button */}
      <TouchableOpacity style={styles.emailButton} onPress={handleEmailSignup}>
        <View style={styles.buttonContent}>
          <Ionicons name="mail-outline" size={20} color="#FFF" />
          <Text style={styles.emailButtonText}>Sign up with Email</Text>
        </View>
      </TouchableOpacity>

      {/* Sign in with Google Button */}
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignup}>
        <View style={styles.buttonContent}>
          <Ionicons name="logo-google" size={20} color="#DB4437" />
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </View>
      </TouchableOpacity>

      {/* Sign in with Facebook Button */}
      <TouchableOpacity style={styles.facebookButton} onPress={handleFacebookSignup}>
        <View style={styles.buttonContent}>
          <Ionicons name="logo-facebook" size={20} color="#1877F2" />
          <Text style={styles.facebookButtonText}>Sign in with Facebook</Text>
        </View>
      </TouchableOpacity>

      {/* Sign in with Apple Button */}
      <TouchableOpacity style={styles.appleButton} onPress={handleAppleSignup}>
        <View style={styles.buttonContent}>
          <Ionicons name="logo-apple" size={20} color="#000" />
          <Text style={styles.appleButtonText}>Sign in with Apple</Text>
        </View>
      </TouchableOpacity>

      {/* Divider */}
      <Text style={styles.dividerText}>or</Text>

      {/* Already have account */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={handleGuestView}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 40,
    fontFamily: 'Montserrat_400Regular',
  },
  emailButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    marginBottom: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emailButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFF',
    fontFamily: 'Montserrat_500Medium',
  },
  googleButton: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    fontFamily: 'Montserrat_500Medium',
  },
  facebookButton: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  facebookButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    fontFamily: 'Montserrat_500Medium',
  },
  appleButton: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  appleButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    fontFamily: 'Montserrat_500Medium',
  },
  dividerText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 13,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    textDecorationLine: 'underline',
    fontFamily: 'Montserrat_600SemiBold',
  },
});
