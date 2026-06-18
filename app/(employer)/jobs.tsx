import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Briefcase, Plus, Eye, Users, Edit3, Trash2, Pause, Play, MapPin,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Job } from '@/types/database';
import { useAuthStore } from '@/stores/authStore';
import { FilterChip } from '@/components/ui/FilterChip';
import { Badge } from '@/components/ui/Badge';
import { JobCardSkeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Colors, Typography, Spacing, Radius, Space, G, JobStatusConfig, Palette,
} from '@/constants/theme';
import { formatDate } from '@/utils/formatters';

const FILTERS = [
  { value: 'all',    label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
  { value: 'draft',  label: 'Draft' },
];

export default function EmployerJobsScreen() {
  const router = useRouter();
  const { employer } = useAuthStore();
  const [jobs,       setJobs]       = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter,     setFilter]     = useState('all');

  const fetchJobs = useCallback(async () => {
    if (!employer) return;
    setLoading(true);
    let q = supabase.from('jobs').select('*, category:job_categories(name)')
      .eq('employer_id', employer.id).order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const { data } = await q;
    if (data) setJobs(data);
    setLoading(false);
    setRefreshing(false);
  }, [employer?.id, filter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const toggleStatus = async (job: Job) => {
    const next = job.status === 'active' ? 'closed' : 'active';
    await supabase.from('jobs').update({ status: next }).eq('id', job.id);
    fetchJobs();
  };

  const deleteJob = (id: string) => {
    Alert.alert('Delete Job', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await supabase.from('jobs').delete().eq('id', id); fetchJobs(); } },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => {
    const sc = JobStatusConfig[item.status] || JobStatusConfig.draft;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(employer)/jobs/${item.id}` as any)}
        activeOpacity={0.88}
      >
        <View style={styles.cardHeader}>
          <View style={[G.iconMd, { backgroundColor: Colors.employerLight }]}>
            <Briefcase color={Colors.employer} size={18} strokeWidth={2} />
          </View>
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <View style={styles.metaRow}>
              <MapPin color={Colors.textMuted} size={11} strokeWidth={2} />
              <Text style={styles.metaText}>{item.city || item.location || 'Remote'}</Text>
            </View>
          </View>
          <Badge label={sc.label} color={sc.color} bg={sc.bg} dot size="sm" />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Users color={Colors.textMuted} size={13} strokeWidth={2} />
            <Text style={styles.statText}>{item.view_count || 0} views</Text>
          </View>
          <Text style={styles.statDivider}>·</Text>
          <Text style={styles.statText}>{formatDate(item.created_at)}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/(employer)/jobs/${item.id}/edit` as any)}>
            <Edit3 color={Colors.textSecondary} size={16} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => toggleStatus(item)}>
            {item.status === 'active'
              ? <Pause color={Colors.warning} size={16} strokeWidth={2} />
              : <Play color={Colors.success} size={16} strokeWidth={2} />}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => deleteJob(item.id)}>
            <Trash2 color={Colors.error} size={16} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>My Jobs</Text>
          {!loading && <Text style={styles.count}>{jobs.length} job{jobs.length !== 1 ? 's' : ''}</Text>}
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/(employer)/jobs/new' as any)}
        >
          <Plus color={Palette.white} size={20} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterWrap}>
        <FlatList
          data={FILTERS} horizontal showsHorizontalScrollIndicator={false}
          keyExtractor={i => i.value} contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <FilterChip label={item.label} active={filter === item.value}
              onPress={() => setFilter(item.value)} color={Colors.employer} />
          )}
        />
      </View>

      <FlatList
        data={jobs} renderItem={renderItem} keyExtractor={i => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchJobs(); }} tintColor={Colors.employer} />}
        ListHeaderComponent={loading ? <View>{[1,2,3].map(k => <JobCardSkeleton key={k} />)}</View> : null}
        ListEmptyComponent={!loading ? (
          <EmptyState
            icon={<Briefcase color={Colors.textMuted} size={40} strokeWidth={1.5} />}
            title="No jobs posted"
            description="Post a job to start receiving applications"
            actionLabel="Post a Job"
            onAction={() => router.push('/(employer)/jobs/new' as any)}
          />
        ) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { ...G.screen },
  header:     { ...G.rowBetween, paddingHorizontal: Space.pagePadding, paddingTop: Space.pageTop, paddingBottom: Spacing[3] },
  heading:    { ...Typography.h2, color: Colors.textPrimary },
  count:      { ...Typography.bodySm, color: Colors.textSecondary, marginTop: Spacing[0.5] },
  addBtn:     { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.employer, alignItems: 'center', justifyContent: 'center' },
  filterWrap: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterList: { paddingHorizontal: Space.pagePadding, paddingVertical: Spacing[3], gap: Spacing[2] },
  list:       { padding: Space.pagePadding, paddingTop: Spacing[3], paddingBottom: Space.listBottom },

  card:       { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, marginBottom: Space.cardGap, borderWidth: 1, borderColor: Colors.border, padding: Space.cardPadding, gap: Spacing[3] },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  info:       { flex: 1 },
  title:      { ...Typography.h5, color: Colors.textPrimary, marginBottom: 3 },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: Spacing[1] },
  metaText:   { ...Typography.caption, color: Colors.textMuted },
  statsRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], paddingTop: Spacing[2], borderTopWidth: 1, borderTopColor: Colors.divider },
  statItem:   { flexDirection: 'row', alignItems: 'center', gap: Spacing[1] },
  statText:   { ...Typography.caption, color: Colors.textMuted },
  statDivider:{ ...Typography.caption, color: Colors.textMuted },
  actions:    { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing[2] },
  actionBtn:  { width: 36, height: 36, borderRadius: Radius.md, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  deleteBtn:  { backgroundColor: Colors.errorLight },
});
