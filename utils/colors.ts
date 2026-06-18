/**
 * Centralized color palette and status configs.
 * Import from here instead of hard-coding hex values in screens.
 */

export const Colors = {
  // Brand
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  primaryDark: '#1E40AF',

  // Employer brand
  employer: '#059669',
  employerLight: '#ECFDF5',

  // Admin brand
  admin: '#8B5CF6',
  adminLight: '#F3E8FF',

  // Semantic
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Neutrals
  text: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceHover: '#F1F5F9',
} as const;

// Application status styles
export const StatusColors: Record<
  string,
  { color: string; bgColor: string; label: string }
> = {
  pending:    { color: '#D97706', bgColor: '#FEF3C7', label: 'Pending' },
  reviewed:   { color: '#2563EB', bgColor: '#DBEAFE', label: 'Reviewed' },
  shortlisted:{ color: '#8B5CF6', bgColor: '#EDE9FE', label: 'Shortlisted' },
  accepted:   { color: '#059669', bgColor: '#D1FAE5', label: 'Accepted' },
  rejected:   { color: '#EF4444', bgColor: '#FEE2E2', label: 'Rejected' },
  completed:  { color: '#10B981', bgColor: '#D1FAE5', label: 'Completed' },
  withdrawn:  { color: '#94A3B8', bgColor: '#F1F5F9', label: 'Withdrawn' },
};

// Job status styles
export const JobStatusColors: Record<
  string,
  { color: string; bgColor: string }
> = {
  active:  { color: '#10B981', bgColor: '#D1FAE5' },
  closed:  { color: '#EF4444', bgColor: '#FEE2E2' },
  draft:   { color: '#64748B', bgColor: '#F1F5F9' },
  filled:  { color: '#8B5CF6', bgColor: '#EDE9FE' },
};

// Verification status styles
export const VerificationColors: Record<
  string,
  { color: string; bgColor: string; label: string }
> = {
  approved: { color: '#059669', bgColor: '#D1FAE5', label: 'Verified' },
  rejected: { color: '#EF4444', bgColor: '#FEE2E2', label: 'Rejected' },
  pending:  { color: '#D97706', bgColor: '#FEF3C7', label: 'Pending Verification' },
};
