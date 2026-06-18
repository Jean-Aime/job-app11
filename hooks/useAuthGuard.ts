/**
 * useAuthGuard
 * Protects routes by checking authentication state and role permissions.
 * Call this at the top of each role-specific layout.
 */
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

type AllowedRole = 'job_seeker' | 'employer' | 'admin';

export function useAuthGuard(allowedRole: AllowedRole) {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      // Not authenticated — redirect to auth
      router.replace('/(auth)');
      return;
    }

    if (user.role !== allowedRole) {
      // Wrong role — redirect to correct area
      switch (user.role) {
        case 'admin':
          router.replace('/(admin)');
          break;
        case 'employer':
          router.replace('/(employer)');
          break;
        default:
          router.replace('/(job-seeker)');
      }
    }
  }, [isAuthenticated, user, isLoading]);

  return { isAuthenticated, user, isLoading };
}
