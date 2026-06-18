import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Typography, Palette } from '@/constants/theme';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<AvatarSize, { container: number; font: number; radius: number }> = {
  xs: { container: 28, font: 11, radius: 8 },
  sm: { container: 36, font: 13, radius: 10 },
  md: { container: 48, font: 18, radius: 12 },
  lg: { container: 64, font: 24, radius: 16 },
  xl: { container: 96, font: 36, radius: 24 },
};

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: AvatarSize;
  color?: string;
}

export function Avatar({ uri, name, size = 'md', color = Colors.primary }: AvatarProps) {
  const s = sizeMap[size];
  const initial = name?.trim().charAt(0).toUpperCase() || '?';

  return (
    <View
      style={[
        styles.base,
        {
          width: s.container,
          height: s.container,
          borderRadius: s.radius,
          backgroundColor: color + '20',
        },
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: s.container, height: s.container, borderRadius: s.radius }}
        />
      ) : (
        <Text style={[styles.initial, { fontSize: s.font, color }]}>{initial}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  initial: { fontWeight: '700' },
});
