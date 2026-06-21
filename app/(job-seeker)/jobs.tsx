import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MapPin, Briefcase, Clock, Heart, SlidersHorizontal, Building2, Search } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Job } from '@/types/database';
import { FilterChip } from '@/components/ui/FilterChip';
import { JobCardSkeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors, Typography, Spacing, Radius, Space, Palette } from '@/constants/theme';
import { formatTimeAgo, formatSalary } from '@/utils/formatters';
import { TextInput } from 'react-native';

const EMP_TYPES = [
  { value: '', label: 'All' },
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
    Array.isArray(params.search) ? params.search[0] : (params.search as string) || ''
  );
  const [empType,     setEmpType]     = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [focused,     setFocused]     = useState(false);

  const buildQuery = useCallback((p: number) => {
    let q = supabase
      .from('jobs')
      .select('*, employer:employers(company_name, company_logo_url), category:job_categories(name)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1);
    if (search.trim()) q = q.or(`title.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
    if (empType)        q = q.eq('employment_type', empType);
    return q;
  }, [search, empType]);

  const fetchJobs = useCallback(async (reset = false) => {
    const p = reset ? 0 : page;
    if (reset) setLoading(true); else setLoadingMore(true);
    const { data } = await buildQuery(p);
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
      style={s.card}
      onPress={() => router.push(`/(job-seeker)/jobs/${item.id}` as any)}
      activeOpacity={0.88}
    >
      {/* Header */}
      <View style={s.cardTop}>
        <View style={s.logo}>
          {item.employer?.company_logo_url
            ? <Image source={{ uri: item.employer.company_logo_url }} style={s.logoImg} />
            : <Building2 color={Colors.textMuted} size={20} strokeWidth={1.8} />}
        </View>

        <View style={s.info}>
          <Text style={s.title} numberOfLines={1}>{item.title}</Text>
          <Text style={s.company} numberOfLines={1}>{item.employer?.company_name}</Text>
          {(item.salary_min || item.salary_max) && (
            <Text style={s.salary}>
              {formatSalary(item.salary_min, item.salary_max, item.salary_currency)}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={s.heartBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Heart color={Colors.textMuted} size={18} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Tags */}
      <View style={s.tags}>
        <View style={s.tag}>
          <Briefcase color="#64748B" size={10} strokeWidth={2.5} />
          <Text style={s.tagText}>{item.employment_type?.replace(/_/g, ' ')}</Text>
        </View>
        <View style={s.tag}>
          <MapPin color="#64748B" size={10} strokeWidth={2.5} />
          <Text style={s.tagText}>{item.city || item.location || 'Remote'}</Text>
        </View>
        {item.is_remote && (
          <View style={[s.tag, s.tagRemote]}>
            <Text style={s.tagRemoteText}>Remote</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={s.cardFooter}>
        <View style={s.footerLeft}>
          <Clock color="#94A3B8" size={11} strokeWidth={2.5} />
          <Text style={s.timeText}>{formatTimeAgo(item.created_at)}</Text>
        </View>
        <Text style={s.viewsText}>{item.view_count || 0} views</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.heading}>Find Jobs</Text>
          {!loading && <Text style={s.subheading}>{jobs.length > 0 ? `${jobs.length}+ results` : 'Search below'}</Text>}
        </View>
      </View>

      {/* ── Search bar ── */}
      <View style={[s.searchWrap, focused && s.searchFocused]}>
        <Search color={focused ? Colors.primary : '#94A3B8'} size={17} strokeWidth={2.5} />
        <TextInput
          style={s.searchInput}
          placeholder="Search jobs, skills, companies…"
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={[s.filterIcon, showFilters && s.filterIconActive]}
          onPress={() => setShowFilters(v => !v)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <SlidersHorizontal
            color={showFilters ? Colors.primary : '#64748B'}
            size={17}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      {/* ── Filter chips ── */}
      {showFilters && (
        <View style={s.filtersRow}>
          <FlatList
            data={EMP_TYPES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={i => i.value}
            contentContainerStyle={s.filtersList}
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

      {/* ── List ── */}
      <FlatList
        data={jobs}
        renderItem={renderJob}
        keyExtractor={i => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={loading ? (
          <View>{[1, 2, 3].map(k => <JobCardSkeleton key={k} />)}</View>
        ) : null}
        ListFooterComponent={loadingMore ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
        ) : null}
        ListEmptyComponent={!loading ? (
          <EmptyState
            icon={<Briefcase color={Colors.textMuted} size={36} strokeWidth={1.5} />}
            title="No jobs found"
            description="Try adjusting your search or removing filters"
          />
        ) : null}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  heading:    { fontSize: 26, fontWeight: '800', color: '#0F172A', letterSpacing: -0.4 },
  subheading: { fontSize: 13, color: '#94A3B8', marginTop: 2 },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 0,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 10,
    minHeight: 50,
    ...Platform.select({
      ios:     { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
      default: { boxShadow: '0px 2px 6px rgba(15,23,42,0.05)' },
    }),
  },
  searchFocused: { borderColor: Colors.primary },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: 12,
    padding: 0,
  },
  filterIcon:       { padding: 4 },
  filterIconActive: {},

  filtersRow:  { marginVertical: 6 },
  filtersList: { paddingHorizontal: 20, gap: 8 },

  list: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: Space.tabBarHeight + 24 },

  card: {
    backgroundColor: Palette.white,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
      default: { boxShadow: '0px 2px 8px rgba(15,23,42,0.05)' },
    }),
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    paddingBottom: 10,
    gap: 12,
  },
  logo: {
    width: 46, height: 46, borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1, borderColor: '#E2E8F0',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: { width: 46, height: 46 },
  info:    { flex: 1, gap: 2 },
  title:   { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  company: { fontSize: 13, color: '#64748B' },
  salary:  { fontSize: 12, color: '#15803D', fontWeight: '600', marginTop: 2 },
  heartBtn:{ padding: 4, marginTop: 2 },

  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1, borderColor: '#E2E8F0',
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 20,
  },
  tagText:       { fontSize: 11, color: '#64748B', fontWeight: '500' },
  tagRemote:     { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' },
  tagRemoteText: { fontSize: 11, color: '#2563EB', fontWeight: '600' },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    backgroundColor: '#FAFAFA',
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  timeText:   { fontSize: 11, color: '#94A3B8' },
  viewsText:  { fontSize: 11, color: '#CBD5E1' },
});
