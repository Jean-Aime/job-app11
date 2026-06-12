import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Mail,
  Calendar,
  ChevronRight,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { User } from '@/types/database';

export default function AdminUsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<(User & { job_seeker?: any })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, [selectedStatus]);

  const fetchUsers = async () => {
    setLoading(true);

    let query = supabase
      .from('users')
      .select(`
        *,
        job_seeker:job_seekers(full_name, profile_photo_url, city)
      `)
      .eq('role', 'job_seeker')
      .order('created_at', { ascending: false });

    if (selectedStatus === 'verified') {
      query = query.eq('is_verified', true);
    } else if (selectedStatus === 'unverified') {
      query = query.eq('is_verified', false);
    } else if (selectedStatus === 'active') {
      query = query.eq('is_active', true);
    }

    const { data } = await query;
    if (data) setUsers(data);
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    await supabase.from('users').update({ is_active: !isActive }).eq('id', userId);
    fetchUsers();
  };

  const filterButtons = [
    { value: 'all', label: 'All' },
    { value: 'verified', label: 'Verified' },
    { value: 'unverified', label: 'Unverified' },
    { value: 'active', label: 'Active' },
  ];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderUser = ({ item }: { item: User & { job_seeker?: any } }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => router.push(`/(admin)/users/${item.id}`)}
    >
      <View style={styles.userCardContent}>
        <View style={styles.avatar}>
          {item.job_seeker?.profile_photo_url ? (
            <Image source={{ uri: item.job_seeker.profile_photo_url }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarPlaceholder}>
              {item.job_seeker?.full_name?.charAt(0) || '?'}
            </Text>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.job_seeker?.full_name || 'No name provided'}
          </Text>
          <View style={styles.userMeta}>
            <Mail color="#94A3B8" size={12} />
            <Text style={styles.userMetaText}>{item.email}</Text>
          </View>
          <View style={styles.userMeta}>
            <Calendar color="#94A3B8" size={12} />
            <Text style={styles.userMetaText}>Joined {formatDate(item.created_at)}</Text>
          </View>
        </View>
        <View style={styles.userStatus}>
          <View style={[styles.statusBadge, item.is_verified ? styles.verified : styles.unverified]}>
            {item.is_verified ? (
              <CheckCircle color="#10B981" size={14} />
            ) : (
              <XCircle color="#EF4444" size={14} />
            )}
            <Text style={[styles.statusText, item.is_verified && styles.verifiedText]}>
              {item.is_verified ? 'Verified' : 'Unverified'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.actionButton, item.is_active ? styles.suspendButton : styles.activateButton]}
            onPress={() => toggleUserStatus(item.id, item.is_active)}
          >
            <Text style={styles.actionButtonText}>
              {item.is_active ? 'Suspend' : 'Activate'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Job Seekers</Text>
        <Text style={styles.headerSubtitle}>
          {users.length} user{users.length !== 1 ? 's' : ''}
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

      {/* Users List */}
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyState}>
              <Users color="#CBD5E1" size={48} />
              <Text style={styles.emptyStateTitle}>No Users Found</Text>
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
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userCardContent: {
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
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  userMetaText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  userStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    marginBottom: 8,
  },
  verified: {
    backgroundColor: '#D1FAE5',
  },
  unverified: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
  },
  verifiedText: {
    color: '#10B981',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  suspendButton: {
    backgroundColor: '#FEE2E2',
  },
  activateButton: {
    backgroundColor: '#D1FAE5',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
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
