import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';
import { Colors, Typography, Spacing, G } from '@/constants/theme';

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Bell color={Colors.textMuted} size={64} strokeWidth={1.5} />
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>Stay tuned for updates</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { ...G.screen },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing[3] },
  title: { ...Typography.h2, color: Colors.textPrimary },
  subtitle: { ...Typography.body, color: Colors.textMuted },
});
