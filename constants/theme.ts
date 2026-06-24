/**
 * JobLink Africa — Design System v2
 * Single source of truth for ALL visual properties.
 * Every screen imports from here — no raw hex values in app code.
 */
import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Breakpoints ─────────────────────────────────────────────────────────────
export const Breakpoints = {
  xs:   320,   // iPhone SE 1st gen
  sm:   360,   // Galaxy S8, small Android
  md:   375,   // iPhone SE 3rd gen, iPhone 12/13 mini
  lg:   390,   // iPhone 14, iPhone 15
  xl:   412,   // Pixel 7, OnePlus
  xxl:  430,   // iPhone 14 Pro Max, iPhone 15 Pro Max
  tablet: 768, // iPad mini
  tabletMd: 820, // iPad Air
  tabletLg: 834, // iPad 10.2
  desktop: 1024, // iPad Pro 11
  desktopLg: 1280, // iPad Pro 12.9 landscape
} as const;

export const isXSmall = SCREEN_W <= Breakpoints.xs;
export const isSmall  = SCREEN_W <= Breakpoints.sm;
export const isMedium = SCREEN_W > Breakpoints.sm && SCREEN_W < Breakpoints.tablet;
export const isTablet = SCREEN_W >= Breakpoints.tablet && SCREEN_W < Breakpoints.desktop;
export const isDesktop = SCREEN_W >= Breakpoints.desktop;

// Enhanced responsive helper with full device support
export function responsive<T>(xs: T, sm?: T, md?: T, lg?: T, xl?: T): T {
  if (SCREEN_W >= Breakpoints.desktop && xl !== undefined) return xl;
  if (SCREEN_W >= Breakpoints.tablet && lg !== undefined) return lg;
  if (SCREEN_W >= Breakpoints.lg && md !== undefined) return md;
  if (SCREEN_W >= Breakpoints.sm && sm !== undefined) return sm;
  return xs;
}

// Responsive padding/spacing utility
export function responsiveSpacing(base: number, tablet?: number, desktop?: number): number {
  if (isDesktop && desktop !== undefined) return desktop;
  if (isTablet && tablet !== undefined) return tablet;
  return base;
}

// Responsive font size utility
export function responsiveFontSize(base: number, tablet?: number, desktop?: number): number {
  if (isDesktop && desktop !== undefined) return desktop;
  if (isTablet && tablet !== undefined) return tablet;
  if (isXSmall) return Math.max(base - 1, 12);
  return base;
}

// ─── Color Palette ────────────────────────────────────────────────────────────
export const Palette = {
  // Blues — primary brand
  blue50:  '#EFF6FF',
  blue100: '#DBEAFE',
  blue200: '#BFDBFE',
  blue300: '#93C5FD',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',
  blue800: '#1E40AF',
  blue900: '#1E3A8A',

  // Greens — employer / success
  green50:  '#F0FDF4',
  green100: '#DCFCE7',
  green200: '#BBF7D0',
  green500: '#22C55E',
  green600: '#16A34A',
  green700: '#15803D',

  // Purples — admin
  purple50:  '#FAF5FF',
  purple100: '#F3E8FF',
  purple500: '#A855F7',
  purple600: '#9333EA',
  purple700: '#7C3AED',

  // Ambers — warning
  amber50:  '#FFFBEB',
  amber100: '#FEF3C7',
  amber500: '#F59E0B',
  amber600: '#D97706',

  // Reds — error
  red50:  '#FFF1F2',
  red100: '#FFE4E6',
  red500: '#EF4444',
  red600: '#DC2626',

  // Neutrals — slate scale
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
} as const;

// ─── Semantic Color Tokens ────────────────────────────────────────────────────
export const Colors = {
  // Brand
  primary:      Palette.blue600,
  primaryLight: Palette.blue50,
  primaryMid:   Palette.blue100,
  primaryDark:  Palette.blue800,

  // Roles
  employer:      Palette.green600,
  employerLight: Palette.green50,
  employerMid:   Palette.green100,
  admin:         Palette.purple600,
  adminLight:    Palette.purple50,
  adminMid:      Palette.purple100,

  // States
  success:      Palette.green600,
  successLight: Palette.green50,
  successMid:   Palette.green100,
  successDark:  Palette.green700,
  warning:      Palette.amber500,
  warningLight: Palette.amber50,
  warningMid:   Palette.amber100,
  error:        Palette.red500,
  errorLight:   Palette.red50,
  errorMid:     Palette.red100,
  info:         Palette.blue500,

  // Surfaces
  bg:        Palette.slate50,
  bgCard:    Palette.white,
  bgInput:   Palette.slate50,
  bgOverlay: 'rgba(15,23,42,0.55)',

  // Text hierarchy
  textPrimary:   Palette.slate900,
  textSecondary: Palette.slate500,
  textMuted:     Palette.slate400,
  textInverse:   Palette.white,
  textDisabled:  Palette.slate300,

  // Borders
  border:      Palette.slate200,
  borderFocus: Palette.blue600,
  borderError: Palette.red500,

  // Navigation
  tabBarBg:  Palette.white,
  headerBg:  Palette.white,
  divider:   Palette.slate100,
  skeleton:  Palette.slate200,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const Typography = {
  // Scale (spec compliant: 32/28/24/18/16/14/12)
  display:    { fontSize: 32, fontWeight: '800' as const, lineHeight: 40, letterSpacing: -0.5 },
  h1:         { fontSize: 28, fontWeight: '700' as const, lineHeight: 36, letterSpacing: -0.3 },
  h2:         { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  h3:         { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  h4:         { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },  // Card title
  h5:         { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  bodyLg:     { fontSize: 16, fontWeight: '400' as const, lineHeight: 26 },  // Body text
  body:       { fontSize: 15, fontWeight: '400' as const, lineHeight: 24 },
  bodySm:     { fontSize: 14, fontWeight: '400' as const, lineHeight: 22 },  // Secondary text
  label:      { fontSize: 13, fontWeight: '500' as const, lineHeight: 20 },
  caption:    { fontSize: 12, fontWeight: '400' as const, lineHeight: 18 },  // Caption
  overline:   { fontSize: 11, fontWeight: '600' as const, lineHeight: 16, letterSpacing: 0.8, textTransform: 'uppercase' as const },

  // UI elements
  buttonLg:   { fontSize: 17, fontWeight: '600' as const, lineHeight: 24 },
  button:     { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  buttonSm:   { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  input:      { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  inputLabel: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  tabLabel:   { fontSize: 11, fontWeight: '500' as const, lineHeight: 16 },
} as const;

// ─── 8-point Spacing System ───────────────────────────────────────────────────
export const Spacing = {
  0:    0,
  0.5:  2,
  1:    4,
  1.5:  6,
  2:    8,    // base unit
  2.5:  10,
  3:    12,
  3.5:  14,
  4:    16,   // card padding
  5:    20,   // page padding
  6:    24,
  7:    28,
  8:    32,
  9:    36,
  10:   40,
  12:   48,
  14:   56,
  16:   64,
  20:   80,
  24:   96,
} as const;

// Named semantic spacing — use these in screens
export const Space = {
  // Page layout - responsive
  pagePadding:      responsiveSpacing(16, 24, 32),
  pageTop:          responsiveSpacing(12, 16, 20),
  sectionGap:       responsiveSpacing(20, 28, 36),
  sectionGapSm:     responsiveSpacing(12, 16, 20),

  // Cards - responsive
  cardPadding:      responsiveSpacing(14, 16, 20),
  cardPaddingLg:    responsiveSpacing(16, 20, 24),
  cardGap:          responsiveSpacing(10, 12, 14),
  cardGapSm:        responsiveSpacing(6, 8, 10),

  // Inputs
  inputPaddingH:    responsiveSpacing(14, 16, 18),
  inputPaddingV:    responsiveSpacing(12, 14, 16),
  inputGap:         responsiveSpacing(14, 16, 18),
  formGap:          responsiveSpacing(18, 20, 24),

  // Buttons - responsive
  btnHeight:        responsiveSpacing(48, 52, 56),
  btnHeightSm:      responsiveSpacing(36, 40, 44),
  btnHeightLg:      responsiveSpacing(52, 56, 60),
  btnPaddingV:      responsiveSpacing(14, 16, 18),

  // Navigation chrome - responsive
  tabBarHeight:     Platform.select({ ios: isTablet ? 72 : 64, android: isTablet ? 68 : 60, default: 64 }),
  headerHeight:     responsiveSpacing(52, 60, 68),
  bottomInset:      Platform.OS === 'ios' && !isTablet ? 34 : 0,

  // Computed
  get listBottom() { return this.tabBarHeight + (isTablet ? 32 : 20); },
  get screenBottom() { return this.tabBarHeight + this.bottomInset; },
} as const;

// ─── Border Radius ─────────────────────────────────────────────────────────────
export const Radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

// ─── Elevation / Shadows ──────────────────────────────────────────────────────
export const Shadows = {
  none: {},
  xs: Platform.select({
    ios:     { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
    android: { elevation: 1 },
    default: { boxShadow: '0px 1px 3px rgba(15,23,42,0.04)' },
  }),
  sm: Platform.select({
    ios:     { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
    android: { elevation: 2 },
    default: { boxShadow: '0px 2px 8px rgba(15,23,42,0.06)' },
  }),
  md: Platform.select({
    ios:     { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16 },
    android: { elevation: 4 },
    default: { boxShadow: '0px 4px 16px rgba(15,23,42,0.08)' },
  }),
  lg: Platform.select({
    ios:     { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.10, shadowRadius: 24 },
    android: { elevation: 8 },
    default: { boxShadow: '0px 8px 24px rgba(15,23,42,0.10)' },
  }),
  xl: Platform.select({
    ios:     { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.14, shadowRadius: 40 },
    android: { elevation: 12 },
    default: { boxShadow: '0px 12px 40px rgba(15,23,42,0.14)' },
  }),
} as const;

// ─── Status Configs ────────────────────────────────────────────────────────────
export const StatusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending:     { color: Palette.amber600, bg: Palette.amber100,  label: 'Pending' },
  reviewed:    { color: Palette.blue600,  bg: Palette.blue100,   label: 'Reviewed' },
  shortlisted: { color: Palette.purple600,bg: Palette.purple100, label: 'Shortlisted' },
  accepted:    { color: Palette.green700, bg: Palette.green100,  label: 'Accepted' },
  rejected:    { color: Palette.red600,   bg: Palette.red100,    label: 'Rejected' },
  completed:   { color: Palette.green700, bg: Palette.green100,  label: 'Completed' },
  withdrawn:   { color: Palette.slate500, bg: Palette.slate100,  label: 'Withdrawn' },
};

export const JobStatusConfig: Record<string, { color: string; bg: string; label: string }> = {
  active:  { color: Palette.green700, bg: Palette.green100,  label: 'Active' },
  closed:  { color: Palette.red600,   bg: Palette.red100,    label: 'Closed' },
  draft:   { color: Palette.slate500, bg: Palette.slate100,  label: 'Draft' },
  filled:  { color: Palette.purple600,bg: Palette.purple100, label: 'Filled' },
};

export const VerificationConfig: Record<string, { color: string; bg: string; label: string }> = {
  approved: { color: Palette.green700, bg: Palette.green100,  label: 'Verified' },
  rejected: { color: Palette.red600,   bg: Palette.red100,    label: 'Rejected' },
  pending:  { color: Palette.amber600, bg: Palette.amber100,  label: 'Pending Verification' },
};

// ─── Animation Durations ──────────────────────────────────────────────────────
export const Duration = {
  fast:   150,
  normal: 250,
  slow:   400,
} as const;

// ─── Screen Info ──────────────────────────────────────────────────────────────
export const Screen = {
  width:    SCREEN_W,
  height:   SCREEN_H,
  isXSmall,
  isSmall,
  isMedium,
  isTablet,
} as const;

// ─── Global StyleSheet Helpers ────────────────────────────────────────────────
// Reusable style fragments — spread into StyleSheet.create()
export const G = {
  // Screen containers
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  screenWhite: {
    flex: 1,
    backgroundColor: Colors.bgCard,
  },

  // Page header (title + subtitle pair)
  pageHeader: {
    paddingHorizontal: Space.pagePadding,
    paddingTop: Space.pageTop,
    paddingBottom: Spacing[2],
  },
  pageTitle: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  pageSubtitle: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    marginTop: Spacing[1],
  },

  // Section
  section: {
    paddingHorizontal: Space.pagePadding,
    marginTop: Space.sectionGap,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing[4],
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  seeAllText: {
    ...Typography.label,
    color: Colors.primary,
    fontWeight: '600' as const,
  },

  // Cards
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Space.cardPadding,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Space.cardGap,
  },
  cardLg: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Space.cardPaddingLg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Space.cardGap,
  },

  // Icon containers
  iconSm: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  iconMd: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  iconLg: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  // Row layout
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  rowBetween: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },

  // Empty states
  emptyCenter: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: Space.pagePadding * 2,
    paddingVertical: 64,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
    marginTop: Spacing[5],
    marginBottom: Spacing[2],
  },
  emptyBody: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 24,
  },

  // Bottom list padding
  listBottom: {
    height: Space.listBottom,
  },

  // Back button
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing[4],
  },

  // Input label
  inputLabel: {
    ...Typography.inputLabel,
    color: Colors.textPrimary,
    marginBottom: Spacing[1.5],
  },
  inputRequired: {
    color: Colors.error,
  },
} as const;
