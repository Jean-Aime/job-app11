import { View, ActivityIndicator, Dimensions, Platform } from 'react-native';
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

  const screenWidth = Dimensions.get('window').width;
  const isSmallDevice = screenWidth <= 360;
  const tabIconSize = isSmallDevice ? 20 : 22;
  const tabFontSize = isSmallDevice ? 9 : 10;

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
          paddingTop: Platform.select({ ios: 8, android: 6, default: 8 }),
          paddingBottom: Platform.select({ 
            ios: Space.bottomInset || 10, 
            android: 8, 
            default: 10 
          }),
          height: Space.tabBarHeight,
          paddingHorizontal: isSmallDevice ? 0 : 4,
        },
        tabBarLabelStyle: { 
          fontSize: tabFontSize, 
          fontWeight: '600', 
          marginTop: 3,
          letterSpacing: 0.1,
        },
        tabBarItemStyle: {
          paddingHorizontal: isSmallDevice ? 2 : 4,
        },
      }}
    >
      <Tabs.Screen name="index"        options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={tabIconSize} strokeWidth={2} /> }} />
      <Tabs.Screen name="users"        options={{ title: 'Users',     tabBarIcon: ({ color }) => <Users           color={color} size={tabIconSize} strokeWidth={2} /> }} />
      <Tabs.Screen name="employers"    options={{ title: 'Employers', tabBarIcon: ({ color }) => <Building2       color={color} size={tabIconSize} strokeWidth={2} /> }} />
      <Tabs.Screen name="jobs"         options={{ title: 'Jobs',      tabBarIcon: ({ color }) => <Briefcase       color={color} size={tabIconSize} strokeWidth={2} /> }} />
      <Tabs.Screen name="applications" options={{ title: 'Reviews',   tabBarIcon: ({ color }) => <FileCheck       color={color} size={tabIconSize} strokeWidth={2} /> }} />
    </Tabs>
  );
}
