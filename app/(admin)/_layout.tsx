import { View, ActivityIndicator } from 'react-native';
import { Tabs } from 'expo-router';
import { LayoutDashboard, Users, Building2, Briefcase, FileCheck } from 'lucide-react-native';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Colors, Space, Typography } from '@/constants/theme';

export default function AdminLayout() {
  const { isLoading } = useAuthGuard('admin');

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bgCard }}>
        <ActivityIndicator size="large" color={Colors.admin} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.admin,
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
      <Tabs.Screen name="index"        options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size - 1} strokeWidth={2} /> }} />
      <Tabs.Screen name="users"        options={{ title: 'Users',     tabBarIcon: ({ color, size }) => <Users           color={color} size={size - 1} strokeWidth={2} /> }} />
      <Tabs.Screen name="employers"    options={{ title: 'Employers', tabBarIcon: ({ color, size }) => <Building2       color={color} size={size - 1} strokeWidth={2} /> }} />
      <Tabs.Screen name="jobs"         options={{ title: 'Jobs',      tabBarIcon: ({ color, size }) => <Briefcase       color={color} size={size - 1} strokeWidth={2} /> }} />
      <Tabs.Screen name="applications" options={{ title: 'Reviews',   tabBarIcon: ({ color, size }) => <FileCheck       color={color} size={size - 1} strokeWidth={2} /> }} />
    </Tabs>
  );
}
