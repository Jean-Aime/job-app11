import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Colors, Radius } from '@/constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = Radius.sm, style }: SkeletonProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.5, 1]),
  }));

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: Colors.skeleton },
        animStyle,
        style,
      ]}
    />
  );
}

// Preset skeletons for common patterns
export function JobCardSkeleton() {
  return (
    <View style={skStyles.card}>
      <View style={skStyles.row}>
        <Skeleton width={48} height={48} borderRadius={12} />
        <View style={skStyles.col}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={11} style={{ marginTop: 6 }} />
          <Skeleton width="50%" height={11} style={{ marginTop: 4 }} />
        </View>
      </View>
      <View style={skStyles.tags}>
        <Skeleton width={70} height={26} borderRadius={8} />
        <Skeleton width={80} height={26} borderRadius={8} />
        <Skeleton width={60} height={26} borderRadius={8} />
      </View>
    </View>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <View style={[skStyles.card, { alignItems: 'center', paddingVertical: 28 }]}>
      <Skeleton width={96} height={96} borderRadius={48} />
      <Skeleton width="50%" height={18} style={{ marginTop: 16 }} />
      <Skeleton width="35%" height={13} style={{ marginTop: 8 }} />
      <Skeleton width="80%" height={8} borderRadius={4} style={{ marginTop: 20 }} />
    </View>
  );
}

const skStyles = StyleSheet.create({
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
