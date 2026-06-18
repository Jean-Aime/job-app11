import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  FileText, Clock, MapPin, Briefcase, Building2,
  CheckCircle, XCircle, AlertCircle, ChevronRight,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/utils/formatters';
import { Application } from '@/types/database';
import { useAuthStore } from '@/stores/authStore';
import { JobCardSkeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterChip } from '@/components/ui/FilterChip';
import { Badge } from '@/components/ui/Badge';
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

export default function ApplicationsScreen() {
  const router = useRouter();
  const { jobSeeker, isAuthenticated } = useAuthStore();
  const [applications,  setApplications]  = useState<Application[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fetchApplications = useCallback(async () => {
    if (!jobSeeker) return;
    setLoading(true);
    let q = supabase
      .from('applications')
      .select(`*, job:jobs(*, employer:employers(company_name, company_logo_url), category:job_categories(name))`)
      .eq('job_seeker_id', jobSeeker.id)
      .order('created_at', { ascending: false });
    if (selectedStatus !== 'all') q = q.eq('status', selectedStatus);
    const { data } = await q;
    setApplications(data || []);
    setLoading(false);
    setRefreshing(false);
  }, [jobSeeker?.id, selectedStatus]);

  useEffect(() => {
    if (isAuthenticated && jobSeeker) fetchApplications();
  }, [fetchApplications]);

  const onRefresh = () => { setRefreshing(true); fetchApplications(); };

  const renderItem = ({ item }: { item: Application & any }) => {
    const sc = StatusConfig[item.status] || StatusConfig.pending;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(job-seeker)/applications/${item.id}` as any)}
        activeOpacity={0.85}
      >
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={styles.logo}>
            {item.job?.employer?.company_logo_url
              ? <Image source={{ uri: item.job.employer.company_logo_url }} style={styles.logoImg} />
              : <Building2 color={Colors.textMuted} size={20} strokeWidth={1.8} />}
          </View>
          <View style={styles.info}>
            <Text style={styles.jobTitle} numberOfLines={1}>{item.job?.title}</Text>
            <Text style={styles.company}>{item.job?.employer?.company_name}</Text>
            <View style={styles.metaRow}>
              <MapPin color={Colors.textMuted} size={11} strokeWidth={2} />
              <Text style={styles.metaText}>{item.job?.city || 'Remote'}</Text>
            </View>
          </View>
          <ChevronRight color={Colors.textMuted} size={18} strokeWidth={2} />
        </View>

        {/* Footer row */}
        <View style={styles.cardFooter}>
          <View style={styles.dateRow}>
            <FileText color={Colors.textMuted} size={13} strokeWidth={2} />
            <Text style={styles.dateText}>Applied {formatDate(item.created_at)}</Text>
          </View>
          <Badge label={sc.label} color={sc.color} bg={sc.bg} size="sm" dot />
        </View>

        {/* Match score */}
        {item.match_score != null && (
          <View style={styles.matchRow}>
            <Text style={styles.matchLabel}>Match Score</Text>
            <Text style={styles.matchValue}>{Math.round(item.match_score)}%</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (!isAuthenticated || !jobSeeker) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <EmptyState
          icon={<FileText color={Colors.textMuted} size={40} strokeWidth={1.5} />}
          title="Sign in to see your applications"
          description="Track all your job applications in one place"
          actionLabel="Sign In"
          onAction={() => router.push('/(auth)' as any)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Applications</Text>
        {!loading && (
          <Text style={styles.count}>
            {applications.length} {applications.length === 1 ? 'application' : 'applications'}
          </Text>
        )}
      </View>

      {/* Filter chips */}
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
            />
          )}
        />
      </View>

      {/* List */}
      <FlatList
        data={applications}
        renderItem={renderItem}
        keyExtractor={i => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListHeaderComponent={loading ? (
          <View>{[1,2,3].map(k => <JobCardSkeleton key={k} />)}</View>
        ) : null}
        ListEmptyComponent={!loading ? (
          <EmptyState
            icon={<Briefcase color={Colors.textMuted} size={40} strokeWidth={1.5} />}
            title={selectedStatus === 'all' ? 'No applications yet' : `No ${selectedStatus} applications`}
            description={selectedStatus === 'all' ? "Apply for jobs and track them here" : "Try a different filter"}
            actionLabel={selectedStatus === 'all' ? 'Browse Jobs' : undefined}
            onAction={selectedStatus === 'all' ? () => router.push('/(job-seeker)/jobs') : undefined}
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

  filterWrap: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing[1],
  },
  filterList: {
    paddingHorizontal: Space.pagePadding,
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },

  list: {
    padding: Space.pagePadding,
    paddingTop: Spacing[3],
    paddingBottom: Space.listBottom,
  },

  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Space.cardPadding,
    marginBottom: Space.cardGap,
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
  info:    { flex: 1, gap: Spacing[0.5] },
  jobTitle:{ ...Typography.h5, color: Colors.textPrimary },
  company: { ...Typography.bodySm, color: Colors.textSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[1], marginTop: Spacing[0.5] },
  metaText:{ ...Typography.caption, color: Colors.textMuted },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  dateRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing[1.5] },
  dateText: { ...Typography.caption, color: Colors.textSecondary },

  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2.5],
  },
  matchLabel: { ...Typography.label, color: Colors.textSecondary },
  matchValue: { ...Typography.h4, color: Colors.primary },
});
