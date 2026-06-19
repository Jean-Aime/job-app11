import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  useFrameworkReady();
  const { isLoading, refreshUser } = useAuthStore();

  useEffect(() => {
    refreshUser();

    // Suppress the aria-hidden focus warning that fires on every screen
    // transition on web. It comes from react-native-screens applying
    // aria-hidden to offscreen stack containers before the browser
    // moves focus away — a known library issue with no functional impact.
    // We guard with typeof window to ensure this only runs on web.
    if (typeof window !== 'undefined') {
      const _error = console.error.bind(console);
      console.error = (...args: any[]) => {
        const msg = typeof args[0] === 'string' ? args[0] : '';
        if (msg.includes('aria-hidden') && msg.includes('descendant retained focus')) return;
        _error(...args);
      };
    }
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bgCard }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
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
