import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SPACING } from '../constants/theme';

const { width } = Dimensions.get('window');
const MENU_WIDTH = 280;

export const SideMenu = ({ visible, onClose, navigation }) => {
  const { user, logout } = useAuth();
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -MENU_WIDTH,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  const handleNavigation = (screen) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -MENU_WIDTH,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
      setTimeout(() => {
        navigation.navigate(screen);
      }, 50);
    });
  };

  const handleLogout = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -MENU_WIDTH,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
      setTimeout(() => {
        logout();
      }, 50);
    });
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -MENU_WIDTH,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: fadeAnim
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          activeOpacity={1} 
          onPress={handleClose}
        />
        <Animated.View 
          style={[
            styles.menuContainer,
            {
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Snap & Sell</Text>
            <Text style={styles.menuSubtitle}>Hello, {user?.name || 'User'}</Text>
          </View>
          
          <View style={styles.menuItems}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleNavigation('Home')}
            >
              <Ionicons name="home-outline" size={24} color={COLORS.text} />
              <Text style={styles.menuItemText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleNavigation('Sell')}
            >
              <Ionicons name="camera-outline" size={24} color={COLORS.text} />
              <Text style={styles.menuItemText}>Snap & Sell</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleNavigation('MyListings')}
            >
              <Ionicons name="list-outline" size={24} color={COLORS.text} />
              <Text style={styles.menuItemText}>My Listings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleNavigation('Profile')}
            >
              <Ionicons name="person-outline" size={24} color={COLORS.text} />
              <Text style={styles.menuItemText}>Profile</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
              <Text style={[styles.menuItemText, { color: '#FF3B30' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  overlayTouchable: {
    flex: 1,
  },
  menuContainer: {
    width: MENU_WIDTH,
    height: '100%',
    backgroundColor: COLORS.background,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  menuHeader: {
    padding: SPACING.xl,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  menuSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  menuItems: {
    paddingTop: SPACING.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
    marginHorizontal: SPACING.xl,
  },
});
