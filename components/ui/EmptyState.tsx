import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, actionLabel, onAction, compact }: EmptyStateProps) {
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.desc}>{description}</Text>}
      {actionLabel && onAction && (
        <Button
          onPress={onAction}
          label={actionLabel}
          variant="primary"
          size="md"
          fullWidth={false}
          style={styles.btn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 40,
  },
  compact: { paddingVertical: 40 },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[5],
  },
  title: {
    ...Typography.h4,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  desc: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  btn: { marginTop: Spacing[6], paddingHorizontal: 28 },
});
