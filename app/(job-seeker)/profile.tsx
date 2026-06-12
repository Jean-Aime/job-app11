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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Award,
  FileText,
  Plus,
  ChevronRight,
  Edit3,
  Settings,
  LogOut,
  Star,
  Building2,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, jobSeeker, signOut, fetchJobSeekerProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    city: '',
    country: '',
    bio: '',
    current_occupation: '',
    years_of_experience: 0,
  });
  const [skills, setSkills] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    if (jobSeeker) {
      loadProfileData();
    }
  }, [jobSeeker]);

  const loadProfileData = async () => {
    if (!jobSeeker) return;

    setFormData({
      full_name: jobSeeker.full_name || '',
      phone_number: jobSeeker.phone_number || '',
      city: jobSeeker.city || '',
      country: jobSeeker.country || '',
      bio: jobSeeker.bio || '',
      current_occupation: jobSeeker.current_occupation || '',
      years_of_experience: jobSeeker.years_of_experience || 0,
    });

    // Fetch skills
    const { data: skillsData } = await supabase
      .from('job_seeker_skills')
      .select('*, skill:skills(*)')
      .eq('job_seeker_id', jobSeeker.id);

    if (skillsData) setSkills(skillsData);

    // Fetch experiences
    const { data: expData } = await supabase
      .from('experiences')
      .select('*')
      .eq('job_seeker_id', jobSeeker.id)
      .order('start_date', { ascending: false });

    if (expData) setExperiences(expData);

    // Fetch certificates
    const { data: certData } = await supabase
      .from('certificates')
      .select('*')
      .eq('job_seeker_id', jobSeeker.id);

    if (certData) setCertificates(certData);
  };

  const handleSave = async () => {
    if (!jobSeeker) return;
    setLoading(true);

    const { error } = await supabase
      .from('job_seekers')
      .update({
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        city: formData.city,
        country: formData.country,
        bio: formData.bio,
        current_occupation: formData.current_occupation,
        years_of_experience: formData.years_of_experience,
      })
      .eq('id', jobSeeker.id);

    setLoading(false);
    if (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } else {
      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
      fetchJobSeekerProfile();
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

  const profileCompletion = jobSeeker?.profile_completion_score || 0;

  const getProgressColor = (score: number) => {
    if (score < 40) return '#EF4444';
    if (score < 70) return '#F59E0B';
    return '#10B981';
  };

  if (!jobSeeker) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/(job-seeker)/profile/settings')}
          >
            <Settings color="#64748B" size={24} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {jobSeeker.profile_photo_url ? (
              <Image source={{ uri: jobSeeker.profile_photo_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User color="#FFFFFF" size={40} />
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarButton}>
              <Edit3 color="#FFFFFF" size={16} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{formData.full_name || 'Your Name'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          {/* Profile Completion */}
          <View style={styles.completionContainer}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionLabel}>Profile Completion</Text>
              <Text style={[styles.completionValue, { color: getProgressColor(profileCompletion) }]}>
                {profileCompletion}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${profileCompletion}%`, backgroundColor: getProgressColor(profileCompletion) },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Quick Edit Form */}
        {editing ? (
          <View style={styles.editForm}>
            <Text style={styles.sectionTitle}>Edit Profile</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={formData.full_name}
                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={formData.phone_number}
                onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
                keyboardType="phone-pad"
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
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                multiline
                numberOfLines={4}
              />
            </View>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Current Occupation</Text>
                <TextInput
                  style={styles.input}
                  value={formData.current_occupation}
                  onChangeText={(text) => setFormData({ ...formData, current_occupation: text })}
                />
              </View>
              <View style={styles.inputSpacer} />
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Years of Experience</Text>
                <TextInput
                  style={styles.input}
                  value={formData.years_of_experience.toString()}
                  onChangeText={(text) => setFormData({ ...formData, years_of_experience: parseInt(text) || 0 })}
                  keyboardType="number-pad"
                />
              </View>
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
            {/* Personal Info */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <TouchableOpacity onPress={() => setEditing(true)}>
                  <Edit3 color="#2563EB" size={18} />
                </TouchableOpacity>
              </View>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Phone color="#64748B" size={20} />
                  <Text style={styles.infoValue}>{formData.phone_number || 'Add phone number'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MapPin color="#64748B" size={20} />
                  <Text style={styles.infoValue}>
                    {[formData.city, formData.country].filter(Boolean).join(', ') || 'Add location'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Briefcase color="#64748B" size={20} />
                  <Text style={styles.infoValue}>{formData.current_occupation || 'Add occupation'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Calendar color="#64748B" size={20} />
                  <Text style={styles.infoValue}>{formData.years_of_experience} years experience</Text>
                </View>
              </View>
              {formData.bio && (
                <View style={styles.bioCard}>
                  <Text style={styles.bioText}>{formData.bio}</Text>
                </View>
              )}
            </View>

            {/* Skills */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Skills ({skills.length})</Text>
                <TouchableOpacity onPress={() => router.push('/(job-seeker)/profile/skills')}>
                  <Plus color="#2563EB" size={20} />
                </TouchableOpacity>
              </View>
              <View style={styles.skillsGrid}>
                {skills.slice(0, 6).map((skill: any) => (
                  <View key={skill.id} style={styles.skillBadge}>
                    <Star color="#F59E0B" size={12} />
                    <Text style={styles.skillText}>{skill.skill?.name}</Text>
                  </View>
                ))}
                {skills.length === 0 && (
                  <TouchableOpacity style={styles.addItemCard}>
                    <Plus color="#94A3B8" size={24} />
                    <Text style={styles.addItemText}>Add your skills</Text>
                  </TouchableOpacity>
                )}
              </View>
              {skills.length > 6 && (
                <TouchableOpacity style={styles.seeMoreButton}>
                  <Text style={styles.seeMoreText}>See all {skills.length} skills</Text>
                  <ChevronRight color="#2563EB" size={16} />
                </TouchableOpacity>
              )}
            </View>

            {/* Experience */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Experience ({experiences.length})</Text>
                <TouchableOpacity onPress={() => router.push('/(job-seeker)/profile/experience/new')}>
                  <Plus color="#2563EB" size={20} />
                </TouchableOpacity>
              </View>
              {experiences.slice(0, 3).map((exp: any) => (
                <View key={exp.id} style={styles.experienceCard}>
                  <View style={styles.experienceIcon}>
                    <Building2 color="#2563EB" size={20} />
                  </View>
                  <View style={styles.experienceInfo}>
                    <Text style={styles.experienceTitle}>{exp.job_title}</Text>
                    <Text style={styles.experienceCompany}>{exp.company_name}</Text>
                    <Text style={styles.experienceDate}>
                      {new Date(exp.start_date).getFullYear()} - {exp.is_current ? 'Present' : exp.end_date ? new Date(exp.end_date).getFullYear() : ''}
                    </Text>
                  </View>
                </View>
              ))}
              {experiences.length === 0 && (
                <TouchableOpacity style={styles.addItemCard}>
                  <Plus color="#94A3B8" size={24} />
                  <Text style={styles.addItemText}>Add your work experience</Text>
                </TouchableOpacity>
              )}
              {experiences.length > 3 && (
                <TouchableOpacity style={styles.seeMoreButton}>
                  <Text style={styles.seeMoreText}>See all experience</Text>
                  <ChevronRight color="#2563EB" size={16} />
                </TouchableOpacity>
              )}
            </View>

            {/* Certificates */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Certificates ({certificates.length})</Text>
                <TouchableOpacity onPress={() => router.push('/(job-seeker)/profile/certificates/new')}>
                  <Plus color="#2563EB" size={20} />
                </TouchableOpacity>
              </View>
              {certificates.slice(0, 3).map((cert: any) => (
                <View key={cert.id} style={styles.certificateCard}>
                  <View style={styles.certificateIcon}>
                    <Award color="#10B981" size={20} />
                  </View>
                  <View style={styles.certificateInfo}>
                    <Text style={styles.certificateTitle}>{cert.title}</Text>
                    <Text style={styles.certificateOrg}>{cert.issuing_organization}</Text>
                  </View>
                </View>
              ))}
              {certificates.length === 0 && (
                <TouchableOpacity style={styles.addItemCard}>
                  <Plus color="#94A3B8" size={24} />
                  <Text style={styles.addItemText}>Add your certificates</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Resume */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Resume</Text>
              </View>
              <TouchableOpacity style={styles.resumeCard}>
                <FileText color="#2563EB" size={24} />
                <View style={styles.resumeInfo}>
                  <Text style={styles.resumeTitle}>
                    {jobSeeker.resume_url ? 'My_Resume.pdf' : 'Upload your resume'}
                  </Text>
                  <Text style={styles.resumeHint}>
                    {jobSeeker.resume_url ? 'Tap to update' : 'PDF, DOC up to 5MB'}
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
  profileCard: {
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
    backgroundColor: '#2563EB',
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
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  completionContainer: {
    width: '100%',
    marginTop: 8,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  completionLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  completionValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
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
  bioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bioText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  skillText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '500',
  },
  addItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  addItemText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
  },
  seeMoreText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  experienceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  experienceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  experienceInfo: {
    flex: 1,
  },
  experienceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  experienceCompany: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  experienceDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  certificateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  certificateIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  certificateInfo: {
    flex: 1,
  },
  certificateTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  certificateOrg: {
    fontSize: 13,
    color: '#64748B',
  },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  resumeInfo: {
    flex: 1,
  },
  resumeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  resumeHint: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
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
    backgroundColor: '#2563EB',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
