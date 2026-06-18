import { useState } from 'react';
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
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  FileText,
  Check,
  X,
} from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

const experienceSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  job_title: z.string().min(1, 'Job title is required'),
  location: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  is_current: z.boolean(),
  description: z.string().optional(),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

export default function AddExperienceScreen() {
  const router = useRouter();
  const { jobSeeker } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [isCurrent, setIsCurrent] = useState(false);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      company_name: '',
      job_title: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
    } as ExperienceFormData,
  });

  const onSubmit = async (data: ExperienceFormData) => {
    if (!jobSeeker) {
      Alert.alert('Error', 'Profile not found');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('experiences').insert({
      job_seeker_id: jobSeeker.id,
      company_name: data.company_name,
      job_title: data.job_title,
      location: data.location || null,
      start_date: data.start_date,
      end_date: isCurrent ? null : data.end_date,
      is_current: isCurrent,
      description: data.description || null,
    });

    setLoading(false);
    if (error) {
      Alert.alert('Error', 'Failed to add experience');
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Experience</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* Company Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Company Name *</Text>
          <Controller
            control={control}
            name="company_name"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.inputContainer, errors.company_name && styles.inputError]}>
                <Building2 color="#94A3B8" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Google, Microsoft"
                  placeholderTextColor="#94A3B8"
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />
          {errors.company_name && (
            <Text style={styles.errorText}>{errors.company_name.message}</Text>
          )}
        </View>

        {/* Job Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Job Title *</Text>
          <Controller
            control={control}
            name="job_title"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.inputContainer, errors.job_title && styles.inputError]}>
                <Briefcase color="#94A3B8" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Software Engineer"
                  placeholderTextColor="#94A3B8"
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />
          {errors.job_title && (
            <Text style={styles.errorText}>{errors.job_title.message}</Text>
          )}
        </View>

        {/* Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location</Text>
          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <MapPin color="#94A3B8" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Kigali, Rwanda"
                  placeholderTextColor="#94A3B8"
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />
        </View>

        {/* Start Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Date *</Text>
          <Controller
            control={control}
            name="start_date"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.inputContainer, errors.start_date && styles.inputError]}>
                <Calendar color="#94A3B8" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                />
              </View>
            )}
          />
          {errors.start_date && (
            <Text style={styles.errorText}>{errors.start_date.message}</Text>
          )}
        </View>

        {/* Currently Working Here */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => {
            setIsCurrent(!isCurrent);
            setValue('is_current', !isCurrent);
          }}
        >
          <View style={[styles.checkbox, isCurrent && styles.checkboxActive]}>
            {isCurrent && <Check color="#FFFFFF" size={16} />}
          </View>
          <Text style={styles.checkboxLabel}>I currently work here</Text>
        </TouchableOpacity>

        {/* End Date */}
        {!isCurrent && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>End Date</Text>
            <Controller
              control={control}
              name="end_date"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Calendar color="#94A3B8" size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94A3B8"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                  />
                </View>
              )}
            />
          </View>
        )}

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <FileText color="#94A3B8" size={20} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe your responsibilities and achievements..."
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
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmit(onSubmit) as any}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Check color="#FFFFFF" size={20} />
              <Text style={styles.saveButtonText}>Save Experience</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
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
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 120,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#1E293B',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 40,
  },
});
