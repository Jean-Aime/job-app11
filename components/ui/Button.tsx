import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Radius, Space, Palette } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'employer';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress: () => void;
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const variantStyles: Record<Variant, { container: ViewStyle; text: TextStyle; loader: string }> = {
  primary:  { container: { backgroundColor: Colors.primary },        text: { color: Palette.white }, loader: Palette.white },
  secondary:{ container: { backgroundColor: Colors.primaryLight },   text: { color: Colors.primary }, loader: Colors.primary },
  outline:  { container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary }, text: { color: Colors.primary }, loader: Colors.primary },
  ghost:    { container: { backgroundColor: 'transparent' },         text: { color: Colors.primary }, loader: Colors.primary },
  danger:   { container: { backgroundColor: Colors.error },          text: { color: Palette.white }, loader: Palette.white },
  success:  { container: { backgroundColor: Colors.success },        text: { color: Palette.white }, loader: Palette.white },
  employer: { container: { backgroundColor: Colors.employer },       text: { color: Palette.white }, loader: Palette.white },
};

const sizeStyles: Record<Size, { container: ViewStyle; text: TextStyle }> = {
  sm: { container: { paddingVertical: 8,  paddingHorizontal: 14, borderRadius: Radius.sm },  text: { ...Typography.buttonSm } },
  md: { container: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: Radius.md },  text: { ...Typography.button } },
  lg: { container: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: Radius.lg },  text: { ...Typography.buttonLg } },
};

export function Button({
  onPress,
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  fullWidth = true,
  style,
  textStyle,
}: ButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        s.container,
        v.container,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={v.loader} size="small" />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[v.text, s.text, textStyle]}>{label}</Text>
          {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base:      { alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  fullWidth: { width: '100%' },
  disabled:  { opacity: 0.5 },
  inner:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  iconLeft:  { marginRight: 8 },
  iconRight: { marginLeft: 8 },
});
