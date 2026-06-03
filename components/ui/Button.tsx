import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/use-color-scheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  style?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  style, 
  textStyle,
  loading = false,
  disabled = false,
  icon
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const getVariantStyles = (): { bg: string, text: string, border?: string } => {
    switch (variant) {
      case 'primary':
        return { bg: colors.tint, text: '#000000' };
      case 'secondary':
        return { bg: colors.cardSecondary, text: colors.text };
      case 'outline':
        return { bg: 'transparent', text: colors.tint, border: colors.tint };
      case 'text':
        return { bg: 'transparent', text: colors.tint };
      default:
        return { bg: colors.tint, text: '#000000' };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: variantStyles.bg,
          borderColor: variantStyles.border || 'transparent',
          borderWidth: variant === 'outline' ? 1 : 0,
          opacity: disabled ? 0.6 : 1,
        },
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text} />
      ) : (
        <>
          {icon && <React.Fragment>{icon}</React.Fragment>}
          <Text style={[
            styles.text, 
            { 
              color: variantStyles.text,
              marginLeft: icon ? 8 : 0
            }, 
            textStyle
          ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
