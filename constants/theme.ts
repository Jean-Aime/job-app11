/**
 * JobLink Africa — Design System
 * Enterprise-grade token system inspired by LinkedIn, Indeed, Airbnb, Stripe
 */
import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Breakpoints ────────────────────────────────────────────────────────────
export const Breakpoints = {
  sm: 375,   // small phones (SE, Pixel 4a)
  md: 414,   // standard phones (iPhone 14, Pixel 7)
  lg: 768,   // large phones / small tablets
  xl: 1024,  // tablets
} as const;

export const isSmall  = SCREEN_W < Breakpoints.sm;
export const isMedium = SCREEN_W >= Breakpoints.sm && SCREEN_W < Breakpoints.lg;
export const isTablet = SCREEN_W >= Breakpoints.lg;

// ─── Color Palette ──────────────────────────────────────────────────────────
export const Palette = {
  // Blues (primary)
  blue50:  '#EFF6FF',
  blue100: '#DBEAFE',
  blue200: '#BFDBFE',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',
  blue800: '#1E40AF',
  blue900: '#1E3A8A',

  // Greens (employer / success)
  green50:  '#F0FDF4',
  green100: '#DCFCE7',
  green200: '#BBF7D0',
  green400: '#4ADE80',
  green500: '#22C55E',
  green600: '#16A34A',
  green700: '#15803D',
  green800: '#166534',

  // Purples (admin)
  purple50:  '#FAF5FF',
  purple100: '#F3E8FF',
  purple400: '#C084FC',
  purple500: '#A855F7',
  purple600: '#9333EA',
  purple700: '#7C3AED',

  // Ambers (warning)
  amber50:  '#FFFBEB',
  amber100: '#FEF3C7',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  amber600: '#D97706',

  // Reds (error / danger)
  red50:  '#FFF1F2',
  red100: '#FFE4E6',
  red400: '#F87171',
  red500: '#EF4444',
  red600: '#DC2626',

  // Teals (accent)
  teal500: '#14B8A6',
  teal600: '#0D9488',

  // Neutrals (slate)
  white:    '#FFFFFF',
  slate50:  '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
  black:    '#000000',
} as const;

// ─── Semantic Colors ─────────────────────────────────────────────────────────
export const Colors = {
  // Brand
  primary:        Palette.blue600,
  primaryLight:   Palette.blue50,
  primaryMid:     Palette.blue100,
  primaryDark:    Palette.blue800,
  primaryHover:   Palette.blue700,

  // Employer
  employer:       Palette.green600,
  employerLight:  Palette.green50,
  employerMid:    Palette.green100,

  // Admin
  admin:          Palette.purple600,
  adminLight:     Palette.purple50,
  adminMid:       Palette.purple100,

  // Semantic
  success:        Palette.green600,
  successLight:   Palette.green50,
  successMid:     Palette.green100,
  warning:        Palette.amber500,
  warningLight:   Palette.amber50,
  warningMid:     Palette.amber100,
  error:          Palette.red500,
  errorLight:     Palette.red50,
  errorMid:       Palette.red100,
  info:           Palette.blue500,
  infoLight:      Palette.blue50,

  // Backgrounds
  bg:             Palette.slate50,
  bgCard:         Palette.white,
  bgInput:        Palette.slate50,
  bgOverlay:      'rgba(15, 23, 42, 0.5)',

  // Text
  textPrimary:    Palette.slate900,
  textSecondary:  Palette.slate600,
  textMuted:      Palette.slate400,
  textInverse:    Palette.white,
  textOnPrimary:  Palette.white,

  // Borders
  border:         Palette.slate200,
  borderFocus:    Palette.blue600,
  borderError:    Palette.red500,

  // Misc
  tabBarBg:       Palette.white,
  headerBg:       Palette.white,
  divider:        Palette.slate100,
  skeleton:       Palette.slate200,
  skeletonHigh:   Palette.slate100,
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────
const BASE_FONT = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

export const Typography = {
  // Font families
  fontFamily: {
    regular:  BASE_FONT,
    medium:   BASE_FONT,
    semibold: BASE_FONT,
    bold:     BASE_FONT,
  },

  // Scale — 8-point based
  size: {
    xs:   11,
    sm:   13,
    base: 15,
    md:   16,
    lg:   18,
    xl:   20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },

  weight: {
    regular:  '400' as const,
    medium:   '500' as const,
    semibold: '600' as const,
    bold:     '700' as const,
    extrabold:'800' as const,
  },

  lineHeight: {
    tight:   1.2,
    snug:    1.35,
    normal:  1.5,
    relaxed: 1.65,
  },

  // Named roles
  display:    { fontSize: 32, fontWeight: '700' as const, lineHeight: 38 },
  h1:         { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2:         { fontSize: 24, fontWeight: '700' as const, lineHeight: 30 },
  h3:         { fontSize: 20, fontWeight: '600' as const, lineHeight: 26 },
  h4:         { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  h5:         { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  bodyLg:     { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  body:       { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySm:     { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  label:      { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
  caption:    { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  overline:   { fontSize: 11, fontWeight: '600' as const, lineHeight: 14, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  buttonLg:   { fontSize: 17, fontWeight: '600' as const, lineHeight: 24 },
  button:     { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  buttonSm:   { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  input:      { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  inputLabel: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────
// 4-point grid
export const Spacing = {
  0:   0,
  0.5: 2,
  1:   4,
  1.5: 6,
  2:   8,
  2.5: 10,
  3:   12,
  3.5: 14,
  4:   16,
  5:   20,
  6:   24,
  7:   28,
  8:   32,
  9:   36,
  10:  40,
  12:  48,
  14:  56,
  16:  64,
  20:  80,
  24:  96,
} as const;

// Semantic spacing
export const Space = {
  pagePadding:   Spacing[5],     // 20px horizontal page padding
  sectionGap:    Spacing[6],     // 24px between sections
  cardPadding:   Spacing[4],     // 16px inside cards
  cardGap:       Spacing[3],     // 12px between cards
  inputPaddingH: Spacing[4],     // 16px horizontal input
  inputPaddingV: Spacing[3.5],   // 14px vertical input
  buttonPaddingV:Spacing[4],     // 16px vertical button
  tabBarHeight:  64,
  headerHeight:  56,
  bottomInset:   34,             // iPhone home indicator area
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────
export const Radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl':24,
  full: 9999,
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────
export const Shadows = {
  none: {},
  xs: Platform.select({
    ios:     { shadowColor: Palette.slate900, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    android: { elevation: 1 },
    default: { boxShadow: '0px 1px 2px rgba(15,23,42,0.05)' },
  }),
  sm: Platform.select({
    ios:     { shadowColor: Palette.slate900, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6 },
    android: { elevation: 2 },
    default: { boxShadow: '0px 2px 6px rgba(15,23,42,0.07)' },
  }),
  md: Platform.select({
    ios:     { shadowColor: Palette.slate900, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 12 },
    android: { elevation: 4 },
    default: { boxShadow: '0px 4px 12px rgba(15,23,42,0.10)' },
  }),
  lg: Platform.select({
    ios:     { shadowColor: Palette.slate900, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24 },
    android: { elevation: 8 },
    default: { boxShadow: '0px 8px 24px rgba(15,23,42,0.12)' },
  }),
  xl: Platform.select({
    ios:     { shadowColor: Palette.slate900, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 40 },
    android: { elevation: 12 },
    default: { boxShadow: '0px 12px 40px rgba(15,23,42,0.15)' },
  }),
} as const;

// ─── Animation Durations ─────────────────────────────────────────────────────
export const Duration = {
  fast:    150,
  normal:  250,
  slow:    400,
  slower:  600,
} as const;

// ─── Status Color Maps ────────────────────────────────────────────────────────
export const StatusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending:    { color: Palette.amber600, bg: Palette.amber100,  label: 'Pending' },
  reviewed:   { color: Palette.blue600,  bg: Palette.blue100,   label: 'Reviewed' },
  shortlisted:{ color: Palette.purple600,bg: Palette.purple100, label: 'Shortlisted' },
  accepted:   { color: Palette.green700, bg: Palette.green100,  label: 'Accepted' },
  rejected:   { color: Palette.red600,   bg: Palette.red100,    label: 'Rejected' },
  completed:  { color: Palette.green700, bg: Palette.green100,  label: 'Completed' },
  withdrawn:  { color: Palette.slate500, bg: Palette.slate100,  label: 'Withdrawn' },
};

export const JobStatusConfig: Record<string, { color: string; bg: string; label: string }> = {
  active:  { color: Palette.green700, bg: Palette.green100, label: 'Active' },
  closed:  { color: Palette.red600,   bg: Palette.red100,   label: 'Closed' },
  draft:   { color: Palette.slate500, bg: Palette.slate100, label: 'Draft' },
  filled:  { color: Palette.purple600,bg: Palette.purple100,label: 'Filled' },
};

export const VerificationConfig: Record<string, { color: string; bg: string; label: string }> = {
  approved:{ color: Palette.green700, bg: Palette.green100, label: 'Verified' },
  rejected:{ color: Palette.red600,   bg: Palette.red100,   label: 'Rejected' },
  pending: { color: Palette.amber600, bg: Palette.amber100, label: 'Pending Verification' },
};

// ─── Screen Dimensions ───────────────────────────────────────────────────────
export const Screen = {
  width:  SCREEN_W,
  height: SCREEN_H,
  isSmall,
  isMedium,
  isTablet,
};
