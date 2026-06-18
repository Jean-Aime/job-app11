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
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ChevronRight,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Employer } from '@/types/database';

export default function AdminEmployersScreen() {
  const router = useRouter();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchEmployers();
  }, [selectedStatus]);

  const fetchEmployers = async () => {
    setLoading(true);

    let query = supabase
      .from('employers')
      .select('*')
      .order('created_at', { ascending: false });

    if (selectedStatus === 'pending') {
      query = query.eq('verification_status', 'pending');
    } else if (selectedStatus === 'approved') {
      query = query.eq('verification_status', 'approved');
    } else if (selectedStatus === 'rejected') {
      query = query.eq('verification_status', 'rejected');
    }

    const { data } = await query;
    if (data) setEmployers(data);
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEmployers();
  };

  const updateVerificationStatus = async (employerId: string, status: 'approved' | 'rejected') => {
    Alert.alert(
      ` ${status === 'approved' ? 'Approve' : 'Reject'} Verification`,
      `Are you sure you want to ${status} this employer?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: status === 'approved' ? 'Approve' : 'Reject',
          style: status === 'approved' ? 'default' : 'destructive',
          onPress: async () => {
            await supabase
              .from('employers')
              .update({ verification_status: status, is_verified: status === 'approved' })
              .eq('id', employerId);
            fetchEmployers();
          },
        },
      ]
    );
  };

  const filterButtons = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle color="#10B981" size={16} />;
      case 'rejected':
        return <XCircle color="#EF4444" size={16} />;
      default:
        return <Clock color="#F59E0B" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      default:
        return '#F59E0B';
    }
  };

  const renderEmployer = ({ item }: { item: Employer }) => (
    <View style={styles.employerCard}>
      <TouchableOpacity
        style={styles.employerCardContent}
        onPress={() => router.push(`/(admin)/employers/${item.id}`)}
      >
        <View style={styles.avatar}>
          {item.company_logo_url ? (
            <Image source={{ uri: item.company_logo_url }} style={styles.avatarImage} />
          ) : (
            <Building2 color="#64748B" size={24} />
          )}
        </View>
        <View style={styles.employerInfo}>
          <Text style={styles.companyName}>{item.company_name}</Text>
          <Text style={styles.industry}>{item.industry || 'No industry'}</Text>
          <View style={styles.statusBadge}>
            {getStatusIcon(item.verification_status)}
            <Text style={[styles.statusText, { color: getStatusColor(item.verification_status) }]}>
              {item.verification_status}
            </Text>
          </View>
        </View>
        <ChevronRight color="#94A3B8" size={20} />
      </TouchableOpacity>

      {item.verification_status === 'pending' && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => updateVerificationStatus(item.id, 'approved')}
          >
            <CheckCircle color="#10B981" size={16} />
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => updateVerificationStatus(item.id, 'rejected')}
          >
            <XCircle color="#EF4444" size={16} />
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.verification_status === 'rejected' && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => updateVerificationStatus(item.id, 'approved')}
          >
            <CheckCircle color="#10B981" size={16} />
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Employers</Text>
        <Text style={styles.headerSubtitle}>
          {employers.length} compan{employers.length !== 1 ? 'ies' : 'y'}
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

      {/* Employers List */}
      <FlatList
        data={employers}
        renderItem={renderEmployer}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />
        }
        ListEmptyComponent={
          loading ? undefined : (
            <View style={styles.emptyState}>
              <Building2 color="#CBD5E1" size={48} />
              <Text style={styles.emptyStateTitle}>No Employers Found</Text>
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
  employerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  employerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  employerInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  industry: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  approveButton: {},
  rejectButton: {
    borderLeftWidth: 1,
    borderLeftColor: '#F1F5F9',
  },
  approveButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  rejectButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
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
