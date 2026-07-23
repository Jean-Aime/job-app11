import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/stores/authStore';

export default function RootLayout() {
  useFrameworkReady();
  const [isReady, setIsReady] = useState(false);
  const { refreshUser, isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const init = async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.log('Auth refresh error:', error);
      }
      setIsReady(true);
    };
    init();
  }, []);

  // Route guard — runs every time auth state or route changes
  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated) {
      // Not logged in — always go to auth (including undefined/unknown segments)
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      // Logged in — redirect away from auth screens
      if (inAuthGroup || segments[0] === undefined) {
        if (user?.role === 'employer') {
          router.replace('/(employer)');
        } else if (user?.role === 'admin') {
          router.replace('/(admin)');
        } else {
          router.replace('/(job-seeker)');
        }
      }
    }
  }, [isReady, isAuthenticated, user, segments]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(job-seeker)" />
        <Stack.Screen name="(employer)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
