import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Award, Building2, Calendar, Link, Hash } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Colors, Typography, Spacing, Space, G, Palette,
} from '@/constants/theme';

const schema = z.object({
  title:                 z.string().min(1, 'Title is required'),
  issuing_organization:  z.string().optional(),
  issue_date:            z.string().optional(),
  expiry_date:           z.string().optional(),
  certificate_url:       z.string().optional(),
  credential_id:         z.string().optional(),
});
type Form = z.infer<typeof schema>;

export default function NewCertificateScreen() {
  const router = useRouter();
  const { jobSeeker } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', issuing_organization: '', issue_date: '', expiry_date: '', certificate_url: '', credential_id: '' },
  });

  const onSubmit = async (data: Form) => {
    if (!jobSeeker) return;
    setSaving(true);
    const payload = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== ''));
    const { error } = await supabase.from('certificates').insert({ ...payload, job_seeker_id: jobSeeker.id });
    setSaving(false);
    if (error) { Alert.alert('Error', 'Failed to save certificate.'); }
    else { router.back(); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.navBar}>
        <TouchableOpacity style={G.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={Colors.textPrimary} size={20} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Add Certificate</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Controller control={control} name="title" render={({ field: { onChange, value } }) => (
          <Input label="Certificate Title" placeholder="e.g. AWS Solutions Architect" value={value} onChangeText={onChange}
            leftIcon={<Award color={Colors.textMuted} size={17} strokeWidth={2} />}
            error={errors.title?.message} required />
        )} />

        <Controller control={control} name="issuing_organization" render={({ field: { onChange, value } }) => (
          <Input label="Issuing Organization" placeholder="e.g. Amazon Web Services" value={value || ''} onChangeText={onChange}
            leftIcon={<Building2 color={Colors.textMuted} size={17} strokeWidth={2} />} />
        )} />

        <View style={styles.row}>
          <View style={styles.half}>
            <Controller control={control} name="issue_date" render={({ field: { onChange, value } }) => (
              <Input label="Issue Date" placeholder="YYYY-MM-DD" value={value || ''} onChangeText={onChange}
                leftIcon={<Calendar color={Colors.textMuted} size={17} strokeWidth={2} />} />
            )} />
          </View>
          <View style={styles.half}>
            <Controller control={control} name="expiry_date" render={({ field: { onChange, value } }) => (
              <Input label="Expiry Date" placeholder="YYYY-MM-DD" value={value || ''} onChangeText={onChange}
                leftIcon={<Calendar color={Colors.textMuted} size={17} strokeWidth={2} />} />
            )} />
          </View>
        </View>

        <Controller control={control} name="credential_id" render={({ field: { onChange, value } }) => (
          <Input label="Credential ID" placeholder="e.g. ABC-123456" value={value || ''} onChangeText={onChange}
            leftIcon={<Hash color={Colors.textMuted} size={17} strokeWidth={2} />} />
        )} />

        <Controller control={control} name="certificate_url" render={({ field: { onChange, value } }) => (
          <Input label="Certificate URL" placeholder="https://..." value={value || ''} onChangeText={onChange}
            keyboardType="url" autoCapitalize="none"
            leftIcon={<Link color={Colors.textMuted} size={17} strokeWidth={2} />} />
        )} />

        <View style={{ marginTop: Spacing[4] }}>
          <Button onPress={handleSubmit(onSubmit)} label="Save Certificate" loading={saving} size="lg" />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { ...G.screen },
  navBar:    { ...G.rowBetween, paddingHorizontal: Space.pagePadding, paddingTop: Space.pageTop, paddingBottom: Spacing[3], backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  navTitle:  { ...Typography.h5, color: Colors.textPrimary },
  scroll:    { padding: Space.pagePadding, gap: Spacing[4] },
  row:       { flexDirection: 'row', gap: Spacing[3] },
  half:      { flex: 1 },
});
