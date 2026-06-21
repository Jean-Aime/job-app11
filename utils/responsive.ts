/**
 * Responsive Layout Utilities
 * Production-ready helpers for device-adaptive UI
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Device breakpoints
export const BREAKPOINTS = {
  xs: 320,
  sm: 360,
  md: 375,
  lg: 390,
  xl: 412,
  xxl: 430,
  tablet: 768,
  tabletMd: 820,
  tabletLg: 834,
  desktop: 1024,
  desktopLg: 1280,
} as const;

// Device type detection
export const isXSmall = SCREEN_WIDTH <= BREAKPOINTS.xs;
export const isSmall = SCREEN_WIDTH <= BREAKPOINTS.sm;
export const isMedium = SCREEN_WIDTH > BREAKPOINTS.sm && SCREEN_WIDTH < BREAKPOINTS.tablet;
export const isTablet = SCREEN_WIDTH >= BREAKPOINTS.tablet && SCREEN_WIDTH < BREAKPOINTS.desktop;
export const isDesktop = SCREEN_WIDTH >= BREAKPOINTS.desktop;

// Orientation
export const isPortrait = SCREEN_HEIGHT > SCREEN_WIDTH;
export const isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT;

// Platform checks
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

/**
 * Scale size relative to base design (375px width)
 */
export function scale(size: number): number {
  const baseWidth = 375;
  const scale = SCREEN_WIDTH / baseWidth;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

/**
 * Vertical scale relative to base design (812px height)
 */
export function verticalScale(size: number): number {
  const baseHeight = 812;
  const scale = SCREEN_HEIGHT / baseHeight;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

/**
 * Moderate scale - scales with a factor to prevent extreme scaling
 */
export function moderateScale(size: number, factor = 0.5): number {
  return size + (scale(size) - size) * factor;
}

/**
 * Responsive width - percentage of screen width
 */
export function wp(percentage: number): number {
  return (SCREEN_WIDTH * percentage) / 100;
}

/**
 * Responsive height - percentage of screen height
 */
export function hp(percentage: number): number {
  return (SCREEN_HEIGHT * percentage) / 100;
}

/**
 * Responsive font size with device-specific adjustments
 */
export function fontSize(size: number): number {
  if (isXSmall) return Math.max(size - 2, 10);
  if (isSmall) return Math.max(size - 1, 11);
  if (isTablet) return size + 2;
  if (isDesktop) return size + 4;
  return size;
}

/**
 * Responsive spacing with device-specific multipliers
 */
export function spacing(size: number): number {
  if (isXSmall) return Math.max(size * 0.75, 4);
  if (isSmall) return Math.max(size * 0.875, 6);
  if (isTablet) return size * 1.25;
  if (isDesktop) return size * 1.5;
  return size;
}

/**
 * Get responsive value based on device type
 */
export function responsive<T>(
  base: T,
  small?: T,
  tablet?: T,
  desktop?: T
): T {
  if (isDesktop && desktop !== undefined) return desktop;
  if (isTablet && tablet !== undefined) return tablet;
  if (isSmall && small !== undefined) return small;
  return base;
}

/**
 * Get grid columns based on screen width
 */
export function getColumns(minColumnWidth = 150): number {
  return Math.floor(SCREEN_WIDTH / minColumnWidth);
}

/**
 * Check if device has notch/safe area
 */
export function hasNotch(): boolean {
  return (
    isIOS &&
    (SCREEN_HEIGHT >= 812 || SCREEN_WIDTH >= 812) // iPhone X and newer
  );
}

/**
 * Get safe area insets
 */
export function getSafeAreaInsets() {
  return {
    top: hasNotch() ? 44 : 20,
    bottom: hasNotch() ? 34 : 0,
    left: 0,
    right: 0,
  };
}

/**
 * Normalize size across devices (prevents too large/small on extremes)
 */
export function normalize(size: number, maxScale = 1.2): number {
  const newSize = scale(size);
  return Math.min(newSize, size * maxScale);
}

// Export screen dimensions
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;
