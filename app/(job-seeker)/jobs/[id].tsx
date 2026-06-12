import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Building2,
  Heart,
  Share2,
  Calendar,
  Users,
  CheckCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { Job } from '@/types/database';
import { useAuthStore } from '@/stores/authStore';

export default function JobDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { jobSeeker, isAuthenticated } = useAuthStore();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        employer:employers(*),
        category:job_categories(name),
        required_skills:job_skills(
          *,
          skill:skills(name)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching job:', error);
      Alert.alert('Error', 'Failed to load job details');
      router.back();
    } else {
      setJob(data);
      // Increment view count
      await supabase
        .from('jobs')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', id);
    }
    setLoading(false);
  };

  const handleApply = async () => {
    if (!isAuthenticated || !jobSeeker) {
      Alert.alert('Login Required', 'Please login to apply for this job', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)') },
      ]);
      return;
    }

    setApplying(true);
    const { error } = await supabase.from('applications').insert({
      job_id: id,
      job_seeker_id: jobSeeker.id,
      status: 'pending',
    });

    setApplying(false);
    if (error) {
      if (error.code === '23505') {
        Alert.alert('Already Applied', 'You have already applied for this job.');
        setHasApplied(true);
      } else {
        Alert.alert('Error', 'Failed to submit application. Please try again.');
      }
    } else {
      Alert.alert('Success', 'Your application has been submitted successfully!');
      setHasApplied(true);
    }
  };

  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    if (!min && !max) return 'Salary not specified';
    const curr = currency || 'RWF';
    if (min && max) return `${curr} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `From ${curr} ${min.toLocaleString()}`;
    return `Up to ${curr} ${max?.toLocaleString()}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  if (!job) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="#1E293B" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Share2 color="#64748B" size={20} />
          </TouchableOpacity>
        </View>

        {/* Company Header */}
        <View style={styles.companyHeader}>
          <View style={styles.companyLogo}>
            {job.employer?.company_logo_url ? (
              <Image source={{ uri: job.employer.company_logo_url }} style={styles.logoImage} />
            ) : (
              <Building2 color="#2563EB" size={40} />
            )}
          </View>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.companyName}>{job.employer?.company_name}</Text>
          <View style={styles.locationRow}>
            <MapPin color="#94A3B8" size={16} />
            <Text style={styles.locationText}>
              {job.city || job.location || 'Remote'}
            </Text>
          </View>
        </View>

        {/* Quick Info Cards */}
        <View style={styles.quickInfo}>
          <View style={styles.quickInfoItem}>
            <Briefcase color="#2563EB" size={20} />
            <Text style={styles.quickInfoLabel}>Type</Text>
            <Text style={styles.quickInfoValue}>
              {job.employment_type.replace('_', ' ')}
            </Text>
          </View>
          <View style={styles.quickInfoDivider} />
          <View style={styles.quickInfoItem}>
            <Clock color="#2563EB" size={20} />
            <Text style={styles.quickInfoLabel}>Experience</Text>
            <Text style={styles.quickInfoValue}>
              {job.required_experience_years}+ years
            </Text>
          </View>
          <View style={styles.quickInfoDivider} />
          <View style={styles.quickInfoItem}>
            <Users color="#2563EB" size={20} />
            <Text style={styles.quickInfoLabel}>Positions</Text>
            <Text style={styles.quickInfoValue}>{job.positions_available}</Text>
          </View>
        </View>

        {/* Salary Card */}
        <View style={styles.salaryCard}>
          <DollarSign color="#059669" size={24} />
          <View>
            <Text style={styles.salaryLabel}>Salary Range</Text>
            <Text style={styles.salaryValue}>
              {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
            </Text>
          </View>
        </View>

        {/* Job Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Description</Text>
          <Text style={styles.description}>{job.description}</Text>
        </View>

        {/* Required Skills */}
        {job.required_skills && job.required_skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required Skills</Text>
            <View style={styles.skillsList}>
              {job.required_skills.map((skill: any) => (
                <View key={skill.id} style={styles.skillItem}>
                  <CheckCircle color="#059669" size={16} />
                  <View style={styles.skillInfo}>
                    <Text style={styles.skillName}>{skill.skill?.name}</Text>
                    {skill.minimum_years > 0 && (
                      <Text style={styles.skillRequirement}>
                        {skill.minimum_years}+ years
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Deadline */}
        {job.deadline && (
          <View style={styles.deadlineCard}>
            <Calendar color="#EF4444" size={20} />
            <View>
              <Text style={styles.deadlineLabel}>Application Deadline</Text>
              <Text style={styles.deadlineValue}>{formatDate(job.deadline)}</Text>
            </View>
          </View>
        )}

        {/* Company Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the Company</Text>
          <View style={styles.companyCard}>
            <View style={styles.companyCardHeader}>
              {job.employer?.company_logo_url ? (
                <Image source={{ uri: job.employer.company_logo_url }} style={styles.companyLogoSmall} />
              ) : (
                <View style={styles.companyLogoPlaceholder}>
                  <Building2 color="#64748B" size={24} />
                </View>
              )}
              <View>
                <Text style={styles.companyCardName}>{job.employer?.company_name}</Text>
                <Text style={styles.companyCardIndustry}>{job.employer?.industry}</Text>
              </View>
            </View>
            {job.employer?.company_description && (
              <Text style={styles.companyDescription}>{job.employer.company_description}</Text>
            )}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => setIsSaved(!isSaved)}
        >
          <Heart color={isSaved ? '#EF4444' : '#64748B'} size={24} fill={isSaved ? '#EF4444' : 'transparent'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApply}
          disabled={applying || hasApplied}
        >
          <LinearGradient
            colors={hasApplied ? ['#94A3B8', '#CBD5E1'] : ['#2563EB', '#3B82F6']}
            style={styles.applyButtonGradient}
          >
            {applying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.applyButtonText}>
                {hasApplied ? 'Applied' : 'Apply Now'}
              </Text>
            )}
          </LinearGradient>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  companyLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#64748B',
  },
  quickInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
  },
  quickInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickInfoLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
  },
  quickInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 4,
  },
  quickInfoDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  salaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    gap: 12,
  },
  salaryLabel: {
    fontSize: 12,
    color: '#059669',
  },
  salaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  skillsList: {
    gap: 12,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  skillRequirement: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  deadlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    gap: 12,
  },
  deadlineLabel: {
    fontSize: 12,
    color: '#EF4444',
  },
  deadlineValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 4,
  },
  companyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
  },
  companyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyLogoSmall: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
  },
  companyLogoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  companyCardIndustry: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  companyDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginTop: 12,
  },
  bottomPadding: {
    height: 120,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E2E8F0',
    borderTopWidth: 1,
    gap: 12,
  },
  saveButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButton: {
    flex: 1,
  },
  applyButtonGradient: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
