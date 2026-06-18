import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Space, Shadows } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  shadow?: 'none' | 'xs' | 'sm' | 'md';
  padding?: number | boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
}

export function Card({
  children,
  style,
  shadow = 'sm',
  padding = true,
  rounded = 'lg',
  border = true,
}: CardProps) {
  const radiusMap = { sm: Radius.sm, md: Radius.md, lg: Radius.lg, xl: Radius.xl };

  return (
    <View
      style={[
        styles.base,
        { borderRadius: radiusMap[rounded] },
        border && styles.border,
        padding === true  && styles.padding,
        padding === false && styles.noPadding,
        typeof padding === 'number' && { padding },
        Shadows[shadow] as ViewStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base:     { backgroundColor: Colors.bgCard, overflow: 'hidden' },
  border:   { borderWidth: 1, borderColor: Colors.border },
  padding:  { padding: Space.cardPadding },
  noPadding:{ padding: 0 },
});
