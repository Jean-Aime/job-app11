import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  FileText,
  Clock,
  MapPin,
  Briefcase,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Application } from '@/types/database';
import { useAuthStore } from '@/stores/authStore';

const statusConfig = {
  pending: { color: '#F59E0B', icon: Clock, label: 'Pending' },
  reviewed: { color: '#3B82F6', icon: AlertCircle, label: 'Reviewed' },
  shortlisted: { color: '#8B5CF6', icon: CheckCircle, label: 'Shortlisted' },
  accepted: { color: '#10B981', icon: CheckCircle, label: 'Accepted' },
  rejected: { color: '#EF4444', icon: XCircle, label: 'Rejected' },
  completed: { color: '#059669', icon: CheckCircle, label: 'Completed' },
  withdrawn: { color: '#94A3B8', icon: XCircle, label: 'Withdrawn' },
};

export default function ApplicationsScreen() {
  const router = useRouter();
  const { jobSeeker, isAuthenticated } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (isAuthenticated && jobSeeker) {
      fetchApplications();
    }
  }, [isAuthenticated, jobSeeker, selectedStatus]);

  const fetchApplications = async () => {
    if (!jobSeeker) return;
    setLoading(true);

    let query = supabase
      .from('applications')
      .select(`
        *,
        job:jobs(
          *,
          employer:employers(company_name, company_logo_url),
          category:job_categories(name)
        )
      `)
      .eq('job_seeker_id', jobSeeker.id)
      .order('created_at', { ascending: false });

    if (selectedStatus !== 'all') {
      query = query.eq('status', selectedStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching applications:', error);
    } else {
      setApplications(data || []);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const filterButtons = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const renderApplication = ({ item }: { item: Application }) => {
    const status = getStatusConfig(item.status);
    const StatusIcon = status.icon;

    return (
      <TouchableOpacity
        style={styles.applicationCard}
        onPress={() => router.push(`/(job-seeker)/applications/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.companyLogo}>
            {item.job?.employer?.company_logo_url ? (
              <Image source={{ uri: item.job.employer.company_logo_url }} style={styles.logoImage} />
            ) : (
              <Building2 color="#64748B" size={24} />
            )}
          </View>
          <View style={styles.jobInfo}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {item.job?.title}
            </Text>
            <Text style={styles.companyName}>
              {item.job?.employer?.company_name}
            </Text>
            <View style={styles.jobMeta}>
              <MapPin color="#94A3B8" size={12} />
              <Text style={styles.jobMetaText}>{item.job?.city || 'Remote'}</Text>
            </View>
          </View>
          <ChevronRight color="#CBD5E1" size={20} />
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.dateRow}>
            <FileText color="#94A3B8" size={14} />
            <Text style={styles.dateText}>Applied {formatDate(item.created_at)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <StatusIcon color={status.color} size={12} />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        {item.match_score && (
          <View style={styles.matchScore}>
            <Text style={styles.matchLabel}>Match Score</Text>
            <Text style={styles.matchValue}>{Math.round(item.match_score)}%</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (!isAuthenticated || !jobSeeker) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <FileText color="#CBD5E1" size={48} />
          <Text style={styles.emptyStateTitle}>Login Required</Text>
          <Text style={styles.emptyStateText}>
            Please login to view your applications
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/(auth)')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Applications</Text>
        <Text style={styles.headerSubtitle}>
          {applications.length} application{applications.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {filterButtons.map((button) => (
          <TouchableOpacity
            key={button.value}
            style={[
              styles.filterButton,
              selectedStatus === button.value && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedStatus(button.value)}
          >
            <Text
              style={[
                styles.filterText,
                selectedStatus === button.value && styles.filterTextActive,
              ]}
            >
              {button.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Applications List */}
      <FlatList
        data={applications}
        renderItem={renderApplication}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyState}>
              <Briefcase color="#CBD5E1" size={48} />
              <Text style={styles.emptyStateTitle}>No Applications</Text>
              <Text style={styles.emptyStateText}>
                {selectedStatus === 'all'
                  ? "You haven't applied to any jobs yet"
                  : `No ${selectedStatus} applications`}
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push('/(job-seeker)/jobs')}
              >
                <Text style={styles.browseButtonText}>Browse Jobs</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
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
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  filterScroll: {
    maxHeight: 50,
    marginTop: 8,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 20,
    paddingTop: 16,
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobMetaText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopColor: '#F1F5F9',
    borderTopWidth: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  matchScore: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  matchValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 24,
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  browseButton: {
    marginTop: 24,
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
