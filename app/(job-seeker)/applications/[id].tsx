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
  Clock,
  MapPin,
  Briefcase,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Calendar,
  FileText,
  Trash2,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface ApplicationDetails {
  id: string;
  status: string;
  match_score: number | null;
  cover_letter: string | null;
  created_at: string;
  updated_at: string;
  job: {
    id: string;
    title: string;
    description: string;
    employment_type: string;
    city: string | null;
    country: string | null;
    is_remote: boolean;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string;
    deadline: string | null;
    employer: {
      company_name: string;
      company_logo_url: string | null;
      industry: string | null;
    };
  };
}

const statusConfig = {
  pending: { color: '#F59E0B', icon: Clock, label: 'Pending Review' },
  reviewed: { color: '#3B82F6', icon: AlertCircle, label: 'Reviewed' },
  shortlisted: { color: '#8B5CF6', icon: Star, label: 'Shortlisted' },
  accepted: { color: '#10B981', icon: CheckCircle, label: 'Accepted' },
  rejected: { color: '#EF4444', icon: XCircle, label: 'Rejected' },
  withdrawn: { color: '#94A3B8', icon: XCircle, label: 'Withdrawn' },
};

export default function ApplicationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    if (!id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        match_score,
        cover_letter,
        created_at,
        updated_at,
        job:jobs(
          id,
          title,
          description,
          employment_type,
          city,
          country,
          is_remote,
          salary_min,
          salary_max,
          salary_currency,
          deadline,
          employer:employers(
            company_name,
            company_logo_url,
            industry
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching application:', error);
      Alert.alert('Error', 'Failed to load application');
      router.back();
    } else {
      setApplication(data as unknown as ApplicationDetails);
    }
    setLoading(false);
  };

  const withdrawApplication = async () => {
    Alert.alert(
      'Withdraw Application',
      'Are you sure you want to withdraw this application? You cannot undo this action.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('applications')
              .update({ status: 'withdrawn' })
              .eq('id', id);

            if (error) {
              Alert.alert('Error', 'Failed to withdraw application');
            } else {
              Alert.alert('Withdrawn', 'Your application has been withdrawn');
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  if (!application) return null;

  const status = statusConfig[application.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Application Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <StatusIcon color={status.color} size={28} />
          </View>
          <Text style={styles.statusLabel}>{status.label}</Text>
          <Text style={styles.statusDate}>
            Applied on {formatDate(application.created_at)}
          </Text>
          {application.match_score && (
            <View style={styles.matchScoreContainer}>
              <Text style={styles.matchScoreLabel}>Match Score</Text>
              <Text style={styles.matchScoreValue}>
                {Math.round(application.match_score)}%
              </Text>
            </View>
          )}
        </View>

        {/* Job Info */}
        <View style={styles.jobCard}>
          <View style={styles.jobHeader}>
            <View style={styles.companyLogo}>
              <Building2 color="#2563EB" size={24} />
            </View>
            <View style={styles.jobInfo}>
              <Text style={styles.jobTitle}>{application.job?.title}</Text>
              <Text style={styles.companyName}>
                {application.job?.employer?.company_name}
              </Text>
            </View>
          </View>

          <View style={styles.jobDetails}>
            <View style={styles.detailRow}>
              <MapPin color="#64748B" size={16} />
              <Text style={styles.detailText}>
                {application.job?.is_remote
                  ? 'Remote'
                  : [application.job?.city, application.job?.country].filter(Boolean).join(', ') || 'Location TBD'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Briefcase color="#64748B" size={16} />
              <Text style={styles.detailText}>
                {application.job?.employment_type.replace('_', ' ')}
              </Text>
            </View>
            {application.job?.salary_min && (
              <View style={styles.detailRow}>
                <Text style={styles.salaryLabel}>Salary:</Text>
                <Text style={styles.salaryText}>
                  {application.job.salary_currency} {application.job.salary_min.toLocaleString()}
                  {application.job.salary_max && ` - ${application.job.salary_max.toLocaleString()}`}
                </Text>
              </View>
            )}
            {application.job?.deadline && (
              <View style={styles.detailRow}>
                <Calendar color="#64748B" size={16} />
                <Text style={styles.detailText}>
                  Deadline: {formatDate(application.job.deadline)}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.viewJobButton}
            onPress={() => router.push(`/(job-seeker)/jobs/${application.job?.id}`)}
          >
            <Text style={styles.viewJobButtonText}>View Full Job Details</Text>
          </TouchableOpacity>
        </View>

        {/* Cover Letter */}
        {application.cover_letter && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Cover Letter</Text>
            <View style={styles.coverLetterCard}>
              <Text style={styles.coverLetterText}>{application.cover_letter}</Text>
            </View>
          </View>
        )}

        {/* Activity Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.timelineCard}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Application Submitted</Text>
                <Text style={styles.timelineDate}>
                  {formatDate(application.created_at)}
                </Text>
              </View>
            </View>
            {application.status !== 'pending' && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: status.color }]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Status Updated</Text>
                  <Text style={styles.timelineDate}>
                    {formatDate(application.updated_at)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Withdraw Button */}
      {application.status !== 'withdrawn' && application.status !== 'accepted' && application.status !== 'rejected' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={withdrawApplication}
          >
            <Trash2 color="#EF4444" size={18} />
            <Text style={styles.withdrawButtonText}>Withdraw Application</Text>
          </TouchableOpacity>
        </View>
      )}
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
  statusCard: {
    alignItems: 'center',
    padding: 28,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statusBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  statusDate: {
    fontSize: 14,
    color: '#64748B',
  },
  matchScoreContainer: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    alignItems: 'center',
  },
  matchScoreLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  matchScoreValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563EB',
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#64748B',
  },
  jobDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#475569',
  },
  salaryLabel: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 6,
  },
  salaryText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  viewJobButton: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  viewJobButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  coverLetterCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  coverLetterText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F59E0B',
    marginRight: 14,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 13,
    color: '#94A3B8',
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
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
  },
  withdrawButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});
