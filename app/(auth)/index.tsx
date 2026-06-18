import { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Animated, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Briefcase, Users, Building2, MapPin, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { Colors, Typography, Spacing, Radius, Palette } from '@/constants/theme';

const { height } = Dimensions.get('window');

const FEATURES = [
  { icon: Users,     title: 'Find Talent',    desc: 'Connect with skilled workers' },
  { icon: Building2, title: 'Top Employers',  desc: 'Discover verified companies' },
  { icon: MapPin,    title: 'Near You',        desc: 'Find jobs based on location' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  // Animations
  const logoAnim  = useRef(new Animated.Value(0)).current;
  const featureAnim = useRef(FEATURES.map(() => new Animated.Value(0))).current;
  const btnAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isAuthenticated && user) {
      redirectByRole(user.role);
      return;
    }

    // Sequence: logo → features (staggered) → buttons
    Animated.sequence([
      Animated.timing(logoAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.stagger(140, featureAnim.map(a =>
        Animated.timing(a, { toValue: 1, duration: 420, useNativeDriver: true })
      )),
      Animated.timing(btnAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, [isAuthenticated, user]);

  const redirectByRole = (role: string) => {
    if (role === 'admin')       router.replace('/(admin)');
    else if (role === 'employer') router.replace('/(employer)');
    else router.replace('/(job-seeker)');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1E3A8A', '#1D4ED8', '#2563EB', '#3B82F6']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circleTop]} />
      <View style={[styles.circle, styles.circleMid]} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoSection,
          {
            opacity: logoAnim,
            transform: [{
              scale: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }),
            }],
          },
        ]}
      >
        <View style={styles.logoRing}>
          <View style={styles.logoBg}>
            <Briefcase color={Palette.white} size={32} strokeWidth={2} />
          </View>
        </View>
        <Text style={styles.appName}>JobLink Africa</Text>
        <Text style={styles.tagline}>Connect. Discover. Succeed.</Text>
      </Animated.View>

      {/* Feature rows */}
      <View style={styles.features}>
        {FEATURES.map((f, i) => (
          <Animated.View
            key={f.title}
            style={[
              styles.featureRow,
              {
                opacity: featureAnim[i],
                transform: [{
                  translateX: featureAnim[i].interpolate({
                    inputRange: [0, 1], outputRange: [-28, 0],
                  }),
                }],
              },
            ]}
          >
            <View style={styles.featureIcon}>
              <f.icon color={Colors.primary} size={20} strokeWidth={2} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

      {/* CTAs */}
      <Animated.View
        style={[
          styles.ctas,
          {
            opacity: btnAnim,
            transform: [{
              translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
            }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/(auth)/role-selection')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Get Started</Text>
          <ChevronRight color={Colors.primary} size={18} strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>I already have an account</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  circle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  circleTop: { width: 320, height: 320, top: -100, right: -80 },
  circleMid: { width: 220, height: 220, top: height * 0.3, left: -80 },

  logoSection: {
    alignItems: 'center',
    marginTop: height * 0.1,
    paddingTop: 40,
  },
  logoRing: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  logoBg: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  appName: {
    fontSize: 34, fontWeight: '800',
    color: Palette.white, letterSpacing: -0.5, marginBottom: 6,
  },
  tagline: {
    fontSize: 16, fontWeight: '500',
    color: 'rgba(255,255,255,0.75)', letterSpacing: 0.3,
  },

  features: { marginTop: 40, paddingHorizontal: 28, gap: 12 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: Radius.xl,
    padding: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  featureIcon: {
    width: 42, height: 42, borderRadius: Radius.md,
    backgroundColor: Palette.white,
    alignItems: 'center', justifyContent: 'center',
  },
  featureText:  { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '600', color: Palette.white, marginBottom: 2 },
  featureDesc:  { fontSize: 13, color: 'rgba(255,255,255,0.7)' },

  ctas: {
    position: 'absolute',
    bottom: 44,
    left: 24, right: 24,
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.white,
    borderRadius: Radius.xl,
    paddingVertical: 17,
    gap: 6,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: Colors.primary },
  secondaryBtn: {
    borderRadius: Radius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: Palette.white },
});
