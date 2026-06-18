import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Users, ChevronRight } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { FilterChip } from '@/components/ui/FilterChip';
import { JobCardSkeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Colors, Typography, Spacing, Radius, Space, G, StatusConfig, Palette,
} from '@/constants/theme';

const FILTERS = [
  { value: 'all',         label: 'All' },
  { value: 'pending',     label: 'Pending' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'accepted',    label: 'Accepted' },
  { value: 'rejected',    label: 'Rejected' },
];

export default function CandidatesScreen() {
  const router = useRouter();
  const { employer } = useAuthStore();
  const [applications,   setApplications]   = useState<any[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fetchApplications = useCallback(async () => {
    if (!employer) return;
    setLoading(true);
    const { data: jobs } = await supabase.from('jobs').select('id').eq('employer_id', employer.id);
    const jobIds = jobs?.map(j => j.id) || [];
    if (!jobIds.length) { setApplications([]); setLoading(false); setRefreshing(false); return; }

    let q = supabase
      .from('applications')
      .select('*, job:jobs(id,title), job_seeker:job_seekers(id,full_name,profile_photo_url,current_occupation,years_of_experience,city)')
      .in('job_id', jobIds)
      .order('created_at', { ascending: false });
    if (selectedStatus !== 'all') q = q.eq('status', selectedStatus);

    const { data } = await q;
    setApplications(data || []);
    setLoading(false);
    setRefreshing(false);
  }, [employer?.id, selectedStatus]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);
  const onRefresh = () => { setRefreshing(true); fetchApplications(); };

  const renderItem = ({ item }: { item: any }) => {
    const sc = StatusConfig[item.status] || StatusConfig.pending;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(employer)/candidates/${item.id}` as any)}
        activeOpacity={0.85}
      >
        <View style={styles.cardTop}>
          <Avatar uri={item.job_seeker?.profile_photo_url} name={item.job_seeker?.full_name} size="md" color={Colors.employer} />
          <View style={styles.info}>
            <Text style={styles.name}>{item.job_seeker?.full_name}</Text>
            <Text style={styles.jobTitle} numberOfLines={1}>{item.job?.title}</Text>
            <Text style={styles.meta}>
              {item.job_seeker?.years_of_experience} yrs exp
              {item.job_seeker?.city ? `  •  ${item.job_seeker.city}` : ''}
            </Text>
          </View>
          {item.match_score != null && (
            <View style={styles.matchBadge}>
              <Text style={styles.matchPct}>{Math.round(item.match_score)}%</Text>
              <Text style={styles.matchLbl}>Match</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Badge label={sc.label} color={sc.color} bg={sc.bg} dot size="sm" />
          <ChevronRight color={Colors.textMuted} size={16} strokeWidth={2} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Candidates</Text>
        {!loading && <Text style={styles.count}>{applications.length} application{applications.length !== 1 ? 's' : ''}</Text>}
      </View>

      {/* Filters */}
      <View style={styles.filterWrap}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={i => i.value}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <FilterChip
              label={item.label}
              active={selectedStatus === item.value}
              onPress={() => setSelectedStatus(item.value)}
              color={Colors.employer}
            />
          )}
        />
      </View>

      <FlatList
        data={applications}
        renderItem={renderItem}
        keyExtractor={i => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.employer} />}
        ListHeaderComponent={loading ? <View>{[1,2,3].map(k => <JobCardSkeleton key={k} />)}</View> : null}
        ListEmptyComponent={!loading ? (
          <EmptyState
            icon={<Users color={Colors.textMuted} size={40} strokeWidth={1.5} />}
            title={selectedStatus === 'all' ? 'No candidates yet' : `No ${selectedStatus} candidates`}
            description={selectedStatus === 'all' ? 'Applications will appear here once received' : 'Try a different filter'}
          />
        ) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { ...G.screen },

  header: {
    paddingHorizontal: Space.pagePadding,
    paddingTop: Space.pageTop,
    paddingBottom: Spacing[3],
  },
  heading: { ...Typography.h2, color: Colors.textPrimary },
  count:   { ...Typography.bodySm, color: Colors.textSecondary, marginTop: Spacing[0.5] },

  filterWrap: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterList: { paddingHorizontal: Space.pagePadding, paddingVertical: Spacing[3], gap: Spacing[2] },

  list: { padding: Space.pagePadding, paddingTop: Spacing[3], paddingBottom: Space.listBottom },

  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Space.cardPadding,
    marginBottom: Space.cardGap,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[3],
  },
  cardTop:    { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[3] },
  info:       { flex: 1 },
  name:       { ...Typography.h5, color: Colors.textPrimary, marginBottom: 2 },
  jobTitle:   { ...Typography.bodySm, color: Colors.textSecondary, marginBottom: 2 },
  meta:       { ...Typography.caption, color: Colors.textMuted },
  matchBadge: {
    alignItems: 'center',
    backgroundColor: Colors.employerLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    minWidth: 52,
  },
  matchPct: { ...Typography.h5, color: Colors.employer },
  matchLbl: { ...Typography.caption, color: Colors.employer },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
});
