import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Image, FlatList, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell, Search, ChevronRight, MapPin, Briefcase, Clock,
  TrendingUp, Star, Building2, Bookmark, Zap,
} from 'lucide-react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
} from 'react-native-reanimated';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Job, JobCategory } from '@/types/database';
import { JobCardSkeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Colors, Typography, Spacing, Radius, Palette, Space } from '@/constants/theme';
import { formatTimeAgo, formatSalary, getGreeting } from '@/utils/formatters';

const { width: SCREEN_W } = Dimensions.get('window');

interface JobWithMatch extends Job {
  match_score?: number;
  employer?: any;
  category?: any;
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, onPress, showMatch }: { job: JobWithMatch; onPress: () => void; showMatch?: boolean }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={style}>
      <TouchableOpacity
        style={styles.jobCard}
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 20 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 20 }); }}
        activeOpacity={1}
      >
        <View style={styles.jobCardHeader}>
          <View style={styles.companyLogo}>
            {job.employer?.company_logo_url
              ? <Image source={{ uri: job.employer.company_logo_url }} style={styles.logoImg} />
              : <Building2 color={Colors.textMuted} size={22} strokeWidth={1.8} />}
          </View>
          <View style={styles.jobInfo}>
            <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
            <Text style={styles.jobCompany} numberOfLines={1}>{job.employer?.company_name || '—'}</Text>
            {(job.salary_min || job.salary_max) && (
              <Text style={styles.jobSalary}>
                {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
              </Text>
            )}
          </View>
          {showMatch && job.match_score != null && (
            <View style={styles.matchBadge}>
              <Text style={styles.matchPct}>{Math.round(job.match_score)}%</Text>
              <Text style={styles.matchLbl}>Match</Text>
            </View>
          )}
        </View>

        <View style={styles.jobMeta}>
          <View style={styles.metaChip}>
            <MapPin color={Colors.textMuted} size={11} strokeWidth={2} />
            <Text style={styles.metaText}>{job.city || 'Remote'}</Text>
          </View>
          <View style={styles.metaChip}>
            <Briefcase color={Colors.textMuted} size={11} strokeWidth={2} />
            <Text style={styles.metaText}>{job.employment_type?.replace(/_/g, ' ')}</Text>
          </View>
          <View style={styles.metaChip}>
            <Clock color={Colors.textMuted} size={11} strokeWidth={2} />
            <Text style={styles.metaText}>{formatTimeAgo(job.created_at)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Category Pill ─────────────────────────────────────────────────────────────
function CategoryPill({ category, onPress }: { category: JobCategory; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.catPill} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.catIcon}>
        <Briefcase color={Colors.primary} size={18} strokeWidth={2} />
      </View>
      <Text style={styles.catName} numberOfLines={2}>{category.name}</Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function JobSeekerHomeScreen() {
  const router = useRouter();
  const { jobSeeker } = useAuthStore();
  const [categories,    setCategories]    = useState<JobCategory[]>([]);
  const [recommended,   setRecommended]   = useState<JobWithMatch[]>([]);
  const [recent,        setRecent]        = useState<Job[]>([]);
  const [stats,         setStats]         = useState({ applications: 0, matches: 0, saved: 0 });
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [catRes, recentRes] = await Promise.all([
        supabase.from('job_categories').select('*').limit(8),
        supabase.from('jobs')
          .select('*, employer:employers(company_name, company_logo_url), category:job_categories(name)')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);
      if (catRes.data)    setCategories(catRes.data as JobCategory[]);
      if (recentRes.data) setRecent(recentRes.data as Job[]);

      if (jobSeeker?.id) {
        const [matchRes, appCnt, matchCnt, savedCnt] = await Promise.all([
          supabase.from('job_matches')
            .select('match_score, job:jobs(*, employer:employers(company_name, company_logo_url), category:job_categories(name))')
            .eq('job_seeker_id', jobSeeker.id)
            .order('match_score', { ascending: false })
            .limit(5),
          supabase.from('applications').select('id', { count: 'exact', head: true }).eq('job_seeker_id', jobSeeker.id),
          supabase.from('job_matches').select('id', { count: 'exact', head: true }).eq('job_seeker_id', jobSeeker.id),
          supabase.from('saved_jobs').select('id', { count: 'exact', head: true }).eq('job_seeker_id', jobSeeker.id),
        ]);

        if (matchRes.data && matchRes.data.length > 0) {
          const withScores: JobWithMatch[] = matchRes.data.map((m: any) => ({
            ...(Array.isArray(m.job) ? m.job[0] : m.job),
            match_score: m.match_score,
          })).filter(Boolean);
          setRecommended(withScores);
        } else if (recentRes.data) {
          setRecommended(recentRes.data.slice(0, 5) as JobWithMatch[]);
        }

        setStats({
          applications: appCnt.count ?? 0,
          matches:      matchCnt.count ?? 0,
          saved:        savedCnt.count ?? 0,
        });
      }
    } catch (e) {
      console.error('Home fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [jobSeeker?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const profilePct = jobSeeker?.profile_completion_score ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* ── Top Bar ─────────────────────────────────────────── */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.userName}>{jobSeeker?.full_name || 'Job Seeker'}</Text>
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/(job-seeker)/applications')}
          >
            <Bell color={Colors.textPrimary} size={22} strokeWidth={2} />
            {stats.applications > 0 && <View style={styles.bellDot} />}
          </TouchableOpacity>
        </View>

        {/* ── Search Bar ──────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(job-seeker)/jobs')}
          activeOpacity={0.85}
        >
          <Search color={Colors.textMuted} size={18} strokeWidth={2.5} />
          <Text style={styles.searchPlaceholder}>Search jobs, companies…</Text>
          <View style={styles.searchFilter}>
            <MapPin color={Colors.primary} size={16} strokeWidth={2} />
          </View>
        </TouchableOpacity>

        {/* ── Stats Card ──────────────────────────────────────── */}
        <View style={styles.statsSection}>
          <LinearGradient
            colors={['#1D4ED8', '#2563EB', '#3B82F6']}
            style={styles.statsCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Profile completion */}
            <View style={styles.statsTop}>
              <View>
                <Text style={styles.statsTitle}>Your Job Search</Text>
                <Text style={styles.statsSubtitle}>{profilePct}% profile complete</Text>
              </View>
              {profilePct < 100 && (
                <TouchableOpacity
                  style={styles.completeBtn}
                  onPress={() => router.push('/(job-seeker)/profile')}
                >
                  <Text style={styles.completeBtnText}>Complete</Text>
                  <ChevronRight color={Colors.primary} size={14} strokeWidth={2.5} />
                </TouchableOpacity>
              )}
            </View>

            {/* Progress bar */}
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${profilePct}%` as any }]} />
            </View>

            {/* Counters */}
            <View style={styles.statsRow}>
              {[
                { label: 'Applications', value: stats.applications },
                { label: 'Matches',      value: stats.matches },
                { label: 'Saved',        value: stats.saved },
              ].map((s, i) => (
                <View key={s.label} style={styles.statItem}>
                  {i > 0 && <View style={styles.statDivider} />}
                  <View style={styles.statContent}>
                    <Text style={styles.statValue}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* ── Quick Actions ───────────────────────────────────── */}
        <View style={styles.quickActions}>
          {[
            { label: 'Browse Jobs',  icon: Briefcase, color: Colors.primary,   bg: Colors.primaryLight, path: '/(job-seeker)/jobs' },
            { label: 'Map View',     icon: MapPin,    color: Colors.employer,  bg: Colors.employerLight, path: '/(job-seeker)/map' },
            { label: 'Saved',        icon: Bookmark,  color: '#7C3AED',        bg: '#F3E8FF',            path: '/(job-seeker)/saved' },
            { label: 'Top Matches',  icon: Zap,       color: '#D97706',        bg: '#FEF3C7',            path: '/(job-seeker)/jobs' },
          ].map(({ label, icon: Icon, color, bg, path }) => (
            <TouchableOpacity
              key={label}
              style={styles.quickAction}
              onPress={() => router.push(path as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.quickIcon, { backgroundColor: bg }]}>
                <Icon color={color} size={20} strokeWidth={2} />
              </View>
              <Text style={styles.quickLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Categories ──────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse Categories</Text>
            <TouchableOpacity onPress={() => router.push('/(job-seeker)/jobs')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {categories.map((c) => (
              <CategoryPill
                key={c.id}
                category={c}
                onPress={() => router.push(`/(job-seeker)/jobs?category=${c.id}` as any)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ── Recommended ─────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Star color="#F59E0B" size={16} strokeWidth={2.5} fill="#F59E0B" />
              <Text style={styles.sectionTitle}>Recommended for You</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(job-seeker)/jobs')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <>
              <JobCardSkeleton />
              <JobCardSkeleton />
            </>
          ) : recommended.length > 0 ? (
            recommended.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                showMatch
                onPress={() => router.push(`/(job-seeker)/jobs/${job.id}` as any)}
              />
            ))
          ) : (
            <EmptyState
              compact
              icon={<Star color={Colors.textMuted} size={32} strokeWidth={1.5} />}
              title="No matches yet"
              description="Complete your profile to get personalised job recommendations"
              actionLabel="Complete Profile"
              onAction={() => router.push('/(job-seeker)/profile')}
            />
          )}
        </View>

        {/* ── Recent Jobs ─────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <TrendingUp color={Colors.primary} size={16} strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Recent Jobs</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(job-seeker)/jobs')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <>
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </>
          ) : (
            recent.slice(0, 6).map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onPress={() => router.push(`/(job-seeker)/jobs/${job.id}` as any)}
              />
            ))
          )}
        </View>

        <View style={{ height: Space.tabBarHeight + 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Space.pagePadding,
    paddingTop: Spacing[4],
    paddingBottom: Spacing[3],
  },
  greeting: { ...Typography.label, color: Colors.textMuted },
  userName: { ...Typography.h3, color: Colors.textPrimary, marginTop: 2 },
  bellBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute', top: 9, right: 9,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1.5, borderColor: Colors.bgCard,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    marginHorizontal: Space.pagePadding,
    marginBottom: Spacing[5],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3.5],
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing[3],
  },
  searchPlaceholder: { ...Typography.body, color: Colors.textMuted, flex: 1 },
  searchFilter: {
    width: 34, height: 34, borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },

  // Stats card
  statsSection: { paddingHorizontal: Space.pagePadding, marginBottom: Spacing[6] },
  statsCard: {
    borderRadius: Radius.xl,
    padding: Spacing[5],
    gap: Spacing[4],
  },
  statsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statsTitle:    { ...Typography.h5, color: Palette.white },
  statsSubtitle: { ...Typography.label, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    gap: 2,
  },
  completeBtnText: { ...Typography.label, fontWeight: '700', color: Colors.primary },
  progressBar: {
    height: 5, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Palette.white, borderRadius: 3 },
  statsRow: { flexDirection: 'row' },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.25)', marginRight: Spacing[4] },
  statContent: { flex: 1, alignItems: 'center' },
  statValue: { ...Typography.h3, color: Palette.white },
  statLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  // Quick actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: Space.pagePadding,
    marginBottom: Spacing[6],
    gap: Spacing[3],
  },
  quickAction: { flex: 1, alignItems: 'center', gap: Spacing[2] },
  quickIcon: {
    width: 52, height: 52, borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  quickLabel: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center' },

  // Sections
  section:      { paddingHorizontal: Space.pagePadding, marginBottom: Spacing[6] },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[4] },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  sectionTitle: { ...Typography.h4, color: Colors.textPrimary },
  seeAll:       { ...Typography.label, color: Colors.primary, fontWeight: '600' },

  // Categories
  catScroll: { gap: Spacing[3], paddingRight: Space.pagePadding },
  catPill: {
    alignItems: 'center',
    width: 76,
    gap: Spacing[2],
  },
  catIcon: {
    width: 56, height: 56, borderRadius: Radius.lg,
    backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  catName: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Job cards
  jobCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[3],
  },
  jobCardHeader:{ flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[3] },
  companyLogo: {
    width: 46, height: 46, borderRadius: Radius.md,
    backgroundColor: Colors.bg,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg:     { width: 46, height: 46, borderRadius: Radius.md },
  jobInfo:     { flex: 1, gap: 3 },
  jobTitle:    { ...Typography.h5, color: Colors.textPrimary },
  jobCompany:  { ...Typography.bodySm, color: Colors.textSecondary },
  jobSalary:   { ...Typography.label, color: Colors.employer, fontWeight: '600' },
  matchBadge: {
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1.5],
    minWidth: 52,
  },
  matchPct: { ...Typography.label, fontWeight: '700', color: Colors.primary },
  matchLbl: { fontSize: 10, color: Colors.primary, fontWeight: '600' },
  jobMeta: { flexDirection: 'row', gap: Spacing[2], flexWrap: 'wrap' },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1],
    borderRadius: Radius.full,
  },
  metaText: { ...Typography.caption, color: Colors.textMuted, fontWeight: '500' },
});
