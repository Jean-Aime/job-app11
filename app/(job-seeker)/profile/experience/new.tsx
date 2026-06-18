import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Building2, Briefcase, MapPin, Calendar, FileText, Check } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Colors, Typography, Spacing, Radius, Space, G, Palette,
} from '@/constants/theme';

const schema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  job_title:    z.string().min(1, 'Job title is required'),
  location:     z.string().optional(),
  start_date:   z.string().min(1, 'Start date is required'),
  end_date:     z.string().optional(),
  is_current:   z.boolean(),
  description:  z.string().optional(),
});
type Form = z.infer<typeof schema>;

export default function NewExperienceScreen() {
  const router = useRouter();
  const { jobSeeker } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { company_name: '', job_title: '', location: '', start_date: '', end_date: '', is_current: false, description: '' },
  });

  const isCurrent = watch('is_current');

  const onSubmit = async (data: Form) => {
    if (!jobSeeker) return;
    setSaving(true);
    const { error } = await supabase.from('experiences').insert({ ...data, job_seeker_id: jobSeeker.id, end_date: data.is_current ? null : data.end_date || null });
    setSaving(false);
    if (error) { Alert.alert('Error', 'Failed to save experience.'); }
    else { router.back(); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.navBar}>
        <TouchableOpacity style={G.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={Colors.textPrimary} size={20} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Add Experience</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Controller control={control} name="company_name" render={({ field: { onChange, value } }) => (
          <Input label="Company Name" placeholder="e.g. Andela Rwanda" value={value} onChangeText={onChange}
            leftIcon={<Building2 color={Colors.textMuted} size={17} strokeWidth={2} />}
            error={errors.company_name?.message} required />
        )} />

        <Controller control={control} name="job_title" render={({ field: { onChange, value } }) => (
          <Input label="Job Title" placeholder="e.g. Software Engineer" value={value} onChangeText={onChange}
            leftIcon={<Briefcase color={Colors.textMuted} size={17} strokeWidth={2} />}
            error={errors.job_title?.message} required />
        )} />

        <Controller control={control} name="location" render={({ field: { onChange, value } }) => (
          <Input label="Location" placeholder="e.g. Kigali, Rwanda" value={value || ''} onChangeText={onChange}
            leftIcon={<MapPin color={Colors.textMuted} size={17} strokeWidth={2} />} />
        )} />

        <View style={styles.row}>
          <View style={styles.half}>
            <Controller control={control} name="start_date" render={({ field: { onChange, value } }) => (
              <Input label="Start Date" placeholder="YYYY-MM-DD" value={value} onChangeText={onChange}
                leftIcon={<Calendar color={Colors.textMuted} size={17} strokeWidth={2} />}
                error={errors.start_date?.message} required />
            )} />
          </View>
          <View style={styles.half}>
            {!isCurrent && (
              <Controller control={control} name="end_date" render={({ field: { onChange, value } }) => (
                <Input label="End Date" placeholder="YYYY-MM-DD" value={value || ''} onChangeText={onChange}
                  leftIcon={<Calendar color={Colors.textMuted} size={17} strokeWidth={2} />} />
              )} />
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.checkRow} onPress={() => setValue('is_current', !isCurrent)}>
          <View style={[styles.checkbox, isCurrent && { backgroundColor: Colors.primary, borderColor: Colors.primary }]}>
            {isCurrent && <Check color={Palette.white} size={14} strokeWidth={3} />}
          </View>
          <Text style={styles.checkLabel}>I currently work here</Text>
        </TouchableOpacity>

        <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
          <Input label="Description (optional)" placeholder="Describe your responsibilities and achievements…"
            value={value || ''} onChangeText={onChange} multiline
            leftIcon={<FileText color={Colors.textMuted} size={17} strokeWidth={2} />}
            style={{ minHeight: 90, textAlignVertical: 'top' }} />
        )} />

        <View style={{ marginTop: Spacing[4] }}>
          <Button onPress={handleSubmit(onSubmit)} label="Save Experience" loading={saving} size="lg" />
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
  checkRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  checkbox:  { width: 22, height: 22, borderRadius: Radius.xs, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bgCard },
  checkLabel:{ ...Typography.body, color: Colors.textPrimary },
});
