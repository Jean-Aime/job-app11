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
  Award,
  Building2,
  Calendar,
  Hash,
  Link,
  Check,
} from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

const certificateSchema = z.object({
  title: z.string().min(1, 'Certificate name is required'),
  issuing_organization: z.string().optional(),
  issue_date: z.string().optional(),
  expiry_date: z.string().optional(),
  credential_id: z.string().optional(),
  certificate_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

export default function AddCertificateScreen() {
  const router = useRouter();
  const { jobSeeker } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      title: '',
      issuing_organization: '',
      issue_date: '',
      expiry_date: '',
      credential_id: '',
      certificate_url: '',
    },
  });

  const onSubmit = async (data: CertificateFormData) => {
    if (!jobSeeker) {
      Alert.alert('Error', 'Profile not found');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('certificates').insert({
      job_seeker_id: jobSeeker.id,
      title: data.title,
      issuing_organization: data.issuing_organization || null,
      issue_date: data.issue_date || null,
      expiry_date: data.expiry_date || null,
      credential_id: data.credential_id || null,
      certificate_url: data.certificate_url || null,
    });

    setLoading(false);
    if (error) {
      Alert.alert('Error', 'Failed to add certificate');
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
        <Text style={styles.headerTitle}>Add Certificate</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* Certificate Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Certificate Name *</Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.inputContainer, errors.title && styles.inputError]}>
                <Award color="#94A3B8" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. AWS Solutions Architect"
                  placeholderTextColor="#94A3B8"
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />
          {errors.title && (
            <Text style={styles.errorText}>{errors.title.message}</Text>
          )}
        </View>

        {/* Issuing Organization */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Issuing Organization</Text>
          <Controller
            control={control}
            name="issuing_organization"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <Building2 color="#94A3B8" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Amazon Web Services"
                  placeholderTextColor="#94A3B8"
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />
        </View>

        {/* Issue Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Issue Date</Text>
          <Controller
            control={control}
            name="issue_date"
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

        {/* Expiry Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Expiry Date</Text>
          <Controller
            control={control}
            name="expiry_date"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <Calendar color="#94A3B8" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD (if applicable)"
                  placeholderTextColor="#94A3B8"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                />
              </View>
            )}
          />
        </View>

        {/* Credential ID */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Credential ID</Text>
          <Controller
            control={control}
            name="credential_id"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <Hash color="#94A3B8" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Certificate credential ID"
                  placeholderTextColor="#94A3B8"
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />
        </View>

        {/* Certificate URL */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Certificate URL</Text>
          <Controller
            control={control}
            name="certificate_url"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.inputContainer, errors.certificate_url && styles.inputError]}>
                <Link color="#94A3B8" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="https://..."
                  placeholderTextColor="#94A3B8"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
            )}
          />
          {errors.certificate_url && (
            <Text style={styles.errorText}>{errors.certificate_url.message}</Text>
          )}
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
              <Text style={styles.saveButtonText}>Save Certificate</Text>
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
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginTop: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
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
