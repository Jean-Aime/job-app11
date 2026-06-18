import { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, withSpring, Easing,
} from 'react-native-reanimated';
import { Briefcase, Users, Building2, MapPin, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { Colors, Typography, Spacing, Radius, Palette } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

const FEATURES = [
  { icon: Users,     title: 'Find Talent',      desc: 'Connect with skilled workers' },
  { icon: Building2, title: 'Top Employers',     desc: 'Discover verified companies' },
  { icon: MapPin,    title: 'Location-Based',    desc: 'Find jobs near you' },
];

function FeatureRow({ icon: Icon, title, desc, delay }: any) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-24);

  useEffect(() => {
    opacity.value    = withDelay(delay, withTiming(1, { duration: 500 }));
    translateX.value = withDelay(delay, withSpring(0, { damping: 18 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.featureRow, style]}>
      <View style={styles.featureIcon}>
        <Icon color={Colors.primary} size={20} strokeWidth={2} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </Animated.View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const logoScale   = useSharedValue(0.7);
  const logoOpacity = useSharedValue(0);
  const btnOpacity  = useSharedValue(0);
  const btnY        = useSharedValue(24);

  useEffect(() => {
    if (isAuthenticated && user) {
      redirectByRole(user.role);
      return;
    }
    logoScale.value   = withSpring(1, { damping: 14, stiffness: 120 });
    logoOpacity.value = withTiming(1, { duration: 600 });
    btnOpacity.value  = withDelay(900, withTiming(1, { duration: 400 }));
    btnY.value        = withDelay(900, withSpring(0, { damping: 18 }));
  }, [isAuthenticated, user]);

  const redirectByRole = (role: string) => {
    if (role === 'admin')    router.replace('/(admin)');
    else if (role === 'employer') router.replace('/(employer)');
    else router.replace('/(job-seeker)');
  };

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const btnStyle = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
    transform: [{ translateY: btnY.value }],
  }));

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
      <Animated.View style={[styles.logoSection, logoStyle]}>
        <View style={styles.logoRing}>
          <View style={styles.logoBg}>
            <Briefcase color={Palette.white} size={32} strokeWidth={2} />
          </View>
        </View>
        <Text style={styles.appName}>JobLink Africa</Text>
        <Text style={styles.tagline}>Connect. Discover. Succeed.</Text>
      </Animated.View>

      {/* Features */}
      <View style={styles.features}>
        {FEATURES.map((f, i) => (
          <FeatureRow key={f.title} {...f} delay={300 + i * 150} />
        ))}
      </View>

      {/* CTAs */}
      <Animated.View style={[styles.ctas, btnStyle]}>
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

  // Decorative
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  circleTop: { width: 320, height: 320, top: -100, right: -80 },
  circleMid: { width: 220, height: 220, top: height * 0.3, left: -80 },

  // Logo
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
    fontSize: 34,
    fontWeight: '800',
    color: Palette.white,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.3,
  },

  // Features
  features: {
    marginTop: 40,
    paddingHorizontal: 28,
    gap: 12,
  },
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
  featureText: { flex: 1 },
  featureTitle: {
    fontSize: 15, fontWeight: '600', color: Palette.white, marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13, color: 'rgba(255,255,255,0.7)',
  },

  // CTAs
  ctas: {
    position: 'absolute',
    bottom: 44,
    left: 24,
    right: 24,
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
  primaryBtnText: {
    fontSize: 17, fontWeight: '700', color: Colors.primary,
  },
  secondaryBtn: {
    borderRadius: Radius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  secondaryBtnText: {
    fontSize: 15, fontWeight: '600', color: Palette.white,
  },
});
