import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Briefcase, DollarSign, MapPin, FileText, Users, Check } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FilterChip } from '@/components/ui/FilterChip';
import {
  Colors, Typography, Spacing, Radius, Space, G, Palette,
} from '@/constants/theme';

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  employment_type: z.enum(['full_time','part_time','contract','internship','freelance']),
  required_experience_years: z.number().min(0),
  salary_min: z.number().nullish(),
  salary_max: z.number().nullish(),
  salary_currency: z.string(),
  city: z.string().optional(),
  country: z.string().optional(),
  is_remote: z.boolean(),
  positions_available: z.number().min(1),
  category_id: z.string().optional(),
});
type Form = z.infer<typeof schema>;

const EMP_TYPES = [
  { value: 'full_time',  label: 'Full Time' },
  { value: 'part_time',  label: 'Part Time' },
  { value: 'contract',   label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance',  label: 'Freelance' },
];

export default function PostJobScreen() {
  const router  = useRouter();
  const { employer } = useAuthStore();
  const [saving,      setSaving]      = useState(false);
  const [categories,  setCategories]  = useState<any[]>([]);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', employment_type: 'full_time', required_experience_years: 0, salary_currency: 'RWF', is_remote: false, positions_available: 1, salary_min: null, salary_max: null },
  });

  useEffect(() => {
    supabase.from('job_categories').select('*').then(({ data }) => { if (data) setCategories(data); });
  }, []);

  const onSubmit = async (data: Form) => {
    if (!employer) { Alert.alert('Error', 'Employer profile not found'); return; }
    setSaving(true);
    const { error } = await supabase.from('jobs').insert({ ...data, employer_id: employer.id, status: 'active' });
    setSaving(false);
    if (error) { Alert.alert('Error', 'Failed to post job.'); }
    else { Alert.alert('Posted!', 'Your job is now live.', [{ text: 'OK', onPress: () => router.back() }]); }
  };

  const empType   = watch('employment_type');
  const isRemote  = watch('is_remote');
  const categoryId= watch('category_id');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity style={G.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={Colors.textPrimary} size={20} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Post a Job</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Section: Details */}
        <Text style={styles.sectionTitle}>Job Details</Text>

        <Controller control={control} name="title" render={({ field: { onChange, value } }) => (
          <Input label="Job Title" placeholder="e.g. Senior Developer" value={value} onChangeText={onChange}
            leftIcon={<Briefcase color={Colors.textMuted} size={17} strokeWidth={2} />}
            error={errors.title?.message} required />
        )} />

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Employment Type <Text style={styles.req}>*</Text></Text>
          <View style={styles.chipRow}>
            {EMP_TYPES.map(t => (
              <FilterChip key={t.value} label={t.label} active={empType === t.value}
                onPress={() => setValue('employment_type', t.value as any)} color={Colors.employer} />
            ))}
          </View>
        </View>

        <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
          <Input label="Description" placeholder="Describe the role and responsibilities…"
            value={value} onChangeText={onChange} multiline
            leftIcon={<FileText color={Colors.textMuted} size={17} strokeWidth={2} />}
            error={errors.description?.message} required
            style={{ minHeight: 100, textAlignVertical: 'top' }} />
        )} />

        <View style={styles.row}>
          <View style={styles.half}>
            <Controller control={control} name="required_experience_years" render={({ field: { onChange, value } }) => (
              <Input label="Experience (yrs)" placeholder="0" value={String(value)} onChangeText={v => onChange(parseInt(v) || 0)}
                keyboardType="number-pad" leftIcon={<Users color={Colors.textMuted} size={17} strokeWidth={2} />} />
            )} />
          </View>
          <View style={styles.half}>
            <Controller control={control} name="positions_available" render={({ field: { onChange, value } }) => (
              <Input label="Positions" placeholder="1" value={String(value)} onChangeText={v => onChange(parseInt(v) || 1)}
                keyboardType="number-pad" leftIcon={<Users color={Colors.textMuted} size={17} strokeWidth={2} />} />
            )} />
          </View>
        </View>

        {/* Section: Salary */}
        <Text style={[styles.sectionTitle, { marginTop: Space.sectionGap }]}>Salary (Optional)</Text>
        <View style={styles.row}>
          <View style={styles.half}>
            <Controller control={control} name="salary_min" render={({ field: { onChange, value } }) => (
              <Input label="Min" placeholder="0" value={value?.toString() || ''} onChangeText={v => onChange(v ? parseFloat(v) : null)}
                keyboardType="decimal-pad" leftIcon={<DollarSign color={Colors.textMuted} size={17} strokeWidth={2} />} />
            )} />
          </View>
          <View style={styles.half}>
            <Controller control={control} name="salary_max" render={({ field: { onChange, value } }) => (
              <Input label="Max" placeholder="0" value={value?.toString() || ''} onChangeText={v => onChange(v ? parseFloat(v) : null)}
                keyboardType="decimal-pad" leftIcon={<DollarSign color={Colors.textMuted} size={17} strokeWidth={2} />} />
            )} />
          </View>
        </View>

        {/* Section: Location */}
        <Text style={[styles.sectionTitle, { marginTop: Space.sectionGap }]}>Location</Text>
        <View style={styles.row}>
          <View style={styles.half}>
            <Controller control={control} name="city" render={({ field: { onChange, value } }) => (
              <Input label="City" placeholder="Kigali" value={value || ''} onChangeText={onChange}
                leftIcon={<MapPin color={Colors.textMuted} size={17} strokeWidth={2} />} />
            )} />
          </View>
          <View style={styles.half}>
            <Controller control={control} name="country" render={({ field: { onChange, value } }) => (
              <Input label="Country" placeholder="Rwanda" value={value || ''} onChangeText={onChange}
                leftIcon={<MapPin color={Colors.textMuted} size={17} strokeWidth={2} />} />
            )} />
          </View>
        </View>

        <TouchableOpacity style={styles.checkRow} onPress={() => setValue('is_remote', !isRemote)}>
          <View style={[styles.checkbox, isRemote && { backgroundColor: Colors.employer, borderColor: Colors.employer }]}>
            {isRemote && <Check color={Palette.white} size={14} strokeWidth={3} />}
          </View>
          <Text style={styles.checkLabel}>Remote / Work from Home</Text>
        </TouchableOpacity>

        {/* Section: Category */}
        {categories.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: Space.sectionGap }]}>Category</Text>
            <View style={styles.chipRow}>
              {categories.map(c => (
                <FilterChip key={c.id} label={c.name} active={categoryId === c.id}
                  onPress={() => setValue('category_id', c.id)} color={Colors.employer} />
              ))}
            </View>
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button onPress={handleSubmit(onSubmit)} label="Post Job" loading={saving} variant="employer" size="lg" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { ...G.screen },
  navBar:    { ...G.rowBetween, paddingHorizontal: Space.pagePadding, paddingTop: Space.pageTop, paddingBottom: Spacing[3], backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  navTitle:  { ...Typography.h5, color: Colors.textPrimary },
  scroll:    { padding: Space.pagePadding, gap: Spacing[4] },

  sectionTitle: { ...Typography.h4, color: Colors.textPrimary, marginBottom: Spacing[2] },
  field:     { gap: Spacing[2] },
  fieldLabel:{ ...Typography.inputLabel, color: Colors.textPrimary },
  req:       { color: Colors.error },
  chipRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  row:       { flexDirection: 'row', gap: Spacing[3] },
  half:      { flex: 1 },

  checkRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], paddingVertical: Spacing[1] },
  checkbox: { width: 22, height: 22, borderRadius: Radius.xs, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bgCard },
  checkLabel:{ ...Typography.body, color: Colors.textPrimary },

  footer: { paddingHorizontal: Space.pagePadding, paddingVertical: Spacing[4], paddingBottom: Spacing[8], backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.border },
});
