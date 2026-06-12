import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Briefcase,
  DollarSign,
  MapPin,
  FileText,
  Users,
  Check,
  Trash2,
} from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

const jobSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  employment_type: z.enum(['full_time', 'part_time', 'contract', 'internship', 'freelance']),
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

type JobFormData = z.infer<typeof jobSchema>;

const employmentTypes = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
];

export default function EditJobScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { employer } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      employment_type: 'full_time',
      required_experience_years: 0,
      salary_currency: 'RWF',
      is_remote: false,
      positions_available: 1,
      salary_min: null,
      salary_max: null,
    },
  });

  useEffect(() => {
    fetchJob();
    fetchCategories();
  }, [id]);

  const fetchJob = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      Alert.alert('Error', 'Failed to load job');
      router.back();
    } else if (data) {
      reset({
        title: data.title,
        description: data.description,
        employment_type: data.employment_type,
        required_experience_years: data.required_experience_years,
        salary_min: data.salary_min,
        salary_max: data.salary_max,
        salary_currency: data.salary_currency || 'RWF',
        city: data.city || '',
        country: data.country || '',
        is_remote: data.is_remote,
        positions_available: data.positions_available,
        category_id: data.category_id || undefined,
      });
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('job_categories').select('*');
    if (data) setCategories(data);
  };

  const onSubmit = async (formData: JobFormData) => {
    if (!id) return;

    setSaving(true);
    const { error } = await supabase
      .from('jobs')
      .update({
        title: formData.title,
        description: formData.description,
        employment_type: formData.employment_type,
        required_experience_years: formData.required_experience_years,
        salary_min: formData.salary_min,
        salary_max: formData.salary_max,
        salary_currency: formData.salary_currency,
        city: formData.city,
        country: formData.country,
        is_remote: formData.is_remote,
        positions_available: formData.positions_available,
        category_id: formData.category_id,
      })
      .eq('id', id);

    setSaving(false);
    if (error) {
      Alert.alert('Error', 'Failed to update job');
    } else {
      Alert.alert('Success', 'Job updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  const deleteJob = async () => {
    Alert.alert(
      'Delete Job',
      'Are you sure you want to delete this job? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('jobs').delete().eq('id', id);
            if (error) {
              Alert.alert('Error', 'Failed to delete job');
            } else {
              router.back();
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Job</Text>
        <TouchableOpacity style={styles.deleteButton} onPress={deleteJob}>
          <Trash2 color="#EF4444" size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
        {/* Job Title */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Job Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Job Title *</Text>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, errors.title && styles.inputError]}>
                  <Briefcase color="#94A3B8" size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Senior Software Developer"
                    placeholderTextColor="#94A3B8"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
          </View>

          {/* Employment Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Employment Type</Text>
            <View style={styles.typeOptions}>
              {employmentTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeOption,
                    watch('employment_type') === type.value && styles.typeOptionActive,
                  ]}
                  onPress={() => setValue('employment_type', type.value as any)}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      watch('employment_type') === type.value && styles.typeOptionTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, styles.textAreaContainer, errors.description && styles.inputError]}>
                  <FileText color="#94A3B8" size={20} />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe the role..."
                    placeholderTextColor="#94A3B8"
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                  />
                </View>
              )}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}
          </View>

          {/* Experience */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Years of Experience</Text>
            <Controller
              control={control}
              name="required_experience_years"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Users color="#94A3B8" size={20} />
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={value.toString()}
                    onChangeText={(text) => onChange(parseInt(text) || 0)}
                  />
                  <Text style={styles.inputSuffix}>years</Text>
                </View>
              )}
            />
          </View>

          {/* Positions */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Positions Available</Text>
            <Controller
              control={control}
              name="positions_available"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Users color="#94A3B8" size={20} />
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={value.toString()}
                    onChangeText={(text) => onChange(parseInt(text) || 1)}
                  />
                </View>
              )}
            />
          </View>
        </View>

        {/* Salary */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Salary</Text>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Minimum</Text>
              <Controller
                control={control}
                name="salary_min"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputContainer}>
                    <DollarSign color="#94A3B8" size={20} />
                    <TextInput
                      style={styles.input}
                      keyboardType="decimal-pad"
                      value={value?.toString() || ''}
                      onChangeText={(text) => onChange(text ? parseFloat(text) : null)}
                    />
                  </View>
                )}
              />
            </View>
            <View style={styles.inputSpacer} />
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Maximum</Text>
              <Controller
                control={control}
                name="salary_max"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputContainer}>
                    <DollarSign color="#94A3B8" size={20} />
                    <TextInput
                      style={styles.input}
                      keyboardType="decimal-pad"
                      value={value?.toString() || ''}
                      onChangeText={(text) => onChange(text ? parseFloat(text) : null)}
                    />
                  </View>
                )}
              />
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Location</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>City</Text>
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <MapPin color="#94A3B8" size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="City"
                    placeholderTextColor="#94A3B8"
                    value={value || ''}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Country</Text>
            <Controller
              control={control}
              name="country"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <MapPin color="#94A3B8" size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="Country"
                    placeholderTextColor="#94A3B8"
                    value={value || ''}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
          </View>

          <Controller
            control={control}
            name="is_remote"
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => onChange(!value)}
              >
                <View style={[styles.checkbox, value && styles.checkboxActive]}>
                  {value && <Check color="#FFFFFF" size={16} />}
                </View>
                <Text style={styles.checkboxLabel}>Remote / Work from Home</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Category */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryOption,
                  watch('category_id') === cat.id && styles.categoryOptionActive,
                ]}
                onPress={() => setValue('category_id', cat.id)}
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    watch('category_id') === cat.id && styles.categoryOptionTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmit(onSubmit) as any}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Check color="#FFFFFF" size={20} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  deleteButton: {
    padding: 8,
  },
  form: {
    padding: 20,
  },
  formSection: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: '#F8FAFC',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  inputSuffix: {
    fontSize: 14,
    color: '#64748B',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginTop: 4,
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  typeOptionActive: {
    backgroundColor: '#059669',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  typeOptionTextActive: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
  },
  inputSpacer: {
    width: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#1E293B',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  categoryOptionActive: {
    backgroundColor: '#059669',
  },
  categoryOptionText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  categoryOptionTextActive: {
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingBottom: 32,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 16,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
