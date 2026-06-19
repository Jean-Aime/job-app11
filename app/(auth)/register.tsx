import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Mail, Lock, User, ArrowLeft, Building2, CheckCircle } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Colors, Typography, Spacing, Radius, Palette } from '@/constants/theme';

const schema = z.object({
  fullName:        z.string().min(2, 'Name must be at least 2 characters'),
  email:           z.string().email('Enter a valid email'),
  password:        z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type Form = z.infer<typeof schema>;

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8,           label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p),         label: 'One uppercase letter' },
  { test: (p: string) => /[0-9]/.test(p),         label: 'One number' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role: 'job_seeker' | 'employer' }>();
  const role = params.role || 'job_seeker';
  const isEmployer = role === 'employer';
  const [submitting, setSubmitting] = useState(false);
  const [watchedPw, setWatchedPw] = useState('');
  const { signUp } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: Form) => {
    setSubmitting(true);
    const { error } = await signUp(data.email, data.password, role);
    setSubmitting(false);
    if (error) {
      Alert.alert('Registration Failed', error.message || 'Please try again.');
      return;
    }
    router.replace(isEmployer ? '/(employer)' : '/(job-seeker)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={Colors.textPrimary} size={22} strokeWidth={2} />
          </TouchableOpacity>

          {/* Role badge */}
          <View style={styles.rolePill}>
            <View style={[styles.roleIcon, { backgroundColor: isEmployer ? Colors.employerLight : Colors.primaryLight }]}>
              {isEmployer
                ? <Building2 color={Colors.employer} size={16} strokeWidth={2} />
                : <User color={Colors.primary} size={16} strokeWidth={2} />}
            </View>
            <Text style={[styles.roleLabel, { color: isEmployer ? Colors.employer : Colors.primary }]}>
              {isEmployer ? 'Employer Account' : 'Job Seeker Account'}
            </Text>
          </View>

          {/* Heading */}
          <View style={styles.headingBlock}>
            <Text style={styles.heading}>Create Account</Text>
            <Text style={styles.subheading}>
              {isEmployer
                ? 'Register your company and start hiring top talent'
                : 'Join thousands finding their dream jobs in Africa'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Full Name"
                  placeholder={isEmployer ? 'Company representative name' : 'Your full name'}
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                  autoComplete="name"
                  leftIcon={<User color={Colors.textMuted} size={18} strokeWidth={2} />}
                  error={errors.fullName?.message}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email Address"
                  placeholder={isEmployer ? 'company@example.com' : 'you@example.com'}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
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
                  placeholder="Create a strong password"
                  value={value}
                  onChangeText={(v) => { onChange(v); setWatchedPw(v); }}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  isPassword
                  leftIcon={<Lock color={Colors.textMuted} size={18} strokeWidth={2} />}
                  error={errors.password?.message}
                  required
                />
              )}
            />

            {/* Password strength */}
            {watchedPw.length > 0 && (
              <View style={styles.pwRules}>
                {PASSWORD_RULES.map((r) => {
                  const ok = r.test(watchedPw);
                  return (
                    <View key={r.label} style={styles.pwRule}>
                      <CheckCircle
                        color={ok ? Colors.success : Colors.textMuted}
                        size={14}
                        strokeWidth={2.5}
                      />
                      <Text style={[styles.pwRuleText, ok && styles.pwRuleOk]}>{r.label}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Repeat your password"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  isPassword
                  leftIcon={<Lock color={Colors.textMuted} size={18} strokeWidth={2} />}
                  error={errors.confirmPassword?.message}
                  required
                />
              )}
            />

            <Button
              onPress={handleSubmit(onSubmit)}
              label={isEmployer ? 'Create Company Account' : 'Create Account'}
              loading={submitting}
              variant={isEmployer ? 'employer' : 'primary'}
              size="lg"
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.terms}>
            By creating an account you agree to our{' '}
            <Text style={styles.termsLink}>Terms</Text> &{' '}
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
  scroll: { flexGrow: 1, paddingHorizontal: Spacing[6], paddingBottom: Spacing[8] },

  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.bg,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: Spacing[4],
    marginBottom: Spacing[5],
  },

  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.bg,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    gap: Spacing[2],
    marginBottom: Spacing[5],
  },
  roleIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  roleLabel: { ...Typography.label, fontWeight: '600' },

  headingBlock: { marginBottom: Spacing[7], gap: Spacing[1.5] },
  heading:      { ...Typography.h1, color: Colors.textPrimary },
  subheading:   { ...Typography.body, color: Colors.textSecondary, lineHeight: 22 },

  form: { gap: Spacing[5] },

  pwRules: { gap: Spacing[2], marginTop: -Spacing[2] },
  pwRule:  { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  pwRuleText: { ...Typography.label, color: Colors.textMuted },
  pwRuleOk:   { color: Colors.success },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing[7],
    marginBottom: Spacing[4],
    gap: Spacing[2],
  },
  footerText: { ...Typography.body, color: Colors.textSecondary },
  footerLink: { ...Typography.body, fontWeight: '700', color: Colors.primary },

  terms: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: { color: Colors.primary, fontWeight: '600' },
});
