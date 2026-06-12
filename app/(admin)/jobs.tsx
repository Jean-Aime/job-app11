import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Briefcase,
  MapPin,
  Eye,
  Trash2,
  ChevronRight,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Job } from '@/types/database';

export default function AdminJobsScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState<(Job & { employer?: any })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchJobs();
  }, [selectedStatus]);

  const fetchJobs = async () => {
    setLoading(true);

    let query = supabase
      .from('jobs')
      .select(`
        *,
        employer:employers(company_name, company_logo_url)
      `)
      .order('created_at', { ascending: false });

    if (selectedStatus !== 'all') {
      query = query.eq('status', selectedStatus);
    }

    const { data } = await query;
    if (data) setJobs(data);
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
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
            await supabase.from('jobs').delete().eq('id', jobId);
            fetchJobs();
          },
        },
      ]
    );
  };

  const filterButtons = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'closed', label: 'Closed' },
    { value: 'draft', label: 'Draft' },
  ];

  const renderJob = ({ item }: { item: Job & { employer?: any } }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => router.push(`/(admin)/jobs/${item.id}`)}
    >
      <View style={styles.jobCardContent}>
        <View style={styles.jobIcon}>
          {item.employer?.company_logo_url ? (
            <Image source={{ uri: item.employer?.company_logo_url }} style={styles.logoImage} />
          ) : (
            <Briefcase color="#64748B" size={20} />
          )}
        </View>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.companyName}>{item.employer?.company_name}</Text>
          <View style={styles.jobMeta}>
            <MapPin color="#94A3B8" size={12} />
            <Text style={styles.jobMetaText}>{item.city || 'Remote'}</Text>
            <Text style={styles.jobMetaDot}>-</Text>
            <Eye color="#94A3B8" size={12} />
            <Text style={styles.jobMetaText}>{item.view_count || 0} views</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={[styles.statusText, getStatusTextStyle(item.status)]}>
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return { backgroundColor: '#D1FAE5' };
      case 'closed':
        return { backgroundColor: '#FEE2E2' };
      default:
        return { backgroundColor: '#F1F5F9' };
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status) {
      case 'active':
        return { color: '#10B981' };
      case 'closed':
        return { color: '#EF4444' };
      default:
        return { color: '#64748B' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Jobs</Text>
        <Text style={styles.headerSubtitle}>
          {jobs.length} job{jobs.length !== 1 ? 's' : ''}
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

      {/* Jobs List */}
      <FlatList
        data={jobs}
        renderItem={renderJob}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />
        }
        ListEmptyComponent={
          loading ? undefined : (
            <View style={styles.emptyState}>
              <Briefcase color="#CBD5E1" size={48} />
              <Text style={styles.emptyStateTitle}>No Jobs Found</Text>
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
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
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
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
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
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  logoImage: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  companyName: {
    fontSize: 13,
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
  jobMetaDot: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
  },
});
