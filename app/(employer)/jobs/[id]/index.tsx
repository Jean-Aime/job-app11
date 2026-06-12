import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Calendar,
  Edit3,
  Trash2,
  Eye,
  Pause,
  Play,
  FileText,
  ChevronRight,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface JobDetails {
  id: string;
  title: string;
  description: string;
  status: string;
  employment_type: string;
  required_experience_years: number;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  city: string | null;
  country: string | null;
  is_remote: boolean;
  positions_available: number;
  created_at: string;
  category: { name: string } | null;
  applications: Array<{
    id: string;
    status: string;
    match_score: number | null;
    created_at: string;
    job_seeker: {
      id: string;
      full_name: string;
      profile_photo_url: string | null;
      current_occupation: string | null;
      city: string | null;
    };
  }>;
}

export default function EmployerJobDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    if (!id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        category:job_categories(name),
        applications(
          id,
          status,
          match_score,
          created_at,
          job_seeker:job_seekers(
            id,
            full_name,
            profile_photo_url,
            current_occupation,
            city
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching job:', error);
      Alert.alert('Error', 'Failed to load job details');
      router.back();
    } else {
      setJob(data as unknown as JobDetails);
    }
    setLoading(false);
  };

  const toggleJobStatus = async () => {
    if (!job) return;
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    const { error } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', job.id);

    if (error) {
      Alert.alert('Error', 'Failed to update job status');
    } else {
      setJob({ ...job, status: newStatus });
    }
  };

  const deleteJob = async () => {
    Alert.alert(
      'Delete Job',
      'Are you sure? This cannot be undone.',
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'closed': return '#EF4444';
      case 'accepted': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'shortlisted': return '#8B5CF6';
      case 'pending': return '#F59E0B';
      default: return '#64748B';
    }
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

  if (!job) return null;

  const pendingCount = job.applications.filter(a => a.status === 'pending').length;
  const shortlistedCount = job.applications.filter(a => a.status === 'shortlisted').length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <TouchableOpacity onPress={() => router.push(`/(employer)/jobs/${id}/edit`)}>
          <Edit3 color="#059669" size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Job Info Card */}
        <View style={styles.jobCard}>
          <View style={styles.jobHeader}>
            <View style={styles.jobIcon}>
              <Briefcase color="#059669" size={24} />
            </View>
            <View style={styles.jobTitleSection}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.categoryName}>{job.category?.name || 'Uncategorized'}</Text>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(job.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <MapPin color="#64748B" size={18} />
              <Text style={styles.infoText}>
                {job.is_remote ? 'Remote' : [job.city, job.country].filter(Boolean).join(', ') || 'Location TBD'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Clock color="#64748B" size={18} />
              <Text style={styles.infoText}>
                {job.employment_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Users color="#64748B" size={18} />
              <Text style={styles.infoText}>{job.positions_available} position(s)</Text>
            </View>
            <View style={styles.infoItem}>
              <Calendar color="#64748B" size={18} />
              <Text style={styles.infoText}>
                {job.required_experience_years}+ years exp
              </Text>
            </View>
          </View>

          {job.salary_min && (
            <View style={styles.salarySection}>
              <DollarSign color="#059669" size={18} />
              <Text style={styles.salaryText}>
                {job.salary_currency} {job.salary_min.toLocaleString()}
                {job.salary_max && ` - ${job.salary_max.toLocaleString()}`}
              </Text>
            </View>
          )}

          <View style={styles.dateSection}>
            <Text style={styles.dateText}>Posted {formatDate(job.created_at)}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{job.applications.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{shortlistedCount}</Text>
            <Text style={styles.statLabel}>Shortlisted</Text>
          </View>
        </View>

        {/* Job Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{job.description}</Text>
        </View>

        {/* Applications List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Applications ({job.applications.length})</Text>
            <TouchableOpacity onPress={() => router.push('/(employer)/candidates')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {job.applications.length === 0 ? (
            <View style={styles.emptyState}>
              <Users color="#CBD5E1" size={48} />
              <Text style={styles.emptyText}>No applications yet</Text>
            </View>
          ) : (
            job.applications.slice(0, 5).map((app) => (
              <TouchableOpacity
                key={app.id}
                style={styles.applicationCard}
                onPress={() => router.push(`/(employer)/candidates/${app.id}`)}
              >
                <View style={styles.applicationMain}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {app.job_seeker.full_name?.charAt(0) || '?'}
                    </Text>
                  </View>
                  <View style={styles.applicationInfo}>
                    <Text style={styles.applicantName}>{app.job_seeker.full_name}</Text>
                    <Text style={styles.applicantMeta}>
                      {app.job_seeker.current_occupation || app.job_seeker.city || 'Job Seeker'}
                    </Text>
                  </View>
                  {app.match_score && (
                    <View style={styles.matchBadge}>
                      <Text style={styles.matchScore}>{Math.round(app.match_score)}%</Text>
                    </View>
                  )}
                </View>
                <ChevronRight color="#94A3B8" size={20} />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, job.status === 'active' ? styles.pauseButton : styles.startButton]}
          onPress={toggleJobStatus}
        >
          {job.status === 'active' ? (
            <>
              <Pause color="#F59E0B" size={18} />
              <Text style={styles.pauseButtonText}>Close</Text>
            </>
          ) : (
            <>
              <Play color="#10B981" size={18} />
              <Text style={styles.startButtonText}>Activate</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={deleteJob}>
          <Trash2 color="#EF4444" size={18} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
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
  jobCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  jobIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  jobTitleSection: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  categoryName: {
    fontSize: 14,
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
    marginBottom: 18,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoGrid: {
    gap: 12,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 15,
    color: '#475569',
  },
  salarySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 8,
  },
  salaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  dateSection: {
    paddingTop: 8,
  },
  dateText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    fontSize: 15,
    color: '#94A3B8',
    marginTop: 10,
  },
  applicationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  applicationMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
  },
  applicationInfo: {
    flex: 1,
  },
  applicantName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  applicantMeta: {
    fontSize: 13,
    color: '#64748B',
  },
  matchBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchScore: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  pauseButton: {
    backgroundColor: '#FFFBEB',
  },
  startButton: {
    backgroundColor: '#ECFDF5',
  },
  pauseButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F59E0B',
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10B981',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
});
