import { View, ActivityIndicator } from 'react-native';
import { Tabs } from 'expo-router';
import { LayoutDashboard, Briefcase, Users, Bell, User } from 'lucide-react-native';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Colors, Space, Typography } from '@/constants/theme';

export default function EmployerLayout() {
  const { isLoading } = useAuthGuard('employer');

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bgCard }}>
        <ActivityIndicator size="large" color={Colors.employer} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.employer,
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
      <Tabs.Screen name="index"         options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size - 1} strokeWidth={2} /> }} />
      <Tabs.Screen name="jobs"          options={{ title: 'Jobs',      tabBarIcon: ({ color, size }) => <Briefcase       color={color} size={size - 1} strokeWidth={2} /> }} />
      <Tabs.Screen name="candidates"    options={{ title: 'Candidates',tabBarIcon: ({ color, size }) => <Users           color={color} size={size - 1} strokeWidth={2} /> }} />
      <Tabs.Screen name="notifications" options={{ title: 'Alerts',    tabBarIcon: ({ color, size }) => <Bell            color={color} size={size - 1} strokeWidth={2} /> }} />
      <Tabs.Screen name="profile"       options={{ title: 'Company',   tabBarIcon: ({ color, size }) => <User            color={color} size={size - 1} strokeWidth={2} /> }} />
    </Tabs>
  );
}
