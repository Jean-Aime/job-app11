import { View, ActivityIndicator, useWindowDimensions, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { LayoutDashboard, Briefcase, Users, Bell, Building2 } from 'lucide-react-native';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Colors, Palette } from '@/constants/theme';

export default function EmployerLayout() {
  const { isLoading } = useAuthGuard('employer');
  const { width: screenWidth } = useWindowDimensions();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bgCard }}>
        <ActivityIndicator size="large" color={Colors.employer} />
      </View>
    );
  }

  const isXSmall = screenWidth <= 360;
  const isSmall = screenWidth <= 390;
  const isTablet = screenWidth >= 768;

  const iconSize = isXSmall ? 20 : isSmall ? 21 : isTablet ? 24 : 22;
  const fontSize = isXSmall ? 10 : isSmall ? 10 : isTablet ? 11 : 10;
  const tabHeight = Platform.select({ 
    ios: isTablet ? 72 : 68, 
    android: isTablet ? 68 : 64, 
    default: 64 
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.employer,
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: Palette.white,
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          height: tabHeight,
          paddingTop: Platform.select({ ios: 8, android: 6, default: 8 }),
          paddingBottom: Platform.select({ 
            ios: isTablet ? 8 : 20, 
            android: 8, 
            default: 8 
          }),
          paddingHorizontal: isXSmall ? 4 : isSmall ? 6 : 8,
        },
        tabBarLabelStyle: { 
          fontSize: fontSize,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 0,
        },
        tabBarItemStyle: {
          paddingHorizontal: isXSmall ? 0 : 2,
          minWidth: isXSmall ? screenWidth / 5 - 8 : undefined,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      {/* ── Main Tabs ── */}
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={iconSize} strokeWidth={2} /> 
        }} 
      />
      <Tabs.Screen 
        name="jobs" 
        options={{ 
          title: 'Jobs',
          tabBarIcon: ({ color }) => <Briefcase color={color} size={iconSize} strokeWidth={2} /> 
        }} 
      />
      <Tabs.Screen 
        name="candidates" 
        options={{ 
          title: 'Candidates',
          tabBarIcon: ({ color }) => <Users color={color} size={iconSize} strokeWidth={2} /> 
        }} 
      />
      <Tabs.Screen 
        name="notifications" 
        options={{ 
          title: 'Alerts',
          tabBarIcon: ({ color }) => <Bell color={color} size={iconSize} strokeWidth={2} /> 
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Company',
          tabBarIcon: ({ color }) => <Building2 color={color} size={iconSize} strokeWidth={2} /> 
        }} 
      />

      {/* ── Hidden Nested Routes ── */}
      <Tabs.Screen name="jobs/new" options={{ tabBarButton: () => null }} />
      <Tabs.Screen name="jobs/[id]/index" options={{ tabBarButton: () => null }} />
      <Tabs.Screen name="jobs/[id]/edit" options={{ tabBarButton: () => null }} />
      <Tabs.Screen name="candidates/[id]" options={{ tabBarButton: () => null }} />
    </Tabs>
  );
}
