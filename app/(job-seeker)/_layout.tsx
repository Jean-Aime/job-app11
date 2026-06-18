import { View, ActivityIndicator } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Briefcase, Map, FileText, User, Bookmark } from 'lucide-react-native';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Colors, Space, Typography } from '@/constants/theme';

export default function JobSeekerLayout() {
  const { isLoading } = useAuthGuard('job_seeker');

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bgCard }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.tabBarBg,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 10,
          height: Space.tabBarHeight,
        },
        tabBarLabelStyle: { ...Typography.tabLabel, marginTop: 3 },
      }}
    >
      <Tabs.Screen name="index"        options={{ title: 'Home',         tabBarIcon: ({ color, size }) => <Home       color={color} size={size - 1} strokeWidth={2} /> }} />
      <Tabs.Screen name="jobs"         options={{ title: 'Jobs',         tabBarIcon: ({ color, size }) => <Briefcase  color={color} size={size - 1} strokeWidth={2} /> }} />
      <Tabs.Screen name="map"          options={{ title: 'Map',          tabBarIcon: ({ color, size }) => <Map        color={color} size={size - 1} strokeWidth={2} /> }} />
      <Tabs.Screen name="saved"        options={{ title: 'Saved',        tabBarIcon: ({ color, size }) => <Bookmark   color={color} size={size - 1} strokeWidth={2} /> }} />
      <Tabs.Screen name="applications" options={{ title: 'Applied',      tabBarIcon: ({ color, size }) => <FileText   color={color} size={size - 1} strokeWidth={2} /> }} />
      <Tabs.Screen name="profile"      options={{ title: 'Profile',      tabBarIcon: ({ color, size }) => <User       color={color} size={size - 1} strokeWidth={2} /> }} />
    </Tabs>
  );
}
