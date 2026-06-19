import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Mail,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
  ChevronRight,
  Briefcase,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Colors, Typography, Spacing, Radius, Palette } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

const schema = z.object({
  email:    z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type Form = z.infer<typeof schema>;

// ─── Animated Input Field ──────────────────────────────────────────────────────
function FloatingInput({
  label,
  value,
  onChangeText,
  error,
  secureEntry,
  keyboardType,
  autoCapitalize,
  autoComplete,
  icon: Icon,
}: any) {
  const [focused,  setFocused]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const onFocus = () => {
    setFocused(true);
    Animated.timing(labelAnim, { toValue: 1, duration: 180, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    setFocused(false);
    if (!value) {
      Animated.timing(labelAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start();
    }
  };

  const labelTop  = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [17, -8] });
  const labelSize = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 11] });
  const labelColor= labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? '#EF4444' : '#94A3B8',
      error ? '#EF4444' : focused ? Colors.primary : '#64748B',
    ],
  });

  const borderColor = error
    ? '#EF4444'
    : focused
    ? Colors.primary
    : '#E2E8F0';

  const bgColor = error
    ? '#FFF1F2'
    : focused
    ? Colors.primaryLight
    : '#F8FAFC';

  return (
    <View style={fi.wrapper}>
      <View
        style={[
          fi.container,
          { borderColor, backgroundColor: bgColor },
        ]}
      >
        {/* Floating label */}
        <Animated.Text
          style={[
            fi.label,
            { top: labelTop, fontSize: labelSize, color: labelColor },
          ]}
        >
          {label}
        </Animated.Text>

        {/* Left icon */}
        <View style={fi.iconLeft}>
          <Icon
            color={focused ? Colors.primary : error ? '#EF4444' : '#94A3B8'}
            size={18}
            strokeWidth={2}
          />
        </View>

        {/* Input */}
        <TextInput
          style={fi.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          secureTextEntry={secureEntry && !showPass}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || 'none'}
          autoComplete={autoComplete}
          autoCorrect={false}
          placeholderTextColor="transparent"
        />

        {/* Right icon (password toggle) */}
        {secureEntry && (
          <TouchableOpacity
            style={fi.iconRight}
            onPress={() => setShowPass(p => !p)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {showPass
              ? <EyeOff color="#94A3B8" size={18} strokeWidth={2} />
              : <Eye    color="#94A3B8" size={18} strokeWidth={2} />}
          </TouchableOpacity>
        )}
      </View>

      {/* Error message */}
      {error && (
        <View style={fi.errorRow}>
          <View style={fi.errorDot} />
          <Text style={fi.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuthStore();
  const btnScale = useRef(new Animated.Value(1)).current;

  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: Form) => {
    setSubmitting(true);
    const { error, user } = await signIn(data.email, data.password);
    setSubmitting(false);

    if (error) {
      Alert.alert('Sign In Failed', error.message || 'Invalid credentials. Please try again.');
      return;
    }
    if (user?.role === 'admin')         router.replace('/(admin)');
    else if (user?.role === 'employer') router.replace('/(employer)');
    else                                router.replace('/(job-seeker)');
  };

  const onBtnPressIn  = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  const onBtnPressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, speed: 30 }).start();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      {/* Subtle gradient background */}
      <LinearGradient
        colors={['#EFF6FF', '#FFFFFF', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.4 }}
      />

      {/* Decorative top arc */}
      <View style={styles.arcWrap} pointerEvents="none">
        <View style={styles.arc} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft color="#1E293B" size={20} strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Logo + brand */}
          <View style={styles.brand}>
            <LinearGradient
              colors={[Colors.primary, '#3B82F6']}
              style={styles.logoGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Briefcase color={Palette.white} size={26} strokeWidth={2} />
            </LinearGradient>
            <View>
              <Text style={styles.brandName}>JobLink Africa</Text>
              <Text style={styles.brandTagline}>Your career, accelerated.</Text>
            </View>
          </View>

          {/* Heading */}
          <View style={styles.headingWrap}>
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.subheading}>
              Sign in to access your account and continue your journey
            </Text>
          </View>

          {/* Card containing the form */}
          <View style={styles.card}>
            <View style={styles.form}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <FloatingInput
                    label="Email Address"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    autoComplete="email"
                    icon={Mail}
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <FloatingInput
                    label="Password"
                    value={value}
                    onChangeText={onChange}
                    autoComplete="password"
                    secureEntry
                    icon={Lock}
                    error={errors.password?.message}
                  />
                )}
              />
            </View>

            {/* Forgot password */}
            <TouchableOpacity
              style={styles.forgot}
              onPress={() => router.push('/(auth)/forgot-password')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Sign in button */}
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity
                style={[styles.signInBtn, submitting && styles.signInBtnLoading]}
                onPress={handleSubmit(onSubmit)}
                onPressIn={onBtnPressIn}
                onPressOut={onBtnPressOut}
                disabled={submitting}
                activeOpacity={1}
              >
                <LinearGradient
                  colors={submitting ? ['#94A3B8', '#94A3B8'] : [Colors.primary, '#3B82F6']}
                  style={styles.signInGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {submitting ? (
                    <Text style={styles.signInText}>Signing in…</Text>
                  ) : (
                    <>
                      <Text style={styles.signInText}>Sign In</Text>
                      <View style={styles.signInArrow}>
                        <ChevronRight color={Colors.primary} size={18} strokeWidth={2.5} />
                      </View>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Create account */}
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => router.push('/(auth)/role-selection')}
              activeOpacity={0.8}
            >
              <Text style={styles.createBtnText}>Create a new account</Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Floating Input Styles ────────────────────────────────────────────────────
const fi = StyleSheet.create({
  wrapper:   { gap: 4 },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[4],
    height: 58,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: 48,
    backgroundColor: 'transparent',
    paddingHorizontal: 2,
    fontWeight: '500',
    zIndex: 1,
  },
  iconLeft:  { marginRight: Spacing[3] },
  iconRight: { marginLeft: Spacing[2], padding: 4 },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    paddingTop: 12,
    padding: 0,
  },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 4 },
  errorDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#EF4444' },
  errorText:{ fontSize: 12, color: '#EF4444', fontWeight: '500' },
});

// ─── Screen Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: Palette.white },
  kav:   { flex: 1 },

  arcWrap: {
    position: 'absolute',
    top: -height * 0.12,
    right: -width * 0.25,
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    overflow: 'hidden',
    opacity: 0.35,
  },
  arc: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
    borderRadius: width * 0.45,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  backBtn: {
    width: 42, height: 42,
    borderRadius: 21,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 28,
    alignSelf: 'flex-start',
    // Web-safe shadow
    ...Platform.select({
      ios:     { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
      default: { boxShadow: '0px 2px 6px rgba(15,23,42,0.06)' },
    }),
  },

  // Brand
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 32,
  },
  logoGrad: {
    width: 52, height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios:     { shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
      android: { elevation: 6 },
      default: { boxShadow: '0px 4px 12px rgba(37,99,235,0.3)' },
    }),
  },
  brandName:    { fontSize: 18, fontWeight: '700', color: '#1E293B', letterSpacing: -0.3 },
  brandTagline: { fontSize: 12, color: '#94A3B8', marginTop: 2, fontWeight: '500' },

  // Heading
  headingWrap: { marginBottom: 28, gap: 8 },
  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  subheading: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
    fontWeight: '400',
  },

  // Form card
  card: {
    backgroundColor: Palette.white,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 20,
    ...Platform.select({
      ios:     { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24 },
      android: { elevation: 4 },
      default: { boxShadow: '0px 8px 24px rgba(15,23,42,0.08)' },
    }),
  },
  form: { gap: 16 },

  // Forgot
  forgot:     { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  // Sign in button
  signInBtn: { borderRadius: 16, overflow: 'hidden' },
  signInBtnLoading: { opacity: 0.75 },
  signInGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    paddingHorizontal: 24,
    gap: 8,
  },
  signInText:  { fontSize: 17, fontWeight: '700', color: Palette.white, letterSpacing: 0.2 },
  signInArrow: {
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: -4,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#F1F5F9' },
  dividerText: { fontSize: 12, color: '#CBD5E1', fontWeight: '600', letterSpacing: 0.5 },

  // Create account button
  createBtn: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  createBtnText: { fontSize: 15, fontWeight: '600', color: '#1E293B' },

  // Terms
  terms: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 20,
  },
  termsLink: { color: Colors.primary, fontWeight: '600' },
});
