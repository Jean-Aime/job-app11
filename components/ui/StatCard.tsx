import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Radius, Spacing, Shadows } from '@/constants/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  bg?: string;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ label, value, icon, color = Colors.primary, bg = Colors.primaryLight, trend, trendUp }: StatCardProps) {
  return (
    <View style={[styles.card, Shadows.sm as object]}>
      <View style={[styles.iconWrap, { backgroundColor: bg }]}>
        {icon}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {trend && (
        <Text style={[styles.trend, { color: trendUp ? Colors.success : Colors.error }]}>
          {trendUp ? '↑' : '↓'} {trend}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: Spacing[1.5],
    minWidth: 80,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[1],
  },
  value: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  trend: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
