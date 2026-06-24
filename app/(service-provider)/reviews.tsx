import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star } from 'lucide-react-native';
import { Colors, Typography, Spacing, G } from '@/constants/theme';

export default function ReviewsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Star color={Colors.textMuted} size={64} strokeWidth={1.5} />
        <Text style={styles.title}>Reviews & Ratings</Text>
        <Text style={styles.subtitle}>Coming in Phase 6</Text>
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
