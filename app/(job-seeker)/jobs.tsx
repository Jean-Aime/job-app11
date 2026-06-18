import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MapPin, Briefcase, Clock, Heart, SlidersHorizontal, Building2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Job } from '@/types/database';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterChip } from '@/components/ui/FilterChip';
import { JobCardSkeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors, Typography, Spacing, Radius, Space } from '@/constants/theme';
import { formatTimeAgo, formatSalary } from '@/utils/formatters';

const EMPLOYMENT_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'full_time',  label: 'Full Time' },
  { value: 'part_time',  label: 'Part Time' },
  { value: 'contract',   label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance',  label: 'Freelance' },
];

const PAGE_SIZE = 10;

export default function JobsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [jobs,        setJobs]        = useState<Job[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing,  setRefreshing]  = useState(false);
  const [hasMore,     setHasMore]     = useState(true);
  const [page,        setPage]        = useState(0);
  const [search,      setSearch]      = useState(
    Array.isArray(params.search) ? params.search[0] : params.search || ''
  );
  const [empType,     setEmpType]     = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const buildQuery = useCallback((pageNum: number) => {
    let q = supabase
      .from('jobs')
      .select('*, employer:employers(company_name, company_logo_url), category:job_categories(name)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    if (search.trim())
      q = q.or(`title.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
    if (empType) q = q.eq('employment_type', empType);
    return q;
  }, [search, empType]);

  const fetchJobs = useCallback(async (reset = false) => {
    const p = reset ? 0 : page;
    if (reset) setLoading(true); else setLoadingMore(true);

    const { data, error } = await buildQuery(p);
    const rows = (data as Job[]) || [];

    if (reset) setJobs(rows); else setJobs(prev => [...prev, ...rows]);
    setHasMore(rows.length === PAGE_SIZE);
    setPage(p + 1);
    setLoading(false);
    setLoadingMore(false);
    setRefreshing(false);
  }, [buildQuery, page]);

  useEffect(() => { fetchJobs(true); }, [search, empType]);

  const onRefresh = () => { setRefreshing(true); fetchJobs(true); };
  const loadMore  = () => { if (!loadingMore && hasMore) fetchJobs(false); };

  const renderJob = ({ item }: { item: Job & any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(job-seeker)/jobs/${item.id}` as any)}
      activeOpacity={0.85}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.logo}>
          {item.employer?.company_logo_url
            ? <Image source={{ uri: item.employer.company_logo_url }} style={styles.logoImg} />
            : <Building2 color={Colors.textMuted} size={20} strokeWidth={1.8} />}
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.company} numberOfLines={1}>{item.employer?.company_name}</Text>
          <Text style={styles.salary}>
            {formatSalary(item.salary_min, item.salary_max, item.salary_currency)}
          </Text>
        </View>
        <TouchableOpacity style={styles.saveBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Heart color={Colors.textMuted} size={20} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Tags */}
      <View style={styles.tags}>
        <View style={styles.tag}>
          <Briefcase color={Colors.textMuted} size={11} strokeWidth={2} />
          <Text style={styles.tagText}>{item.employment_type?.replace(/_/g, ' ')}</Text>
        </View>
        <View style={styles.tag}>
          <MapPin color={Colors.textMuted} size={11} strokeWidth={2} />
          <Text style={styles.tagText}>{item.city || item.location || 'Remote'}</Text>
        </View>
        {item.is_remote && (
          <View style={[styles.tag, styles.tagRemote]}>
            <Text style={styles.tagRemoteText}>Remote</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.footerMeta}>
          <Clock color={Colors.textMuted} size={11} strokeWidth={2} />
          <Text style={styles.timeText}>{formatTimeAgo(item.created_at)}</Text>
        </View>
        <Text style={styles.viewsText}>{item.view_count || 0} views</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Find Jobs</Text>
        <Text style={styles.count}>{jobs.length}+ opportunities</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search jobs, skills, companies…"
          />
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal
            color={showFilters ? Colors.primary : Colors.textSecondary}
            size={20}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      {showFilters && (
        <View style={styles.filters}>
          <FlatList
            data={EMPLOYMENT_TYPES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={i => i.value}
            contentContainerStyle={styles.filtersContent}
            renderItem={({ item }) => (
              <FilterChip
                label={item.label}
                active={empType === item.value}
                onPress={() => setEmpType(item.value)}
              />
            )}
          />
        </View>
      )}

      {/* List */}
      <FlatList
        data={jobs}
        renderItem={renderJob}
        keyExtractor={i => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={loading ? (
          <View>
            {[1,2,3].map(k => <JobCardSkeleton key={k} />)}
          </View>
        ) : null}
        ListFooterComponent={loadingMore ? (
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
        ) : null}
        ListEmptyComponent={!loading ? (
          <EmptyState
            icon={<Briefcase color={Colors.textMuted} size={36} strokeWidth={1.5} />}
            title="No jobs found"
            description="Try adjusting your search or filters to see more results"
          />
        ) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    paddingHorizontal: Space.pagePadding,
    paddingTop: Spacing[5],
    paddingBottom: Spacing[2],
  },
  heading: { ...Typography.h2, color: Colors.textPrimary },
  count:   { ...Typography.bodySm, color: Colors.textSecondary, marginTop: 2 },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Space.pagePadding,
    paddingVertical: Spacing[4],
    gap: Spacing[3],
  },
  searchWrap: { flex: 1 },
  filterBtn: {
    width: 48, height: 48, borderRadius: Radius.md,
    backgroundColor: Colors.bgCard,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },

  filters:        { marginBottom: Spacing[2] },
  filtersContent: { paddingHorizontal: Space.pagePadding, gap: Spacing[2] },

  list: { paddingHorizontal: Space.pagePadding, paddingBottom: Space.tabBarHeight + 24 },

  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[3],
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[3] },
  logo: {
    width: 48, height: 48, borderRadius: Radius.md,
    backgroundColor: Colors.bg,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: { width: 48, height: 48 },
  info:    { flex: 1, gap: 3 },
  title:   { ...Typography.h5, color: Colors.textPrimary },
  company: { ...Typography.bodySm, color: Colors.textSecondary },
  salary:  { ...Typography.label, color: Colors.employer, fontWeight: '600' },
  saveBtn: { padding: Spacing[1] },

  tags:    { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1],
    borderRadius: Radius.full,
  },
  tagText:       { ...Typography.caption, color: Colors.textMuted, fontWeight: '500' },
  tagRemote:     { backgroundColor: Colors.primaryLight },
  tagRemoteText: { ...Typography.caption, color: Colors.primary, fontWeight: '600' },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  footerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText:   { ...Typography.caption, color: Colors.textMuted },
  viewsText:  { ...Typography.caption, color: Colors.textMuted },
});
