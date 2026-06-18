import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

/**
 * Returns a `handleSignOut` function that confirms, signs the user out,
 * and redirects to the auth screen. Use this in any profile/settings screen.
 */
export function useSignOut() {
  const router = useRouter();
  const { signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)');
        },
      },
    ]);
  };

  return { handleSignOut };
}
