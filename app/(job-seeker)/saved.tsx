import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, Image, RefreshControl, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bookmark, MapPin, Briefcase, ChevronRight, Trash2, Building2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { JobCardSkeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors, Space, Palette } from '@/constants/theme';
import { formatSalary } from '@/utils/formatters';

interface SavedJob {
  id: string;
  created_at: string;
  job: {
    id: string; title: string; city: string | null; country: string | null;
    is_remote: boolean; employment_type: string;
    salary_min: number | null; salary_max: number | null; salary_currency: string;
    employer: { company_name: string; company_logo_url: string | null };
  };
}

export default function SavedJobsScreen() {
  const router = useRouter();
  const { jobSeeker } = useAuthStore();
  const [savedJobs,  setSavedJobs]  = useState<SavedJob[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    if (!jobSeeker) return;
    const { data } = await supabase
      .from('saved_jobs')
      .select(`id, created_at, job:jobs(
        id, title, city, country, is_remote, employment_type,
        salary_min, salary_max, salary_currency,
        employer:employers(company_name, company_logo_url)
      )`)
      .eq('job_seeker_id', jobSeeker.id)
      .order('created_at', { ascending: false });

    if (data) {
      setSavedJobs(data.map((item: any) => ({
        ...item,
        job: Array.isArray(item.job) ? item.job[0] : item.job,
      })));
    }
    setLoading(false);
    setRefreshing(false);
  }, [jobSeeker?.id]);

  useEffect(() => { fetch(); }, [fetch]);
  const onRefresh = () => { setRefreshing(true); fetch(); };

  const remove = (id: string, title: string) => {
    Alert.alert('Remove', `Remove "${title}" from saved jobs?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          await supabase.from('saved_jobs').delete().eq('id', id);
          setSavedJobs(p => p.filter(j => j.id !== id));
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: SavedJob }) => {
    const { job } = item;
    const loc = job.is_remote
      ? 'Remote'
      : [job.city, job.country].filter(Boolean).join(', ') || 'Location TBD';

    return (
      <TouchableOpacity
        style={s.card}
        onPress={() => router.push(`/(job-seeker)/jobs/${job.id}` as any)}
        activeOpacity={0.88}
      >
        {/* Logo */}
        <View style={s.logo}>
          {job.employer?.company_logo_url
            ? <Image source={{ uri: job.employer.company_logo_url }} style={s.logoImg} />
            : <Building2 color={Colors.primary} size={20} strokeWidth={1.8} />}
        </View>

        {/* Content */}
        <View style={s.content}>
          <Text style={s.title} numberOfLines={1}>{job.title}</Text>
          <Text style={s.company} numberOfLines={1}>{job.employer?.company_name}</Text>
          <View style={s.tags}>
            <View style={s.tag}>
              <MapPin color="#94A3B8" size={10} strokeWidth={2.5} />
              <Text style={s.tagText}>{loc}</Text>
            </View>
            <View style={s.tag}>
              <Briefcase color="#94A3B8" size={10} strokeWidth={2.5} />
              <Text style={s.tagText}>{job.employment_type.replace(/_/g, ' ')}</Text>
            </View>
          </View>
          {(job.salary_min || job.salary_max) && (
            <Text style={s.salary}>{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</Text>
          )}
        </View>

        {/* Actions */}
        <View style={s.actions}>
          <TouchableOpacity
            style={s.removeBtn}
            onPress={() => remove(item.id, job.title)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 color="#EF4444" size={16} strokeWidth={2} />
          </TouchableOpacity>
          <ChevronRight color="#CBD5E1" size={18} strokeWidth={2} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.heading}>Saved Jobs</Text>
          {!loading && (
            <Text style={s.count}>
              {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved
            </Text>
          )}
        </View>
        {!loading && savedJobs.length > 0 && (
          <View style={s.headerBadge}>
            <Bookmark color={Colors.primary} size={14} strokeWidth={2.5} fill={Colors.primary} />
            <Text style={s.headerBadgeText}>{savedJobs.length}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={savedJobs}
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
            icon={<Bookmark color={Colors.textMuted} size={40} strokeWidth={1.5} />}
            title="No saved jobs yet"
            description="Tap the bookmark icon on any job listing to save it for later"
            actionLabel="Browse Jobs"
            onAction={() => router.push('/(job-seeker)/jobs')}
          />
        ) : null}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: Palette.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  heading: { fontSize: 26, fontWeight: '800', color: '#0F172A', letterSpacing: -0.4 },
  count:   { fontSize: 13, color: '#94A3B8', marginTop: 3 },
  headerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20,
  },
  headerBadgeText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  list: { padding: 20, paddingBottom: Space.tabBarHeight + 24 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderRadius: 14,
    marginBottom: 10,
    padding: 14,
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
    backgroundColor: Colors.primaryLight,
    borderWidth: 1, borderColor: '#DBEAFE',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  logoImg: { width: 46, height: 46 },
  content: { flex: 1, gap: 3 },
  title:   { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  company: { fontSize: 13, color: '#64748B' },
  tags:    { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#F8FAFC',
    borderWidth: 1, borderColor: '#E2E8F0',
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 20,
  },
  tagText:  { fontSize: 11, color: '#64748B', fontWeight: '500' },
  salary:   { fontSize: 12, color: '#15803D', fontWeight: '600', marginTop: 3 },
  actions:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  removeBtn:{
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#FFF1F2',
    alignItems: 'center', justifyContent: 'center',
  },
});
