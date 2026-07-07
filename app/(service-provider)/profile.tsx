import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User, Phone, MapPin, DollarSign, Briefcase, CheckCircle,
  Edit3, Camera, LogOut, Shield, Star, Clock, ChevronRight,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useSignOut } from '@/hooks/useSignOut';
import { Avatar } from '@/components/ui/Avatar';
import {
  Colors, Typography, Spacing, Radius, Space, G, Palette,
} from '@/constants/theme';

export default function ServiceProviderProfile() {
  const router = useRouter();
  const { user, signOut: authSignOut } = useAuthStore();
  const signOut = useSignOut();
  const [provider, setProvider] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    address: '',
    city: 'Kigali',
    bio: '',
    hourly_rate: '',
    is_available: true,
  });

  useEffect(() => {
    fetchProvider();
  }, []);

  const fetchProvider = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('service_providers')
      .select(`
        *,
        skills:service_provider_skills(
          id,
          service_category:service_categories(id, name, icon)
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProvider(data);
      setFormData({
        full_name: data.full_name || '',
        phone_number: data.phone_number || '',
        address: data.address || '',
        city: data.city || 'Kigali',
        bio: data.bio || '',
        hourly_rate: data.hourly_rate?.toString() || '',
        is_available: data.is_available ?? true,
      });
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.full_name || !formData.phone_number) {
      Alert.alert('Required Fields', 'Please fill in your name and phone number');
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        address: formData.address,
        city: formData.city,
        bio: formData.bio,
        hourly_rate: formData.hourly_rate ? parseInt(formData.hourly_rate) : null,
        is_available: formData.is_available,
      };

      if (provider) {
        // Update existing
        const { error } = await supabase
          .from('service_providers')
          .update(updateData)
          .eq('user_id', user!.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('service_providers')
          .insert({
            user_id: user!.id,
            ...updateData,
            country: 'Rwanda',
            verification_level: 1,
            is_verified: false,
          });

        if (error) throw error;
      }

      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
      fetchProvider();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.success} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          {provider && !isEditing && (
            <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
              <LogOut color={Colors.error} size={20} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Picture */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Avatar
              uri={provider?.profile_photo_url}
              name={formData.full_name || 'User'}
              size="xl"
              color={Colors.success}
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Camera color={Palette.white} size={18} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          {provider && (
            <View style={styles.verificationBadgeContainer}>
              <Shield color={Colors.success} size={16} strokeWidth={2} />
              <Text style={styles.verificationText}>
                Level {provider.verification_level} Verified
              </Text>
            </View>
          )}
        </View>

        {/* Stats (if provider exists) */}
        {provider && !isEditing && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Star color={Colors.employer} size={20} strokeWidth={2} />
              <Text style={styles.statValue}>{(Number(provider.average_rating) || 0).toFixed(1)}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <CheckCircle color={Colors.success} size={20} strokeWidth={2} />
              <Text style={styles.statValue}>{provider.total_jobs_completed}</Text>
              <Text style={styles.statLabel}>Jobs Done</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Clock color={Colors.primary} size={20} strokeWidth={2} />
              <Text style={styles.statValue}>{(Number(provider.response_rate) || 0).toFixed(0)}%</Text>
              <Text style={styles.statLabel}>Response</Text>
            </View>
          </View>
        )}

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Edit/Save Button */}
          <View style={styles.actionRow}>
            {!isEditing ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Edit3 color={Colors.success} size={18} strokeWidth={2} />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsEditing(false);
                    fetchProvider();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color={Palette.white} size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Form Fields */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              <User size={14} color={Colors.textSecondary} /> Full Name *
            </Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.full_name}
              onChangeText={(text) => setFormData({ ...formData, full_name: text })}
              placeholder="Enter your full name"
              placeholderTextColor={Colors.textMuted}
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              <Phone size={14} color={Colors.textSecondary} /> Phone Number *
            </Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.phone_number}
              onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
              placeholder="+250 7XX XXX XXX"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              <MapPin size={14} color={Colors.textSecondary} /> City
            </Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
              placeholder="Kigali"
              placeholderTextColor={Colors.textMuted}
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              <MapPin size={14} color={Colors.textSecondary} /> Address
            </Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="Your address"
              placeholderTextColor={Colors.textMuted}
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              <DollarSign size={14} color={Colors.textSecondary} /> Hourly Rate (RWF)
            </Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.hourly_rate}
              onChangeText={(text) => setFormData({ ...formData, hourly_rate: text.replace(/[^0-9]/g, '') })}
              placeholder="e.g., 5000"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              <Briefcase size={14} color={Colors.textSecondary} /> About You
            </Text>
            <TextInput
              style={[styles.textArea, !isEditing && styles.inputDisabled]}
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              placeholder="Tell customers about your experience and services..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={isEditing}
            />
          </View>

          {/* Availability Toggle */}
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text style={styles.switchTitle}>Available for Work</Text>
              <Text style={styles.switchSubtext}>
                {formData.is_available ? 'You\'ll receive job requests' : 'You won\'t receive requests'}
              </Text>
            </View>
            <Switch
              value={formData.is_available}
              onValueChange={(value) => setFormData({ ...formData, is_available: value })}
              trackColor={{ false: Colors.border, true: Colors.successLight }}
              thumbColor={formData.is_available ? Colors.success : Colors.textMuted}
              disabled={!isEditing}
            />
          </View>
        </View>

        {/* Skills Section */}
        {provider && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Services</Text>
              <TouchableOpacity onPress={() => router.push('/(service-provider)/profile/skills' as any)}>
                <ChevronRight color={Colors.textSecondary} size={20} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionSubtext}>
              Add the services you provide to get more job requests
            </Text>
            {provider.skills && provider.skills.length > 0 ? (
              <View style={styles.skillsGrid}>
                {provider.skills.map((skill: any) => (
                  <View key={skill.id} style={styles.skillCard}>
                    <Text style={styles.skillIcon}>{skill.service_category.icon || '🔧'}</Text>
                    <Text style={styles.skillName}>{skill.service_category.name}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/(service-provider)/profile/skills' as any)}
              >
                <Text style={styles.addButtonText}>+ Add Services</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Verification Section */}
        {provider && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Verification</Text>
            <Text style={styles.sectionSubtext}>
              Complete verification to build trust and get more jobs
            </Text>
            <TouchableOpacity
              style={styles.verificationCard}
              onPress={() => router.push('/(service-provider)/verification' as any)}
            >
              <View style={styles.verificationLeft}>
                <Shield color={Colors.primary} size={24} strokeWidth={2} />
                <View style={styles.verificationInfo}>
                  <Text style={styles.verificationTitle}>Increase Trust Level</Text>
                  <Text style={styles.verificationSubtext}>
                    Level {provider.verification_level} of 4
                  </Text>
                </View>
              </View>
              <ChevronRight color={Colors.textSecondary} size={20} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}

        <View style={G.listBottom} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { ...G.screen },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { ...G.rowBetween, paddingHorizontal: Space.pagePadding, paddingTop: Space.pageTop, paddingBottom: Spacing[3] },
  headerTitle: { ...Typography.h2, color: Colors.textPrimary },
  logoutBtn: { width: 40, height: 40, borderRadius: Radius.md, backgroundColor: Colors.errorLight, alignItems: 'center', justifyContent: 'center' },

  avatarSection: { alignItems: 'center', paddingVertical: Spacing[6] },
  avatarContainer: { position: 'relative' },
  cameraButton: { position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.bg },
  verificationBadgeContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing[1.5], marginTop: Spacing[3], backgroundColor: Colors.successLight, paddingHorizontal: Spacing[3], paddingVertical: Spacing[1.5], borderRadius: Radius.full },
  verificationText: { ...Typography.label, color: Colors.success, fontWeight: '600' },

  statsContainer: { flexDirection: 'row', marginHorizontal: Space.pagePadding, backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing[5], borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing[6] },
  statItem: { flex: 1, alignItems: 'center', gap: Spacing[1.5] },
  statDivider: { width: 1, backgroundColor: Colors.border },
  statValue: { ...Typography.h3, color: Colors.textPrimary, fontWeight: '700', marginTop: Spacing[1] },
  statLabel: { ...Typography.caption, color: Colors.textSecondary },

  formSection: { paddingHorizontal: Space.pagePadding },
  actionRow: { marginBottom: Spacing[5] },
  editButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[2], backgroundColor: Colors.successLight, paddingVertical: Spacing[3.5], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.success },
  editButtonText: { ...Typography.button, color: Colors.success, fontWeight: '600' },
  editActions: { flexDirection: 'row', gap: Spacing[3] },
  cancelButton: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg, paddingVertical: Spacing[3.5], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border },
  cancelButtonText: { ...Typography.button, color: Colors.textSecondary },
  saveButton: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.success, paddingVertical: Spacing[3.5], borderRadius: Radius.lg },
  saveButtonText: { ...Typography.button, color: Palette.white, fontWeight: '600' },

  inputGroup: { marginBottom: Spacing[4] },
  inputLabel: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing[2], fontWeight: '600' },
  input: { ...Typography.body, color: Colors.textPrimary, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, paddingHorizontal: Spacing[4], paddingVertical: Spacing[3.5] },
  inputDisabled: { backgroundColor: Colors.bg, color: Colors.textSecondary },
  textArea: { ...Typography.body, color: Colors.textPrimary, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, paddingHorizontal: Spacing[4], paddingVertical: Spacing[3.5], minHeight: 100 },

  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, padding: Spacing[4] },
  switchLabel: { flex: 1 },
  switchTitle: { ...Typography.label, color: Colors.textPrimary, fontWeight: '600', marginBottom: 3 },
  switchSubtext: { ...Typography.caption, color: Colors.textMuted },

  section: { paddingHorizontal: Space.pagePadding, marginTop: Space.sectionGap },
  sectionHeader: { ...G.rowBetween, marginBottom: Spacing[2] },
  sectionTitle: { ...Typography.h4, color: Colors.textPrimary },
  sectionSubtext: { ...Typography.body, color: Colors.textMuted, marginBottom: Spacing[4] },

  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[3] },
  skillCard: { alignItems: 'center', gap: Spacing[2], backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, padding: Spacing[4], minWidth: '30%' },
  skillIcon: { fontSize: 32 },
  skillName: { ...Typography.caption, color: Colors.textPrimary, textAlign: 'center', fontWeight: '600' },
  addButton: { backgroundColor: Colors.successLight, borderWidth: 1, borderColor: Colors.success, borderRadius: Radius.lg, paddingVertical: Spacing[4], alignItems: 'center', borderStyle: 'dashed' },
  addButtonText: { ...Typography.button, color: Colors.success, fontWeight: '600' },

  verificationCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, padding: Space.cardPadding },
  verificationLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], flex: 1 },
  verificationInfo: { flex: 1 },
  verificationTitle: { ...Typography.label, color: Colors.textPrimary, fontWeight: '600' },
  verificationSubtext: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
});
