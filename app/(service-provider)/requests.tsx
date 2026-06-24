import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Briefcase } from 'lucide-react-native';
import { Colors, Typography, Spacing, G } from '@/constants/theme';

export default function ServiceRequestsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Briefcase color={Colors.textMuted} size={64} strokeWidth={1.5} />
        <Text style={styles.title}>Service Requests</Text>
        <Text style={styles.subtitle}>Coming in Phase 4</Text>
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
