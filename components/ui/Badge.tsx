import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Typography, Radius, Spacing } from '@/constants/theme';

interface BadgeProps {
  label: string;
  color: string;
  bg: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  style?: ViewStyle;
  dot?: boolean;
}

export function Badge({ label, color, bg, icon, size = 'md', style, dot }: BadgeProps) {
  return (
    <View style={[styles.base, { backgroundColor: bg }, size === 'sm' && styles.sm, style]}>
      {dot && <View style={[styles.dot, { backgroundColor: color }]} />}
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.text, { color }, size === 'sm' && styles.textSm]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: Radius.full,
    gap: Spacing[1.5],
  },
  sm: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  icon: { opacity: 0.9 },
  text: {
    ...Typography.label,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 11,
    fontWeight: '600',
  },
});
