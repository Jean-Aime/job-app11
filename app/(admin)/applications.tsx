import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileCheck } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { FilterChip } from '@/components/ui/FilterChip';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { JobCardSkeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Colors, Typography, Spacing, Radius, Space, G, StatusConfig,
} from '@/constants/theme';
import { formatDate } from '@/utils/formatters';

const FILTERS = [
  { value: 'all',         label: 'All' },
  { value: 'pending',     label: 'Pending' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'accepted',    label: 'Accepted' },
  { value: 'rejected',    label: 'Rejected' },
];

export default function AdminApplicationsScreen() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [filter,       setFilter]       = useState('all');

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from('applications')
      .select('*, job:jobs(title), job_seeker:job_seekers(full_name, profile_photo_url)')
      .order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const { data } = await q;
    if (data) setApplications(data);
    setLoading(false);
    setRefreshing(false);
  }, [filter]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const renderItem = ({ item }: { item: any }) => {
    const sc = StatusConfig[item.status] || StatusConfig.pending;
    return (
      <View style={styles.card}>
        <View style={styles.cardInner}>
          <Avatar uri={item.job_seeker?.profile_photo_url} name={item.job_seeker?.full_name} size="md" color={Colors.admin} />
          <View style={styles.info}>
            <Text style={styles.name}>{item.job_seeker?.full_name}</Text>
            <Text style={styles.jobTitle} numberOfLines={1}>{item.job?.title}</Text>
            <Text style={styles.date}>{formatDate(item.created_at)}</Text>
          </View>
          <Badge label={sc.label} color={sc.color} bg={sc.bg} dot size="sm" />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Applications</Text>
        {!loading && <Text style={styles.count}>{applications.length} total</Text>}
      </View>

      <View style={styles.filterWrap}>
        <FlatList
          data={FILTERS} horizontal showsHorizontalScrollIndicator={false}
          keyExtractor={i => i.value} contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <FilterChip label={item.label} active={filter === item.value}
              onPress={() => setFilter(item.value)} color={Colors.admin} />
          )}
        />
      </View>

      <FlatList
        data={applications} renderItem={renderItem} keyExtractor={i => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchApplications(); }} tintColor={Colors.admin} />}
        ListHeaderComponent={loading ? <View>{[1,2,3].map(k => <JobCardSkeleton key={k} />)}</View> : null}
        ListEmptyComponent={!loading ? (
          <EmptyState icon={<FileCheck color={Colors.textMuted} size={40} strokeWidth={1.5} />} title="No applications found" />
        ) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { ...G.screen },
  header:     { paddingHorizontal: Space.pagePadding, paddingTop: Space.pageTop, paddingBottom: Spacing[3] },
  heading:    { ...Typography.h2, color: Colors.textPrimary },
  count:      { ...Typography.bodySm, color: Colors.textSecondary, marginTop: Spacing[0.5] },
  filterWrap: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterList: { paddingHorizontal: Space.pagePadding, paddingVertical: Spacing[3], gap: Spacing[2] },
  list:       { padding: Space.pagePadding, paddingTop: Spacing[3], paddingBottom: Space.listBottom },
  card:       { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, marginBottom: Space.cardGap, borderWidth: 1, borderColor: Colors.border },
  cardInner:  { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], padding: Space.cardPadding },
  info:       { flex: 1, gap: Spacing[0.5] },
  name:       { ...Typography.h5, color: Colors.textPrimary },
  jobTitle:   { ...Typography.bodySm, color: Colors.textSecondary },
  date:       { ...Typography.caption, color: Colors.textMuted },
});
