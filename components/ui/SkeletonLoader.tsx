import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Colors, Radius } from '@/constants/theme';

interface SkeletonProps {
  width?: number | `${number}%` | 'auto';
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = Radius.sm,
  style,
}: SkeletonProps) {
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1,   duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: Colors.skeleton,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}

// ─── Preset skeletons ─────────────────────────────────────────────────────────

export function JobCardSkeleton() {
  return (
    <View style={sk.card}>
      <View style={sk.row}>
        <Skeleton width={48} height={48} borderRadius={12} />
        <View style={sk.col}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={11} style={{ marginTop: 6 }} />
          <Skeleton width="50%" height={11} style={{ marginTop: 4 }} />
        </View>
      </View>
      <View style={sk.tags}>
        <Skeleton width={70} height={26} borderRadius={8} />
        <Skeleton width={80} height={26} borderRadius={8} />
        <Skeleton width={60} height={26} borderRadius={8} />
      </View>
    </View>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <View style={[sk.card, { alignItems: 'center', paddingVertical: 28 }]}>
      <Skeleton width={96} height={96} borderRadius={48} />
      <Skeleton width="50%" height={18} style={{ marginTop: 16 }} />
      <Skeleton width="35%" height={13} style={{ marginTop: 8 }} />
      <Skeleton width="80%" height={8} borderRadius={4} style={{ marginTop: 20 }} />
    </View>
  );
}

const sk = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  row:  { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  col:  { flex: 1, gap: 4 },
  tags: { flexDirection: 'row', gap: 8 },
});
