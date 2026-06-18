import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Briefcase, MapPin, Eye, Trash2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Job } from '@/types/database';
import { FilterChip } from '@/components/ui/FilterChip';
import { JobCardSkeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import {
  Colors, Typography, Spacing, Radius, Space, G, JobStatusConfig,
} from '@/constants/theme';

const FILTERS = [
  { value: 'all',    label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
  { value: 'draft',  label: 'Draft' },
];

export default function AdminJobsScreen() {
  const [jobs,       setJobs]       = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter,     setFilter]     = useState('all');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from('jobs')
      .select('*, employer:employers(company_name, company_logo_url)')
      .order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const { data } = await q;
    if (data) setJobs(data);
    setLoading(false);
    setRefreshing(false);
  }, [filter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const deleteJob = (id: string) => {
    Alert.alert('Delete Job', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await supabase.from('jobs').delete().eq('id', id); fetchJobs(); } },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => {
    const sc = JobStatusConfig[item.status] || JobStatusConfig.draft;
    return (
      <View style={styles.card}>
        <View style={styles.cardInner}>
          <View style={styles.logo}>
            {item.employer?.company_logo_url
              ? <Image source={{ uri: item.employer.company_logo_url }} style={styles.logoImg} />
              : <Briefcase color={Colors.textMuted} size={18} strokeWidth={1.8} />}
          </View>
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.company}>{item.employer?.company_name}</Text>
            <View style={styles.metaRow}>
              <MapPin color={Colors.textMuted} size={11} strokeWidth={2} />
              <Text style={styles.metaText}>{item.city || 'Remote'}</Text>
              <View style={styles.metaDot} />
              <Eye color={Colors.textMuted} size={11} strokeWidth={2} />
              <Text style={styles.metaText}>{item.view_count || 0} views</Text>
            </View>
          </View>
          <Badge label={sc.label} color={sc.color} bg={sc.bg} dot size="sm" />
        </View>
        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteJob(item.id)}>
            <Trash2 color={Colors.error} size={16} strokeWidth={2} />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Jobs</Text>
        {!loading && <Text style={styles.count}>{jobs.length} job{jobs.length !== 1 ? 's' : ''}</Text>}
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
        data={jobs} renderItem={renderItem} keyExtractor={i => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchJobs(); }} tintColor={Colors.admin} />}
        ListHeaderComponent={loading ? <View>{[1,2,3].map(k => <JobCardSkeleton key={k} />)}</View> : null}
        ListEmptyComponent={!loading ? (
          <EmptyState icon={<Briefcase color={Colors.textMuted} size={40} strokeWidth={1.5} />} title="No jobs found" />
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

  card:       { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, marginBottom: Space.cardGap, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  cardInner:  { flexDirection: 'row', alignItems: 'center', padding: Space.cardPadding, gap: Spacing[3] },
  logo:       { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logoImg:    { width: 44, height: 44 },
  info:       { flex: 1, gap: Spacing[0.5] },
  title:      { ...Typography.h5, color: Colors.textPrimary },
  company:    { ...Typography.bodySm, color: Colors.textSecondary },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: Spacing[1.5], marginTop: 2 },
  metaText:   { ...Typography.caption, color: Colors.textMuted },
  metaDot:    { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.textMuted },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', padding: Spacing[3], borderTopWidth: 1, borderTopColor: Colors.divider },
  deleteBtn:  { flexDirection: 'row', alignItems: 'center', gap: Spacing[1.5], backgroundColor: Colors.errorLight, paddingHorizontal: Spacing[3], paddingVertical: Spacing[1.5], borderRadius: Radius.full },
  deleteBtnText: { ...Typography.label, color: Colors.error, fontWeight: '600' },
});
