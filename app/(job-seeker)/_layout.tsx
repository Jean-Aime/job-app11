import { View, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Briefcase, Map, FileText, User, Bookmark } from 'lucide-react-native';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Colors, Space, Typography, Palette } from '@/constants/theme';

export default function JobSeekerLayout() {
  const { isLoading } = useAuthGuard('job_seeker');

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Palette.white }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const isSmallDevice = Dimensions.get('window').width <= 360;
  const tabIconSize = isSmallDevice ? 20 : 22;
  const tabFontSize = isSmallDevice ? 9 : 10;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: Palette.white,
          borderTopColor: '#F1F5F9',
          borderTopWidth: 1,
          paddingTop: Platform.select({ ios: 8, android: 6, default: 8 }),
          paddingBottom: Platform.select({ 
            ios: Space.bottomInset || 20, 
            android: 8, 
            default: 10 
          }),
          height: Space.tabBarHeight,
          paddingHorizontal: isSmallDevice ? 0 : 4,
        },
        tabBarLabelStyle: {
          fontSize: tabFontSize,
          fontWeight: '600',
          marginTop: 2,
          letterSpacing: 0.1,
        },
        tabBarItemStyle: {
          paddingHorizontal: isSmallDevice ? 2 : 4,
        },
      }}
    >
      {/* ── Visible tabs ── */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={tabIconSize} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color }) => <Briefcase color={color} size={tabIconSize} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <Map color={color} size={tabIconSize} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color }) => <Bookmark color={color} size={tabIconSize} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Applied',
          tabBarIcon: ({ color }) => <FileText color={color} size={tabIconSize} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User color={color} size={tabIconSize} strokeWidth={2} />,
        }}
      />

      {/* ── Hidden sub-routes — MUST be listed to suppress from tab bar ── */}
      <Tabs.Screen name="jobs/[id]"                         options={{ href: null }} />
      <Tabs.Screen name="applications/[id]"                 options={{ href: null }} />
      <Tabs.Screen name="profile/skills/index"              options={{ href: null }} />
      <Tabs.Screen name="profile/experience/new"            options={{ href: null }} />
      <Tabs.Screen name="profile/certificates/new"          options={{ href: null }} />
    </Tabs>
  );
}
