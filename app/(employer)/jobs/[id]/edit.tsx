import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Briefcase, DollarSign, MapPin, FileText, Users, Check, Trash2 } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FilterChip } from '@/components/ui/FilterChip';
import {
  Colors, Typography, Spacing, Radius, Space, G, Palette,
} from '@/constants/theme';

const schema = z.object({
  title:                     z.string().min(3),
  description:               z.string().min(20),
  employment_type:           z.enum(['full_time','part_time','contract','internship','freelance']),
  required_experience_years: z.number().min(0),
  salary_min:                z.number().nullish(),
  salary_max:                z.number().nullish(),
  salary_currency:           z.string(),
  city:                      z.string().optional(),
  country:                   z.string().optional(),
  is_remote:                 z.boolean(),
  positions_available:       z.number().min(1),
  category_id:               z.string().optional(),
});
type Form = z.infer<typeof schema>;

const EMP_TYPES = [
  { value: 'full_time',  label: 'Full Time' },
  { value: 'part_time',  label: 'Part Time' },
  { value: 'contract',   label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance',  label: 'Freelance' },
];

export default function EditJobScreen() {
  const router  = useRouter();
  const { id }  = useLocalSearchParams();
  const [saving,     setSaving]     = useState(false);
  const [loadingJob, setLoadingJob] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', employment_type: 'full_time', required_experience_years: 0, salary_currency: 'RWF', is_remote: false, positions_available: 1, salary_min: null, salary_max: null },
  });

  useEffect(() => {
    Promise.all([
      supabase.from('jobs').select('*').eq('id', id).single(),
      supabase.from('job_categories').select('*'),
    ]).then(([{ data: job, error }, { data: cats }]) => {
      if (error || !job) { Alert.alert('Error', 'Failed to load job'); router.back(); return; }
      reset({
        title: job.title, description: job.description,
        employment_type: job.employment_type,
        required_experience_years: job.required_experience_years,
        salary_min: job.salary_min, salary_max: job.salary_max,
        salary_currency: job.salary_currency || 'RWF',
        city: job.city || '', country: job.country || '',
        is_remote: job.is_remote, positions_available: job.positions_available,
        category_id: job.category_id || undefined,
      });
      if (cats) setCategories(cats);
      setLoadingJob(false);
    });
  }, [id]);

  const onSubmit = async (data: Form) => {
    setSaving(true);
    const { error } = await supabase.from('jobs').update({ ...data }).eq('id', id);
    setSaving(false);
    if (error) { Alert.alert('Error', 'Failed to update job.'); }
    else { Alert.alert('Updated!', 'Job has been updated.', [{ text: 'OK', onPress: () => router.back() }]); }
  };

  const deleteJob = () => {
    Alert.alert('Delete Job', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('jobs').delete().eq('id', id);
        router.back();
      }},
    ]);
  };

  const empType    = watch('employment_type');
  const isRemote   = watch('is_remote');
  const categoryId = watch('category_id');

  if (loadingJob) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.navBar}>
          <TouchableOpacity style={G.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={Colors.textPrimary} size={20} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Edit Job</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={G.emptyCenter} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.navBar}>
        <TouchableOpacity style={G.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={Colors.textPrimary} size={20} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Edit Job</Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={deleteJob}>
          <Trash2 color={Colors.error} size={18} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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
          <Input label="Description" placeholder="Describe the role…" value={value} onChangeText={onChange}
            multiline leftIcon={<FileText color={Colors.textMuted} size={17} strokeWidth={2} />}
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

        <Text style={[styles.sectionTitle, { marginTop: Space.sectionGap }]}>Salary</Text>
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

        <View style={{ marginTop: Spacing[6] }}>
          <Button onPress={handleSubmit(onSubmit)} label="Save Changes" loading={saving} variant="employer" size="lg" />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { ...G.screen },
  navBar:      { ...G.rowBetween, paddingHorizontal: Space.pagePadding, paddingTop: Space.pageTop, paddingBottom: Spacing[3], backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  navTitle:    { ...Typography.h5, color: Colors.textPrimary },
  deleteBtn:   { width: 40, height: 40, borderRadius: Radius.md, backgroundColor: Colors.errorLight, alignItems: 'center', justifyContent: 'center' },
  scroll:      { padding: Space.pagePadding, gap: Spacing[4] },
  sectionTitle:{ ...Typography.h4, color: Colors.textPrimary, marginBottom: Spacing[2] },
  field:       { gap: Spacing[2] },
  fieldLabel:  { ...Typography.inputLabel, color: Colors.textPrimary },
  req:         { color: Colors.error },
  chipRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  row:         { flexDirection: 'row', gap: Spacing[3] },
  half:        { flex: 1 },
  checkRow:    { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  checkbox:    { width: 22, height: 22, borderRadius: Radius.xs, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bgCard },
  checkLabel:  { ...Typography.body, color: Colors.textPrimary },
});
