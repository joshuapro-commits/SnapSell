import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { useAuth } from '../contexts/AuthContext';
import { storageService } from '../services/storage';

export const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const animationRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    animationRef.current?.play();
  }, []);

  const handlePhoneEmail = async () => {
    // Navigate to login form instead of auto-login
    navigation.navigate('LoginForm');
  };

  const handleGoogleSignup = async () => {
    navigation.navigate('LoginForm');
  };

  const handleFacebookSignup = async () => {
    navigation.navigate('LoginForm');
  };

  const handleAppleSignup = async () => {
    navigation.navigate('LoginForm');
  };

  const handleCreateAccount = async () => {
    navigation.navigate('Signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
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
        <Text style={styles.dividerText}>or Log in with</Text>

        {/* Phone/Email Button */}
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handlePhoneEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Phone Number/Email</Text>
          )}
        </TouchableOpacity>


        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  animation: {
    width: 220,
    height: 220,
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1A1D1F',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Montserrat_600SemiBold',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 12,
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
    marginVertical: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  primaryButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    fontFamily: 'Montserrat_600SemiBold',
  },

});
