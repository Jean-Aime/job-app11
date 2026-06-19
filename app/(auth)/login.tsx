import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, Lock, ArrowLeft, Briefcase } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors, Typography, Spacing, Radius, Palette } from '@/constants/theme';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type Form = z.infer<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuthStore();

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
    if (user?.role === 'admin')    router.replace('/(admin)');
    else if (user?.role === 'employer') router.replace('/(employer)');
    else router.replace('/(job-seeker)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={Colors.textPrimary} size={22} strokeWidth={2} />
          </TouchableOpacity>

          {/* Brand mark */}
          <View style={styles.brandMark}>
            <View style={styles.brandIcon}>
              <Briefcase color={Colors.primary} size={24} strokeWidth={2} />
            </View>
            <Text style={styles.brandName}>JobLink Africa</Text>
          </View>

          {/* Heading */}
          <View style={styles.headingBlock}>
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.subheading}>Sign in to continue your journey</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email Address"
                  placeholder="you@example.com"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  leftIcon={<Mail color={Colors.textMuted} size={18} strokeWidth={2} />}
                  error={errors.email?.message}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Password"
                  placeholder="Your password"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  autoComplete="password"
                  isPassword
                  leftIcon={<Lock color={Colors.textMuted} size={18} strokeWidth={2} />}
                  error={errors.password?.message}
                  required
                />
              )}
            />

            <TouchableOpacity
              style={styles.forgot}
              onPress={() => router.push('/(auth)/forgot-password')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <Button
              onPress={handleSubmit(onSubmit)}
              label="Sign In"
              loading={submitting}
              size="lg"
            />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register */}
          <View style={styles.register}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/role-selection')}>
              <Text style={styles.registerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            By signing in, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgCard },
  kav:       { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing[6],
    paddingBottom: Spacing[8],
  },

  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.bg,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: Spacing[4],
    marginBottom: Spacing[5],
  },

  brandMark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2.5],
    marginBottom: Spacing[7],
  },
  brandIcon: {
    width: 40, height: 40, borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  brandName: { ...Typography.h5, color: Colors.textPrimary },

  headingBlock: { marginBottom: Spacing[8], gap: Spacing[1.5] },
  heading:      { ...Typography.display, color: Colors.textPrimary },
  subheading:   { ...Typography.bodyLg, color: Colors.textSecondary },

  form: { gap: Spacing[5] },

  forgot: { alignSelf: 'flex-end', marginTop: -Spacing[2] },
  forgotText: { ...Typography.label, color: Colors.primary, fontWeight: '600' },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing[7],
    gap: Spacing[3],
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { ...Typography.label, color: Colors.textMuted },

  register: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[6],
  },
  registerText: { ...Typography.body, color: Colors.textSecondary },
  registerLink: { ...Typography.body, fontWeight: '700', color: Colors.primary },

  terms: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: { color: Colors.primary, fontWeight: '600' },
});
