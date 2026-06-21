import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, RefreshControl, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FileText, MapPin, Building2, ChevronRight } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/utils/formatters';
import { Application } from '@/types/database';
import { useAuthStore } from '@/stores/authStore';
import { JobCardSkeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors, Space, StatusConfig, Palette } from '@/constants/theme';

const FILTERS = [
  { value: 'all',         label: 'All' },
  { value: 'pending',     label: 'Pending' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'accepted',    label: 'Accepted' },
  { value: 'rejected',    label: 'Rejected' },
];

export default function ApplicationsScreen() {
  const router = useRouter();
  const { jobSeeker, isAuthenticated } = useAuthStore();
  const [applications,   setApplications]   = useState<Application[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);
  const [selected,       setSelected]       = useState('all');

  const fetchApplications = useCallback(async () => {
    if (!jobSeeker) return;
    setLoading(true);
    let q = supabase
      .from('applications')
      .select(`*, job:jobs(*, employer:employers(company_name, company_logo_url), category:job_categories(name))`)
      .eq('job_seeker_id', jobSeeker.id)
      .order('created_at', { ascending: false });
    if (selected !== 'all') q = q.eq('status', selected);
    const { data } = await q;
    setApplications(data || []);
    setLoading(false);
    setRefreshing(false);
  }, [jobSeeker?.id, selected]);

  useEffect(() => {
    if (isAuthenticated && jobSeeker) fetchApplications();
  }, [fetchApplications]);

  const onRefresh = () => { setRefreshing(true); fetchApplications(); };

  if (!isAuthenticated || !jobSeeker) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <EmptyState
          icon={<FileText color={Colors.textMuted} size={40} strokeWidth={1.5} />}
          title="Sign in to continue"
          description="Track all your job applications in one place"
          actionLabel="Sign In"
          onAction={() => router.push('/(auth)' as any)}
        />
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: Application & any }) => {
    const sc = StatusConfig[item.status] || StatusConfig.pending;
    return (
      <TouchableOpacity
        style={s.card}
        onPress={() => router.push(`/(job-seeker)/applications/${item.id}` as any)}
        activeOpacity={0.88}
      >
        {/* Left: logo */}
        <View style={s.logo}>
          {item.job?.employer?.company_logo_url
            ? <Image source={{ uri: item.job.employer.company_logo_url }} style={s.logoImg} />
            : <Building2 color={Colors.textMuted} size={20} strokeWidth={1.8} />}
        </View>

        {/* Center: info */}
        <View style={s.info}>
          <Text style={s.jobTitle} numberOfLines={1}>{item.job?.title}</Text>
          <Text style={s.company} numberOfLines={1}>{item.job?.employer?.company_name}</Text>
          <View style={s.metaRow}>
            <MapPin color="#94A3B8" size={10} strokeWidth={2.5} />
            <Text style={s.metaText}>{item.job?.city || 'Remote'}</Text>
            <Text style={s.bullet}>·</Text>
            <Text style={s.metaText}>Applied {formatDate(item.created_at)}</Text>
          </View>
        </View>

        {/* Right: status + arrow */}
        <View style={s.right}>
          <View style={[s.statusPill, { backgroundColor: sc.bg }]}>
            <View style={[s.statusDot, { backgroundColor: sc.color }]} />
            <Text style={[s.statusText, { color: sc.color }]}>{sc.label}</Text>
          </View>
          <ChevronRight color="#CBD5E1" size={16} strokeWidth={2} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.heading}>Applications</Text>
          {!loading && (
            <Text style={s.subheading}>
              {applications.length} {applications.length === 1 ? 'application' : 'applications'}
            </Text>
          )}
        </View>
      </View>

      {/* Filter tabs */}
      <View style={s.filterRow}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={i => i.value}
          contentContainerStyle={s.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[s.filterTab, selected === item.value && s.filterTabActive]}
              onPress={() => setSelected(item.value)}
            >
              <Text style={[s.filterTabText, selected === item.value && s.filterTabTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* List */}
      <FlatList
        data={applications}
        renderItem={renderItem}
        keyExtractor={i => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListHeaderComponent={loading ? (
          <View>{[1, 2, 3].map(k => <JobCardSkeleton key={k} />)}</View>
        ) : null}
        ListEmptyComponent={!loading ? (
          <EmptyState
            icon={<FileText color={Colors.textMuted} size={40} strokeWidth={1.5} />}
            title={selected === 'all' ? 'No applications yet' : `No ${selected} applications`}
            description={selected === 'all' ? 'Start applying for jobs and track them here' : 'Try a different filter'}
            actionLabel={selected === 'all' ? 'Browse Jobs' : undefined}
            onAction={selected === 'all' ? () => router.push('/(job-seeker)/jobs') : undefined}
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
    paddingBottom: 8,
  },
  heading:    { fontSize: 26, fontWeight: '800', color: '#0F172A', letterSpacing: -0.4 },
  subheading: { fontSize: 13, color: '#94A3B8', marginTop: 3 },

  filterRow:  { paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  filterList: { paddingHorizontal: 20, paddingVertical: 10, gap: 8 },
  filterTab: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterTabActive: { backgroundColor: Colors.primary },
  filterTabText:   { fontSize: 13, fontWeight: '600', color: '#64748B' },
  filterTabTextActive: { color: Palette.white },

  list: { padding: 20, paddingBottom: Space.tabBarHeight + 24 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
    ...Platform.select({
      ios:     { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
      default: { boxShadow: '0px 2px 6px rgba(15,23,42,0.05)' },
    }),
  },
  logo: {
    width: 46, height: 46, borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1, borderColor: '#E2E8F0',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', flexShrink: 0,
  },
  logoImg:  { width: 46, height: 46 },
  info:     { flex: 1, gap: 2 },
  jobTitle: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  company:  { fontSize: 13, color: '#64748B' },
  metaRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  metaText: { fontSize: 11, color: '#94A3B8' },
  bullet:   { fontSize: 11, color: '#CBD5E1' },

  right:      { alignItems: 'flex-end', gap: 8 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusDot:  { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
});
