const tintColorLight = '#0a7ea4';
const tintColorDark = '#0CDD7B'; // Neon Green

export const Colors = {
  light: {
    text: '#11181C',
    textMuted: '#687076',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    card: '#F3F4F6',
    cardSecondary: '#E5E7EB',
    border: '#E5E7EB',
    danger: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
  dark: {
    text: '#FFFFFF',
    textMuted: '#94A3B8',
    background: '#0F1714', // Very dark green-tinted black
    tint: tintColorDark,
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,
    card: '#16201B', // Slightly lighter dark green-gray
    cardSecondary: '#1C2923',
    border: '#2C3E35',
    danger: '#F05252',
    success: '#0CDD7B',
    warning: '#F59E0B',
  },
};
