import { useEffect, Platform } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/constants/theme';

// Suppress the aria-hidden focus warning on web that comes from
// react-native-screens / @react-navigation/native-stack hiding offscreen
// stack screens during transitions. This is a library-level issue
// (tracked: github.com/software-mansion/react-native-screens) and has
// no effect on functionality or accessibility in the actual app.
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const _error = console.error.bind(console);
  console.error = (...args: any[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (msg.includes('aria-hidden') && msg.includes('descendant retained focus')) return;
    _error(...args);
  };
}

export default function RootLayout() {
  useFrameworkReady();
  const { isLoading, refreshUser } = useAuthStore();

  useEffect(() => { refreshUser(); }, []);

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
