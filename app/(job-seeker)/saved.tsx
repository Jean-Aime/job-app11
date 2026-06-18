import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, Image, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bookmark, MapPin, Briefcase, ChevronRight, Trash2, Building2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { JobCardSkeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Colors, Typography, Spacing, Radius, Space, G, Palette,
} from '@/constants/theme';
import { formatSalary } from '@/utils/formatters';

interface SavedJob {
  id: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    city: string | null;
    country: string | null;
    is_remote: boolean;
    employment_type: string;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string;
    employer: { company_name: string; company_logo_url: string | null };
  };
}

export default function SavedJobsScreen() {
  const router = useRouter();
  const { jobSeeker } = useAuthStore();
  const [savedJobs,  setSavedJobs]  = useState<SavedJob[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSavedJobs = useCallback(async () => {
    if (!jobSeeker) return;
    const { data, error } = await supabase
      .from('saved_jobs')
      .select(`id, created_at, job:jobs(
        id, title, city, country, is_remote,
        employment_type, salary_min, salary_max, salary_currency,
        employer:employers(company_name, company_logo_url)
      )`)
      .eq('job_seeker_id', jobSeeker.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSavedJobs(data.map((item: any) => ({
        ...item,
        job: Array.isArray(item.job) ? item.job[0] : item.job,
      })));
    }
    setLoading(false);
    setRefreshing(false);
  }, [jobSeeker?.id]);

  useEffect(() => { fetchSavedJobs(); }, [fetchSavedJobs]);

  const onRefresh = () => { setRefreshing(true); fetchSavedJobs(); };

  const removeSavedJob = (id: string, title: string) => {
    Alert.alert('Remove', `Remove "${title}" from saved?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          await supabase.from('saved_jobs').delete().eq('id', id);
          setSavedJobs(prev => prev.filter(j => j.id !== id));
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: SavedJob }) => {
    const { job } = item;
    const location = job.is_remote
      ? 'Remote'
      : [job.city, job.country].filter(Boolean).join(', ') || 'Location TBD';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(job-seeker)/jobs/${job.id}` as any)}
        activeOpacity={0.85}
      >
        <View style={styles.cardInner}>
          {/* Logo */}
          <View style={styles.logo}>
            {job.employer?.company_logo_url
              ? <Image source={{ uri: job.employer.company_logo_url }} style={styles.logoImg} />
              : <Building2 color={Colors.primary} size={20} strokeWidth={1.8} />}
          </View>

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>{job.title}</Text>
            <Text style={styles.company} numberOfLines={1}>{job.employer?.company_name}</Text>
            <View style={styles.meta}>
              <View style={styles.metaItem}>
                <MapPin color={Colors.textMuted} size={11} strokeWidth={2} />
                <Text style={styles.metaText}>{location}</Text>
              </View>
              <View style={styles.metaItem}>
                <Briefcase color={Colors.textMuted} size={11} strokeWidth={2} />
                <Text style={styles.metaText}>{job.employment_type.replace(/_/g, ' ')}</Text>
              </View>
            </View>
            {(job.salary_min || job.salary_max) && (
              <Text style={styles.salary}>
                {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
              </Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeSavedJob(item.id, job.title)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Trash2 color={Colors.error} size={17} strokeWidth={2} />
            </TouchableOpacity>
            <ChevronRight color={Colors.textMuted} size={18} strokeWidth={2} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Saved Jobs</Text>
        {!loading && savedJobs.length > 0 && (
          <Text style={styles.count}>{savedJobs.length} saved</Text>
        )}
      </View>

      <FlatList
        data={savedJobs}
        renderItem={renderItem}
        keyExtractor={i => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListHeaderComponent={loading ? (
          <View>
            {[1,2,3].map(k => <JobCardSkeleton key={k} />)}
          </View>
        ) : null}
        ListEmptyComponent={!loading ? (
          <EmptyState
            icon={<Bookmark color={Colors.textMuted} size={40} strokeWidth={1.5} />}
            title="No Saved Jobs"
            description="Tap the bookmark icon on any job to save it for later"
            actionLabel="Browse Jobs"
            onAction={() => router.push('/(job-seeker)/jobs')}
          />
        ) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { ...G.screen },

  header: {
    ...G.rowBetween,
    paddingHorizontal: Space.pagePadding,
    paddingTop: Space.pageTop,
    paddingBottom: Spacing[4],
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  heading: { ...Typography.h2, color: Colors.textPrimary },
  count:   { ...Typography.label, color: Colors.textSecondary },

  list: {
    padding: Space.pagePadding,
    paddingBottom: Space.listBottom,
  },

  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    marginBottom: Space.cardGap,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Space.cardPadding,
    gap: Spacing[3],
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg:  { width: 48, height: 48 },
  info:     { flex: 1, gap: Spacing[1] },
  title:    { ...Typography.h5, color: Colors.textPrimary },
  company:  { ...Typography.bodySm, color: Colors.textSecondary },
  meta:     { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2.5], marginTop: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { ...Typography.caption, color: Colors.textMuted },
  salary:   { ...Typography.label, color: Colors.employer, fontWeight: '600', marginTop: 2 },

  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing[1] },
  removeBtn: {
    width: 34, height: 34, borderRadius: Radius.sm,
    backgroundColor: Colors.errorLight,
    alignItems: 'center', justifyContent: 'center',
  },
});
