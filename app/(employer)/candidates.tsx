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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  ChevronRight,
  Building2,
  Search,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Application } from '@/types/database';
import { useAuthStore } from '@/stores/authStore';

const statusConfig = {
  pending: { color: '#F59E0B', icon: Clock, label: 'Pending', bgColor: '#FEF3C7' },
  reviewed: { color: '#3B82F6', icon: Search, label: 'Reviewed', bgColor: '#DBEAFE' },
  shortlisted: { color: '#8B5CF6', icon: Star, label: 'Shortlisted', bgColor: '#EDE9FE' },
  accepted: { color: '#10B981', icon: CheckCircle, label: 'Accepted', bgColor: '#D1FAE5' },
  rejected: { color: '#EF4444', icon: XCircle, label: 'Rejected', bgColor: '#FEE2E2' },
};

export default function CandidatesScreen() {
  const router = useRouter();
  const { employer } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (employer) {
      fetchApplications();
    }
  }, [employer, selectedStatus]);

  const fetchApplications = async () => {
    if (!employer) return;
    setLoading(true);

    // First get employer's jobs
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id')
      .eq('employer_id', employer.id);

    const jobIds = jobs?.map(j => j.id) || [];

    let query = supabase
      .from('applications')
      .select(`
        *,
        job:jobs(id, title),
        job_seeker:job_seekers(id, full_name, profile_photo_url, current_occupation, years_of_experience, city)
      `)
      .in('job_id', jobIds)
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

  const updateApplicationStatus = async (appId: string, newStatus: string) => {
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', appId);

    if (!error) {
      fetchApplications();
    }
  };

  const filterButtons = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const renderApplication = ({ item }: { item: Application & any }) => {
    const status = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.pending;
    const StatusIcon = status.icon;

    return (
      <TouchableOpacity
        style={styles.applicationCard}
        onPress={() => router.push(`/(employer)/candidates/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            {item.job_seeker?.profile_photo_url ? (
              <Image source={{ uri: item.job_seeker.profile_photo_url }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarPlaceholder}>
                {item.job_seeker?.full_name?.charAt(0) || '?'}
              </Text>
            )}
          </View>
          <View style={styles.candidateInfo}>
            <Text style={styles.candidateName}>{item.job_seeker?.full_name}</Text>
            <Text style={styles.jobTitle}>{item.job?.title}</Text>
            <Text style={styles.candidateMeta}>
              {item.job_seeker?.years_of_experience} years exp
              {item.job_seeker?.city && ' | ' + item.job_seeker.city}
            </Text>
          </View>
          <View style={styles.matchScore}>
            <Text style={styles.matchScoreValue}>
              {item.match_score ? Math.round(item.match_score) : '--'}%
            </Text>
            <Text style={styles.matchScoreLabel}>Match</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
            <StatusIcon color={status.color} size={14} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push(`/(employer)/candidates/${item.id}`)}>
            <ChevronRight color="#94A3B8" size={20} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Candidates</Text>
        <Text style={styles.headerSubtitle}>
          {applications.length} application{applications.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
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
      </View>

      {/* Applications List */}
      <FlatList
        data={applications}
        renderItem={renderApplication}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyState}>
              <Users color="#CBD5E1" size={48} />
              <Text style={styles.emptyStateTitle}>No Candidates</Text>
              <Text style={styles.emptyStateText}>
                {selectedStatus === 'all'
                  ? "No applications received yet"
                  : `No ${selectedStatus} applications`}
              </Text>
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
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
    backgroundColor: '#059669',
    borderColor: '#059669',
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
    paddingTop: 8,
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
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    fontSize: 22,
    fontWeight: '600',
    color: '#64748B',
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  candidateMeta: {
    fontSize: 13,
    color: '#94A3B8',
  },
  matchScore: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
  },
  matchScoreValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  matchScoreLabel: {
    fontSize: 10,
    color: '#059669',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
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
});
