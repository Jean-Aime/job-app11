import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Edit3,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  LogOut,
  ChevronRight,
  Award,
  Shield,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

export default function EmployerProfileScreen() {
  const router = useRouter();
  const { user, employer, signOut, fetchEmployerProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    website: '',
    company_description: '',
    address: '',
    city: '',
    country: '',
    contact_person_name: '',
    contact_person_phone: '',
    contact_person_email: '',
    employee_count: '',
    founded_year: '',
  });

  useEffect(() => {
    if (employer) {
      setFormData({
        company_name: employer.company_name || '',
        industry: employer.industry || '',
        website: employer.website || '',
        company_description: employer.company_description || '',
        address: employer.address || '',
        city: employer.city || '',
        country: employer.country || '',
        contact_person_name: employer.contact_person_name || '',
        contact_person_phone: employer.contact_person_phone || '',
        contact_person_email: employer.contact_person_email || '',
        employee_count: employer.employee_count?.toString() || '',
        founded_year: employer.founded_year?.toString() || '',
      });
    }
  }, [employer]);

  const handleSave = async () => {
    if (!employer) return;
    setLoading(true);

    const { error } = await supabase
      .from('employers')
      .update({
        company_name: formData.company_name,
        industry: formData.industry,
        website: formData.website,
        company_description: formData.company_description,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        contact_person_name: formData.contact_person_name,
        contact_person_phone: formData.contact_person_phone,
        contact_person_email: formData.contact_person_email,
        employee_count: formData.employee_count ? parseInt(formData.employee_count) : null,
        founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
      })
      .eq('id', employer.id);

    setLoading(false);
    if (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } else {
      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
      fetchEmployerProfile();
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)');
        },
      },
    ]);
  };

  const getVerificationStatusColor = () => {
    switch (employer?.verification_status) {
      case 'approved':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      default:
        return '#F59E0B';
    }
  };

  const getVerificationStatusBadge = () => {
    switch (employer?.verification_status) {
      case 'approved':
        return { icon: CheckCircle, text: 'Verified', bgColor: '#D1FAE5' };
      case 'rejected':
        return { icon: AlertCircle, text: 'Rejected', bgColor: '#FEE2E2' };
      default:
        return { icon: Clock, text: 'Pending Verification', bgColor: '#FEF3C7' };
    }
  };

  if (!employer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
        </View>
      </SafeAreaView>
    );
  }

  const verificationBadge = getVerificationStatusBadge();
  const VerificationIcon = verificationBadge.icon;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Company Profile</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/(employer)/profile/settings')}
          >
            <Settings color="#64748B" size={24} />
          </TouchableOpacity>
        </View>

        {/* Company Card */}
        <View style={styles.companyCard}>
          <View style={styles.avatarContainer}>
            {employer.company_logo_url ? (
              <Image source={{ uri: employer.company_logo_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Building2 color="#FFFFFF" size={40} />
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarButton}>
              <Edit3 color="#FFFFFF" size={16} />
            </TouchableOpacity>
          </View>
          <Text style={styles.companyName}>{formData.company_name || 'Your Company'}</Text>
          <Text style={styles.companyEmail}>{user?.email}</Text>

          {/* Verification Badge */}
          <View style={[styles.verificationBadge, { backgroundColor: verificationBadge.bgColor }]}>
            <VerificationIcon color={getVerificationStatusColor()} size={16} />
            <Text style={[styles.verificationText, { color: getVerificationStatusColor() }]}>
              {verificationBadge.text}
            </Text>
          </View>
        </View>

        {editing ? (
          /* Edit Form */
          <View style={styles.editForm}>
            <Text style={styles.sectionTitle}>Edit Company Profile</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.company_name}
                onChangeText={(text) => setFormData({ ...formData, company_name: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Industry</Text>
              <TextInput
                style={styles.input}
                value={formData.industry}
                onChangeText={(text) => setFormData({ ...formData, industry: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Website</Text>
              <TextInput
                style={styles.input}
                value={formData.website}
                onChangeText={(text) => setFormData({ ...formData, website: text })}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.company_description}
                onChangeText={(text) => setFormData({ ...formData, company_description: text })}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                />
              </View>
              <View style={styles.inputSpacer} />
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Country</Text>
                <TextInput
                  style={styles.input}
                  value={formData.country}
                  onChangeText={(text) => setFormData({ ...formData, country: text })}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
              />
            </View>

            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* Company Info */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Company Information</Text>
                <TouchableOpacity onPress={() => setEditing(true)}>
                  <Edit3 color="#059669" size={18} />
                </TouchableOpacity>
              </View>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Building2 color="#64748B" size={20} />
                  <Text style={styles.infoValue}>{formData.industry || 'Add industry'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MapPin color="#64748B" size={20} />
                  <Text style={styles.infoValue}>
                    {[formData.city, formData.country].filter(Boolean).join(', ') || 'Add location'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Globe color="#64748B" size={20} />
                  <Text style={styles.infoValue}>{formData.website || 'Add website'}</Text>
                </View>
              </View>

              {formData.company_description && (
                <View style={styles.descriptionCard}>
                  <Text style={styles.descriptionText}>{formData.company_description}</Text>
                </View>
              )}
            </View>

            {/* Contact Person */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Contact Person</Text>
                <TouchableOpacity onPress={() => setEditing(true)}>
                  <Edit3 color="#059669" size={18} />
                </TouchableOpacity>
              </View>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Phone color="#64748B" size={20} />
                  <Text style={styles.infoValue}>{formData.contact_person_phone || 'Add phone'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Mail color="#64748B" size={20} />
                  <Text style={styles.infoValue}>{formData.contact_person_email || 'Add email'}</Text>
                </View>
              </View>
            </View>

            {/* Verification Documents */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Verification</Text>
              </View>
              <TouchableOpacity style={styles.verificationCard}>
                <Shield color="#059669" size={24} />
                <View style={styles.verificationInfo}>
                  <Text style={styles.verificationTitle}>Upload Documents</Text>
                  <Text style={styles.verificationDesc}>
                    Submit business registration and tax documents for verification
                  </Text>
                </View>
                <ChevronRight color="#94A3B8" size={20} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut color="#EF4444" size={20} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  settingsButton: {
    padding: 8,
  },
  companyCard: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  companyName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  companyEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  verificationText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  infoValue: {
    fontSize: 15,
    color: '#1E293B',
    flex: 1,
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  descriptionText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  verificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  verificationInfo: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  verificationDesc: {
    fontSize: 13,
    color: '#64748B',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 32,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  bottomPadding: {
    height: 100,
  },
  editForm: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1E293B',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  inputSpacer: {
    width: 12,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#059669',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
