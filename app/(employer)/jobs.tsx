import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Briefcase,
  Plus,
  Eye,
  Users,
  Clock,
  MapPin,
  Edit3,
  Trash2,
  MoreVertical,
  Pause,
  Play,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Job } from '@/types/database';
import { useAuthStore } from '@/stores/authStore';

export default function EmployerJobsScreen() {
  const router = useRouter();
  const { employer } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (employer) {
      fetchJobs();
    }
  }, [employer, selectedStatus]);

  const fetchJobs = async () => {
    if (!employer) return;
    setLoading(true);

    let query = supabase
      .from('jobs')
      .select(`
        *,
        category:job_categories(name),
        _applications:applications(count)
      `)
      .eq('employer_id', employer.id)
      .order('created_at', { ascending: false });

    if (selectedStatus !== 'all') {
      query = query.eq('status', selectedStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
    } else {
      setJobs(data || []);
    }

    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  const toggleJobStatus = async (job: Job) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    const { error } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', job.id);

    if (error) {
      Alert.alert('Error', 'Failed to update job status');
    } else {
      fetchJobs();
    }
  };

  const deleteJob = async (jobId: string) => {
    Alert.alert(
      'Delete Job',
      'Are you sure you want to delete this job? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('jobs').delete().eq('id', jobId);
            if (error) {
              Alert.alert('Error', 'Failed to delete job');
            } else {
              fetchJobs();
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
      case 'active':
        return '#10B981';
      case 'closed':
        return '#EF4444';
      case 'filled':
        return '#8B5CF6';
      case 'draft':
        return '#64748B';
      default:
        return '#64748B';
    }
  };

  const filterButtons = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'closed', label: 'Closed' },
    { value: 'draft', label: 'Draft' },
  ];

  const renderJob = ({ item }: { item: Job & { _applications?: { count: number } } }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => router.push(`/(employer)/jobs/${item.id}`)}
    >
      <View style={styles.jobCardContent}>
        <View style={styles.jobHeader}>
          <View style={styles.jobIcon}>
            <Briefcase color="#059669" size={20} />
          </View>
          <View style={styles.jobMainInfo}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.jobMetaRow}>
              <MapPin color="#94A3B8" size={12} />
              <Text style={styles.jobMeta}>{item.city || item.location || 'Remote'}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.jobStats}>
          <View style={styles.jobStat}>
            <Users color="#64748B" size={14} />
            <Text style={styles.jobStatText}>
              {(item._applications as any)?.count || 0} applications
            </Text>
          </View>
          <View style={styles.jobStat}>
            <Eye color="#64748B" size={14} />
            <Text style={styles.jobStatText}>{item.view_count || 0} views</Text>
          </View>
          <View style={styles.jobStat}>
            <Clock color="#64748B" size={14} />
            <Text style={styles.jobStatText}>{formatDate(item.created_at)}</Text>
          </View>
        </View>

        <View style={styles.jobActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/(employer)/jobs/${item.id}/edit`)}
          >
            <Edit3 color="#64748B" size={18} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleJobStatus(item)}
          >
            {item.status === 'active' ? (
              <Pause color="#F59E0B" size={18} />
            ) : (
              <Play color="#10B981" size={18} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteJob(item.id)}
          >
            <Trash2 color="#EF4444" size={18} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>My Jobs</Text>
            <Text style={styles.headerSubtitle}>
              {jobs.length} total job{jobs.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(employer)/jobs/new')}
          >
            <Plus color="#FFFFFF" size={24} />
          </TouchableOpacity>
        </View>
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

      {/* Jobs List */}
      <FlatList
        data={jobs}
        renderItem={renderJob}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyState}>
              <Briefcase color="#CBD5E1" size={48} />
              <Text style={styles.emptyStateTitle}>No Jobs Posted</Text>
              <Text style={styles.emptyStateText}>
                Create your first job listing to start receiving applications
              </Text>
              <TouchableOpacity
                style={styles.postJobButton}
                onPress={() => router.push('/(employer)/jobs/new')}
              >
                <Plus color="#FFFFFF" size={20} />
                <Text style={styles.postJobButtonText}>Post a Job</Text>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  jobCardContent: {
    padding: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  jobMainInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  jobMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobMeta: {
    fontSize: 13,
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  jobStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  jobStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobStatText: {
    fontSize: 12,
    color: '#64748B',
  },
  jobActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
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
    marginBottom: 24,
  },
  postJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  postJobButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
