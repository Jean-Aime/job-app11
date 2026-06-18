import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { User } from '@/types/database';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { FilterChip } from '@/components/ui/FilterChip';
import { JobCardSkeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Colors, Typography, Spacing, Radius, Space, G, Palette,
} from '@/constants/theme';
import { formatDate } from '@/utils/formatters';

const FILTERS = [
  { value: 'all',        label: 'All' },
  { value: 'verified',   label: 'Verified' },
  { value: 'unverified', label: 'Unverified' },
];

export default function AdminUsersScreen() {
  const [users,   setUsers]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]   = useState('all');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from('users')
      .select('*, job_seeker:job_seekers(full_name, profile_photo_url, city)')
      .eq('role', 'job_seeker')
      .order('created_at', { ascending: false });
    if (filter === 'verified')   q = q.eq('is_verified', true);
    if (filter === 'unverified') q = q.eq('is_verified', false);
    const { data } = await q;
    if (data) setUsers(data);
    setLoading(false);
    setRefreshing(false);
  }, [filter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('users').update({ is_active: !active }).eq('id', id);
    fetchUsers();
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Avatar uri={item.job_seeker?.profile_photo_url} name={item.job_seeker?.full_name} size="md" color={Colors.admin} />
        <View style={styles.info}>
          <Text style={styles.name}>{item.job_seeker?.full_name || 'No name'}</Text>
          <View style={styles.metaRow}>
            <Mail color={Colors.textMuted} size={11} strokeWidth={2} />
            <Text style={styles.metaText} numberOfLines={1}>{item.email}</Text>
          </View>
          <View style={styles.metaRow}>
            <Calendar color={Colors.textMuted} size={11} strokeWidth={2} />
            <Text style={styles.metaText}>Joined {formatDate(item.created_at)}</Text>
          </View>
        </View>
        <Badge
          label={item.is_verified ? 'Verified' : 'Unverified'}
          color={item.is_verified ? Colors.success : Colors.error}
          bg={item.is_verified ? Colors.successLight : Colors.errorLight}
          dot size="sm"
        />
      </View>
      <View style={styles.cardFooter}>
        <Text style={[styles.statusText, { color: item.is_active ? Colors.success : Colors.error }]}>
          {item.is_active ? 'Active' : 'Suspended'}
        </Text>
        <TouchableOpacity
          style={[styles.toggleBtn, { backgroundColor: item.is_active ? Colors.errorLight : Colors.successLight }]}
          onPress={() => toggleActive(item.id, item.is_active)}
        >
          <Text style={[styles.toggleBtnText, { color: item.is_active ? Colors.error : Colors.success }]}>
            {item.is_active ? 'Suspend' : 'Activate'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Job Seekers</Text>
        {!loading && <Text style={styles.count}>{users.length} user{users.length !== 1 ? 's' : ''}</Text>}
      </View>

      <View style={styles.filterWrap}>
        <FlatList
          data={FILTERS} horizontal showsHorizontalScrollIndicator={false}
          keyExtractor={i => i.value} contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <FilterChip label={item.label} active={filter === item.value} onPress={() => setFilter(item.value)} color={Colors.admin} />
          )}
        />
      </View>

      <FlatList
        data={users} renderItem={renderItem} keyExtractor={i => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} tintColor={Colors.admin} />}
        ListHeaderComponent={loading ? <View>{[1,2,3].map(k => <JobCardSkeleton key={k} />)}</View> : null}
        ListEmptyComponent={!loading ? <EmptyState icon={<Users color={Colors.textMuted} size={40} strokeWidth={1.5} />} title="No users found" /> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { ...G.screen },
  header:    { paddingHorizontal: Space.pagePadding, paddingTop: Space.pageTop, paddingBottom: Spacing[3] },
  heading:   { ...Typography.h2, color: Colors.textPrimary },
  count:     { ...Typography.bodySm, color: Colors.textSecondary, marginTop: Spacing[0.5] },
  filterWrap:{ borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterList:{ paddingHorizontal: Space.pagePadding, paddingVertical: Spacing[3], gap: Spacing[2] },
  list:      { padding: Space.pagePadding, paddingTop: Spacing[3], paddingBottom: Space.listBottom },
  card:      { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Space.cardPadding, marginBottom: Space.cardGap, borderWidth: 1, borderColor: Colors.border, gap: Spacing[3] },
  cardTop:   { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[3] },
  info:      { flex: 1, gap: Spacing[0.5] },
  name:      { ...Typography.h5, color: Colors.textPrimary },
  metaRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing[1] },
  metaText:  { ...Typography.caption, color: Colors.textMuted, flex: 1 },
  cardFooter:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Spacing[3], borderTopWidth: 1, borderTopColor: Colors.divider },
  statusText:{ ...Typography.label, fontWeight: '600' },
  toggleBtn: { paddingHorizontal: Spacing[3.5], paddingVertical: Spacing[1.5], borderRadius: Radius.full },
  toggleBtnText: { ...Typography.label, fontWeight: '600' },
});
