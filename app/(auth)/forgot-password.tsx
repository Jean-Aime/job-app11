import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Colors, Typography, Spacing, Radius, Space, G, Palette,
} from '@/constants/theme';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
type Form = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword, isLoading } = useAuthStore();
  const [emailSent, setEmailSent] = useState(false);

  const { control, handleSubmit, getValues, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: Form) => {
    const { error } = await resetPassword(data.email);
    if (error) {
      Alert.alert('Error', error.message || 'Could not send reset link. Try again.');
    } else {
      setEmailSent(true);
    }
  };

  // ── Success state ─────────────────────────────────────────────────────────
  if (emailSent) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.successWrap}>
          <View style={styles.successIconWrap}>
            <CheckCircle color={Colors.success} size={56} strokeWidth={1.5} />
          </View>
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successBody}>
            We've sent password reset instructions to{'\n'}
            <Text style={styles.successEmail}>{getValues('email')}</Text>
          </Text>
          <Button
            onPress={() => router.push('/(auth)/login')}
            label="Back to Sign In"
            size="lg"
          />
          <TouchableOpacity
            style={styles.resendBtn}
            onPress={() => setEmailSent(false)}
          >
            <Text style={styles.resendText}>Didn't receive it? Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Form state ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
          <TouchableOpacity style={G.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={Colors.textPrimary} size={20} strokeWidth={2} />
          </TouchableOpacity>

          {/* Heading */}
          <View style={styles.headingBlock}>
            <Text style={styles.heading}>Forgot Password?</Text>
            <Text style={styles.subheading}>
              Enter your email and we'll send you a link to reset your password.
            </Text>
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
                  autoComplete="email"
                  leftIcon={<Mail color={Colors.textMuted} size={18} strokeWidth={2} />}
                  error={errors.email?.message}
                  required
                />
              )}
            />

            <Button
              onPress={handleSubmit(onSubmit)}
              label="Send Reset Link"
              loading={isLoading}
              size="lg"
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: Space.pagePadding,
    paddingTop: Space.pageTop,
    paddingBottom: Spacing[8],
  },

  headingBlock: {
    marginTop: Spacing[7],
    marginBottom: Spacing[8],
    gap: Spacing[2],
  },
  heading:    { ...Typography.h1, color: Colors.textPrimary },
  subheading: { ...Typography.body, color: Colors.textSecondary, lineHeight: 24 },

  form:   { gap: Spacing[5] },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: Spacing[8],
    gap: Spacing[2],
  },
  footerText: { ...Typography.body, color: Colors.textSecondary },
  footerLink: { ...Typography.body, fontWeight: '600', color: Colors.primary },

  // Success
  successWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Space.pagePadding * 1.5,
    gap: Spacing[5],
  },
  successIconWrap: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  successTitle: { ...Typography.h1, color: Colors.textPrimary, textAlign: 'center' },
  successBody:  { ...Typography.bodyLg, color: Colors.textSecondary, textAlign: 'center', lineHeight: 26 },
  successEmail: { color: Colors.primary, fontWeight: '600' },
  resendBtn:    { paddingVertical: Spacing[2] },
  resendText:   { ...Typography.body, color: Colors.textMuted },
});
