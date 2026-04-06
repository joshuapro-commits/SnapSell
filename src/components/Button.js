import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { pressAnimation } from '../utils/animations';

export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  style 
}) => {
  const isDisabled = disabled || loading;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    pressAnimation(scaleAnim);
    onPress?.();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.button,
          variant === 'primary' && styles.primaryButton,
          variant === 'secondary' && styles.secondaryButton,
          variant === 'outline' && styles.outlineButton,
          isDisabled && styles.disabledButton,
          style,
        ]}
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={1}
      >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.surface} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === 'primary' && styles.primaryButtonText,
            variant === 'secondary' && styles.secondaryButtonText,
            variant === 'outline' && styles.outlineButtonText,
          ]}
        >
          {title}
        </Text>
      )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  primaryButtonText: {
    color: COLORS.surface,
  },
  secondaryButtonText: {
    color: COLORS.surface,
  },
  outlineButtonText: {
    color: COLORS.primary,
  },
});
