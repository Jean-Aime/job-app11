import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function AuthLayout() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    if (user.role === 'job_seeker') {
      return <Redirect href="/(job-seeker)" />;
    } else if (user.role === 'employer') {
      return <Redirect href="/(employer)" />;
    } else if (user.role === 'admin') {
      return <Redirect href="/(admin)" />;
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="role-selection" />
    </Stack>
  );
}
