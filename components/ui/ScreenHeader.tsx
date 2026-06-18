import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Colors, Typography, Spacing, Space, Shadows } from '@/constants/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
  transparent?: boolean;
}

export function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  right,
  transparent = false,
}: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <View style={[styles.container, transparent && styles.transparent]}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft color={Colors.textPrimary} size={22} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>

      <View style={styles.right}>
        {right || <View style={styles.placeholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Space.headerHeight,
    paddingHorizontal: Spacing[4],
    backgroundColor: Colors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...(Shadows.xs as object),
  },
  transparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    boxShadow: 'none',
  },
  left: { width: 44, alignItems: 'flex-start' },
  center: { flex: 1, alignItems: 'center' },
  right: { width: 44, alignItems: 'flex-end' },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.h5,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  placeholder: { width: 36 },
});
