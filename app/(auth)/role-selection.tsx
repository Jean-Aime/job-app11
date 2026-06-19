import { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Animated, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Building2, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius, Palette } from '@/constants/theme';

const { width } = Dimensions.get('window');

type Role = 'job_seeker' | 'employer';

const ROLES = [
  {
    role: 'job_seeker' as Role,
    icon: User,
    title: 'Job Seeker',
    subtitle: 'Find your dream job',
    features: ['Browse thousands of jobs', 'AI-powered job matching', 'Track your applications'],
    gradient: ['#1D4ED8', '#2563EB', '#3B82F6'] as [string, string, string],
    cta: 'Create Seeker Account',
  },
  {
    role: 'employer' as Role,
    icon: Building2,
    title: 'Employer',
    subtitle: 'Hire the best talent',
    features: ['Post unlimited jobs', 'Smart candidate matching', 'Manage applications'],
    gradient: ['#065F46', '#047857', '#059669'] as [string, string, string],
    cta: 'Register Company',
  },
];

function RoleCard({ role, icon: Icon, title, subtitle, features, gradient, cta, index, onPress }: any) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 480,
      delay: index * 180,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.cardWrap,
        {
          opacity: anim,
          transform: [{
            translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }),
          }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress(role);
        }}
        activeOpacity={0.88}
      >
        <LinearGradient
          colors={gradient}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrap}>
              <Icon color={Palette.white} size={28} strokeWidth={1.8} />
            </View>
            <View style={styles.cardTitles}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardSubtitle}>{subtitle}</Text>
            </View>
          </View>

          {/* Features */}
          <View style={styles.featureList}>
            {features.map((f: string) => (
              <View key={f} style={styles.featureItem}>
                <CheckCircle color="rgba(255,255,255,0.9)" size={14} strokeWidth={2.5} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <View style={styles.cardCta}>
            <Text style={styles.cardCtaText}>{cta}</Text>
            <View style={styles.cardCtaArrow}>
              <ArrowRight color={gradient[0]} size={18} strokeWidth={2.5} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function RoleSelectionScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={Colors.textPrimary} size={22} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.heading}>Choose Your Path</Text>
          <Text style={styles.subheading}>How would you like to use JobLink Africa?</Text>
        </View>
      </View>

      {/* Role cards */}
      <View style={styles.cards}>
        {ROLES.map((r, i) => (
          <RoleCard
            key={r.role}
            {...r}
            index={i}
            onPress={(role: Role) =>
              router.push({ pathname: '/(auth)/register', params: { role } })
            }
          />
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.footerLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[5],
    gap: Spacing[4],
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  headerText: { gap: 4 },
  heading:    { fontSize: 28, fontWeight: '700', color: Colors.textPrimary },
  subheading: { fontSize: 16, color: Colors.textSecondary, lineHeight: 24 },

  cards:   { flex: 1, paddingHorizontal: Spacing[5], gap: Spacing[4] },
  cardWrap:{ borderRadius: Radius.xl, overflow: 'hidden' },
  card:    { padding: Spacing[6], borderRadius: Radius.xl, gap: Spacing[5] },

  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[4] },
  cardIconWrap: {
    width: 60, height: 60, borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitles:   { flex: 1 },
  cardTitle:    { fontSize: 24, fontWeight: '700', color: Palette.white, marginBottom: 2 },
  cardSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },

  featureList: { gap: Spacing[2.5] },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2.5] },
  featureText: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '500', flex: 1 },

  cardCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing[4],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  cardCtaText: { fontSize: 15, fontWeight: '700', color: Palette.white },
  cardCtaArrow: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Palette.white,
    alignItems: 'center', justifyContent: 'center',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing[6],
    gap: Spacing[2],
  },
  footerText: { fontSize: 15, color: Colors.textSecondary },
  footerLink: { fontSize: 15, fontWeight: '600', color: Colors.primary },
});
