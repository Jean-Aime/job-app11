import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Radius, Spacing } from '@/constants/theme';

interface FilterChipProps {
  label: string;
  active?: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  count?: number;
  color?: string;
}

export function FilterChip({ label, active, onPress, icon, count, color }: FilterChipProps) {
  const activeColor = color || Colors.primary;

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        active && { backgroundColor: activeColor, borderColor: activeColor },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
      {count !== undefined && (
        <View style={[styles.countBadge, active && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
          <Text style={[styles.countText, active && styles.countTextActive]}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[3.5],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    backgroundColor: Colors.bgCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing[1.5],
  },
  label: {
    ...Typography.label,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  labelActive: { color: '#FFFFFF' },
  icon: { opacity: 0.85 },
  countBadge: {
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  countText:       { ...Typography.caption, color: Colors.textSecondary, fontWeight: '600' },
  countTextActive: { color: '#FFFFFF' },
});
