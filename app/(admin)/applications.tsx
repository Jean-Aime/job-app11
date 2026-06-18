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
import {
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  ChevronRight,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Application } from '@/types/database';

export default function AdminApplicationsScreen() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchApplications();
  }, [selectedStatus]);

  const fetchApplications = async () => {
    setLoading(true);

    let query = supabase
      .from('applications')
      .select(`
        *,
        job:jobs(title),
        job_seeker:job_seekers(full_name, profile_photo_url)
      `)
      .order('created_at', { ascending: false });

    if (selectedStatus !== 'all') {
      query = query.eq('status', selectedStatus);
    }

    const { data } = await query;
    if (data) setApplications(data);
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  const filterButtons = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'accepted':
        return { icon: CheckCircle, color: '#10B981', bgColor: '#D1FAE5' };
      case 'rejected':
        return { icon: XCircle, color: '#EF4444', bgColor: '#FEE2E2' };
      case 'pending':
        return { icon: Clock, color: '#F59E0B', bgColor: '#FEF3C7' };
      default:
        return { icon: Clock, color: '#64748B', bgColor: '#F1F5F9' };
    }
  };

  const renderApplication = ({ item }: { item: Application & any }) => {
    const config = getStatusConfig(item.status);
    const StatusIcon = config.icon;

    return (
      <TouchableOpacity style={styles.applicationCard}>
        <View style={styles.applicationContent}>
          <View style={styles.avatar}>
            {item.job_seeker?.profile_photo_url ? (
              <Image source={{ uri: item.job_seeker.profile_photo_url }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarPlaceholder}>
                {item.job_seeker?.full_name?.charAt(0) || '?'}
              </Text>
            )}
          </View>
          <View style={styles.applicationInfo}>
            <Text style={styles.applicantName}>{item.job_seeker?.full_name}</Text>
            <Text style={styles.jobTitle}>{item.job?.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
              <StatusIcon color={config.color} size={12} />
              <Text style={[styles.statusText, { color: config.color }]}>
                {item.status}
              </Text>
            </View>
          </View>
          <ChevronRight color="#94A3B8" size={20} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Applications</Text>
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />
        }
        ListEmptyComponent={
          loading ? undefined : (
            <View style={styles.emptyState}>
              <FileCheck color="#CBD5E1" size={48} />
              <Text style={styles.emptyStateTitle}>No Applications</Text>
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
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  applicationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
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
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
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
