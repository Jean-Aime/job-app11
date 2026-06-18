import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Briefcase,
  Users,
  TrendingUp,
  FileCheck,
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ChevronRight,
  Eye,
  Building2,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Job, Application } from '@/types/database';

interface DashboardStats {
  activeJobs: number;
  totalApplications: number;
  newApplications: number;
  shortlisted: number;
}

export default function EmployerDashboardScreen() {
  const router = useRouter();
  const { user, employer } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    shortlisted: 0,
  });
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [employer]);

  const fetchDashboardData = async () => {
    if (!employer) return;
    setLoading(true);

    // Fetch active jobs
    const { data: jobsData } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', employer.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (jobsData) {
      setActiveJobs(jobsData);
    }

    // Fetch applications with job and job seeker info
    const { data: applicationsData } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs!applications_job_id_fkey(id, title),
        job_seeker:job_seekers!applications_job_seeker_id_fkey(id, full_name, profile_photo_url)
      `)
      .in('job_id', jobsData?.map(j => j.id) || [])
      .order('created_at', { ascending: false })
      .limit(10);

    if (applicationsData) {
      setRecentApplications(applicationsData);
    }

    // Calculate stats
    const { data: appsData } = await supabase
      .from('applications')
      .select('status, job_id')
      .in('job_id', jobsData?.map(j => j.id) || []);

    if (appsData) {
      setStats({
        activeJobs: jobsData?.length || 0,
        totalApplications: appsData.length,
        newApplications: appsData.filter(a => a.status === 'pending').length,
        shortlisted: appsData.filter(a => a.status === 'shortlisted').length,
      });
    }

    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back</Text>
              <Text style={styles.companyName}>
                {employer?.company_name || 'Your Company'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push('/(employer)/notifications')}
            >
              <Bell color="#1E293B" size={24} />
              {stats.newApplications > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{stats.newApplications}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Overview */}
        <LinearGradient
          colors={['#059669', '#10B981']}
          style={styles.statsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Briefcase color="#FFFFFF" size={24} />
              <Text style={styles.statValue}>{stats.activeJobs}</Text>
              <Text style={styles.statLabel}>Active Jobs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <FileCheck color="#FFFFFF" size={24} />
              <Text style={styles.statValue}>{stats.totalApplications}</Text>
              <Text style={styles.statLabel}>Applications</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Users color="#FFFFFF" size={24} />
              <Text style={styles.statValue}>{stats.shortlisted}</Text>
              <Text style={styles.statLabel}>Shortlisted</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/(employer)/jobs/new')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#ECFDF5' }]}>
                <Plus color="#059669" size={24} />
              </View>
              <Text style={styles.quickActionTitle}>Post New Job</Text>
              <Text style={styles.quickActionDesc}>Create a new job listing</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/(employer)/candidates')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#EFF6FF' }]}>
                <Users color="#2563EB" size={24} />
              </View>
              <Text style={styles.quickActionTitle}>View Candidates</Text>
              <Text style={styles.quickActionDesc}>{stats.newApplications} new applications</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Applications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Applications</Text>
            <TouchableOpacity onPress={() => router.push('/(employer)/candidates')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentApplications.length > 0 ? (
            recentApplications.slice(0, 4).map((app: any) => (
              <TouchableOpacity
                key={app.id}
                style={styles.applicationCard}
                onPress={() => router.push(`/(employer)/candidates/${app.id}`)}
              >
                <View style={styles.applicationHeader}>
                  <View style={styles.applicantAvatar}>
                    {app.job_seeker?.profile_photo_url ? (
                      <Image
                        source={{ uri: app.job_seeker.profile_photo_url }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <Text style={styles.avatarPlaceholder}>
                        {app.job_seeker?.full_name?.charAt(0) || '?'}
                      </Text>
                    )}
                  </View>
                  <View style={styles.applicationInfo}>
                    <Text style={styles.applicantName}>{app.job_seeker?.full_name}</Text>
                    <Text style={styles.jobTitle}>{app.job?.title}</Text>
                  </View>
                  <View style={styles.applicationMeta}>
                    {app.status === 'pending' && (
                      <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
                        <Clock color="#D97706" size={12} />
                        <Text style={[styles.statusText, { color: '#D97706' }]}>New</Text>
                      </View>
                    )}
                    {app.status === 'reviewed' && (
                      <View style={[styles.statusBadge, { backgroundColor: '#DBEAFE' }]}>
                        <Eye color="#2563EB" size={12} />
                        <Text style={[styles.statusText, { color: '#2563EB' }]}>Reviewed</Text>
                      </View>
                    )}
                    {app.status === 'shortlisted' && (
                      <View style={[styles.statusBadge, { backgroundColor: '#D1FAE5' }]}>
                        <CheckCircle color="#059669" size={12} />
                        <Text style={[styles.statusText, { color: '#059669' }]}>Shortlisted</Text>
                      </View>
                    )}
                    <Text style={styles.dateText}>{formatDate(app.created_at)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <AlertCircle color="#CBD5E1" size={48} />
              <Text style={styles.emptyStateTitle}>No applications yet</Text>
              <Text style={styles.emptyStateText}>
                Post jobs to start receiving applications
              </Text>
            </View>
          )}
        </View>

        {/* Active Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Jobs</Text>
            <TouchableOpacity onPress={() => router.push('/(employer)/jobs')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {activeJobs.length > 0 ? (
            activeJobs.slice(0, 3).map((job) => (
              <TouchableOpacity
                key={job.id}
                style={styles.jobCard}
                onPress={() => router.push(`/(employer)/jobs/${job.id}`)}
              >
                <View style={styles.jobCardContent}>
                  <View style={styles.jobIcon}>
                    <Briefcase color="#059669" size={20} />
                  </View>
                  <View style={styles.jobInfo}>
                    <Text style={styles.jobCardTitle}>{job.title}</Text>
                    <Text style={styles.jobMeta}>
                      {job.city || job.location || 'Remote'}
                    </Text>
                  </View>
                  <View style={styles.jobStats}>
                    <Text style={styles.jobViewsText}>{job.view_count || 0} views</Text>
                    <ChevronRight color="#CBD5E1" size={20} />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <TouchableOpacity
              style={styles.postJobCard}
              onPress={() => router.push('/(employer)/jobs/new')}
            >
              <Plus color="#059669" size={24} />
              <Text style={styles.postJobText}>Post your first job</Text>
            </TouchableOpacity>
          )}
        </View>

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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 14,
    color: '#64748B',
  },
  companyName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsCard: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
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
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  quickActionDesc: {
    fontSize: 13,
    color: '#64748B',
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  applicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applicantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
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
  jobTitle: {
    fontSize: 13,
    color: '#64748B',
  },
  applicationMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  jobCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  jobIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  jobMeta: {
    fontSize: 13,
    color: '#64748B',
  },
  jobStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobViewsText: {
    fontSize: 13,
    color: '#94A3B8',
    marginRight: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  postJobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  postJobText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#059669',
  },
  bottomPadding: {
    height: 100,
  },
});
