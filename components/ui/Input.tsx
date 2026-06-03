import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  isPassword?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Input({ label, icon, error, isPassword, style, ...props }: InputProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>}
      <View 
        style={[
          styles.inputContainer, 
          { 
            backgroundColor: colors.card,
            borderColor: isFocused ? colors.tint : 'transparent',
            borderWidth: 1,
          },
          style
        ]}
      >
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={isFocused ? colors.tint : colors.icon} 
            style={styles.icon} 
          />
        )}
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons 
              name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color={colors.icon} 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 10,
  },
  eyeIcon: {
    padding: 4,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
