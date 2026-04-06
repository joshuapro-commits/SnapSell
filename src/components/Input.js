import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

export const Input = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  error,
  style,
  ...props 
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontFamily: 'Montserrat_600SemiBold',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    minHeight: 48,
    fontFamily: 'Montserrat_400Regular',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: SPACING.md,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
    fontFamily: 'Montserrat_400Regular',
  },
});
