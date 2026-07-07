import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AlertTriangle, Home } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { Colors, Typography, Spacing, Radius, G, Palette } from '@/constants/theme';

export default function NotFoundScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const goHome = () => {
    if (!isAuthenticated || !user) { router.replace('/(auth)'); return; }
    if (user.role === 'admin')    router.replace('/(admin)');
    else if (user.role === 'employer') router.replace('/(employer)');
    else router.replace('/(job-seeker)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={G.emptyCenter}>
        <View style={styles.iconWrap}>
          <AlertTriangle color={Colors.warning} size={56} strokeWidth={1.5} />
        </View>
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.body}>
          The screen you're looking for doesn't exist or has been moved.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={goHome} activeOpacity={0.85}>
          <Home color={Palette.white} size={20} strokeWidth={2} />
          <Text style={styles.btnText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { ...G.screen },
  iconWrap: {
    width: 112, height: 112, borderRadius: 56,
    backgroundColor: Colors.warningLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing[6],
  },
  title: { ...Typography.h1, color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing[3] },
  body:  { ...Typography.bodyLg, color: Colors.textSecondary, textAlign: 'center', lineHeight: 26, marginBottom: Spacing[8] },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[2],
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[8], paddingVertical: Spacing[4],
    borderRadius: Radius.lg,
  },
  btnText: { ...Typography.buttonLg, color: Palette.white },
});
