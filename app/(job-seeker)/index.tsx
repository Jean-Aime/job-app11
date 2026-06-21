import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell, Search, ChevronRight, MapPin, Briefcase, Clock,
  TrendingUp, Star, Building2, Bookmark, Zap,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Job, JobCategory } from '@/types/database';
import { JobCardSkeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors, Typography, Spacing, Radius, Palette, Space } from '@/constants/theme';
import { formatTimeAgo, formatSalary, getGreeting } from '@/utils/formatters';
import { wp, hp, fontSize, spacing, isSmall, isTablet } from '@/utils/responsive';

const { width: SW } = Dimensions.get('window');

interface JobWithMatch extends Job { match_score?: number; employer?: any; category?: any }

// ─── Premium Job Card ─────────────────────────────────────────────────────────
function JobCard({
  job, onPress, showMatch,
}: { job: JobWithMatch; onPress: () => void; showMatch?: boolean }) {
  return (
    <TouchableOpacity
      style={card.wrap}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Top row */}
      <View style={card.top}>
        {/* Logo */}
        <View style={card.logo}>
          {job.employer?.company_logo_url
            ? <Image source={{ uri: job.employer.company_logo_url }} style={card.logoImg} />
            : (
              <LinearGradient
                colors={[Colors.primaryLight, Colors.primaryMid]}
                style={card.logoFallback}
              >
                <Building2 color={Colors.primary} size={18} strokeWidth={2} />
              </LinearGradient>
            )}
        </View>

        {/* Info */}
        <View style={card.info}>
          <Text style={card.title} numberOfLines={1}>{job.title}</Text>
          <Text style={card.company} numberOfLines={1}>{job.employer?.company_name || '—'}</Text>
        </View>

        {/* Match badge */}
        {showMatch && job.match_score != null && (
          <View style={card.matchBadge}>
            <Text style={card.matchPct}>{Math.round(job.match_score)}%</Text>
            <Text style={card.matchLbl}>match</Text>
          </View>
        )}
      </View>

      {/* Divider */}
      <View style={card.divider} />

      {/* Bottom row */}
      <View style={card.bottom}>
        <View style={card.chip}>
          <MapPin color={Colors.textMuted} size={10} strokeWidth={2.5} />
          <Text style={card.chipText}>{job.city || 'Remote'}</Text>
        </View>
        <View style={card.chip}>
          <Briefcase color={Colors.textMuted} size={10} strokeWidth={2.5} />
          <Text style={card.chipText}>{job.employment_type?.replace(/_/g, ' ')}</Text>
        </View>
        {(job.salary_min || job.salary_max) && (
          <View style={[card.chip, card.chipSalary]}>
            <Text style={card.salaryText}>
              {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
            </Text>
          </View>
        )}
        <View style={card.chipRight}>
          <Clock color={Colors.textMuted} size={10} strokeWidth={2.5} />
          <Text style={card.chipText}>{formatTimeAgo(job.created_at)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Category Pill ─────────────────────────────────────────────────────────────
function CategoryPill({ category, onPress }: { category: JobCategory; onPress: () => void }) {
  return (
    <TouchableOpacity style={catStyle.wrap} onPress={onPress} activeOpacity={0.75}>
      <View style={catStyle.icon}>
        <Briefcase color={Colors.primary} size={17} strokeWidth={2} />
      </View>
      <Text style={catStyle.name} numberOfLines={2}>{category.name}</Text>
    </TouchableOpacity>
  );
}

// ─── Quick Action Button ───────────────────────────────────────────────────────
function QuickAction({
  label, icon: Icon, color, bg, onPress,
}: { label: string; icon: any; color: string; bg: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={qa.wrap} onPress={onPress} activeOpacity={0.75}>
      <View style={[qa.icon, { backgroundColor: bg }]}>
        <Icon color={color} size={19} strokeWidth={2} />
      </View>
      <Text style={qa.label}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function JobSeekerHomeScreen() {
  const router = useRouter();
  const { jobSeeker } = useAuthStore();
  const [categories,  setCategories]  = useState<JobCategory[]>([]);
  const [recommended, setRecommended] = useState<JobWithMatch[]>([]);
  const [recent,      setRecent]      = useState<Job[]>([]);
  const [stats,       setStats]       = useState({ applications: 0, matches: 0, saved: 0 });
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [catRes, recentRes] = await Promise.all([
        supabase.from('job_categories').select('*').limit(8),
        supabase
          .from('jobs')
          .select('*, employer:employers(company_name, company_logo_url), category:job_categories(name)')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      if (catRes.data)    setCategories(catRes.data as JobCategory[]);
      if (recentRes.data) setRecent(recentRes.data as Job[]);

      if (jobSeeker?.id) {
        const [matchRes, appCnt, matchCnt, savedCnt] = await Promise.all([
          supabase
            .from('job_matches')
            .select('match_score, job:jobs(*, employer:employers(company_name, company_logo_url), category:job_categories(name))')
            .eq('job_seeker_id', jobSeeker.id)
            .order('match_score', { ascending: false })
            .limit(5),
          supabase.from('applications').select('id', { count: 'exact', head: true }).eq('job_seeker_id', jobSeeker.id),
          supabase.from('job_matches').select('id', { count: 'exact', head: true }).eq('job_seeker_id', jobSeeker.id),
          supabase.from('saved_jobs').select('id', { count: 'exact', head: true }).eq('job_seeker_id', jobSeeker.id),
        ]);

        if (matchRes.data?.length) {
          setRecommended(
            matchRes.data.map((m: any) => ({
              ...(Array.isArray(m.job) ? m.job[0] : m.job),
              match_score: m.match_score,
            })).filter(Boolean)
          );
        } else if (recentRes.data) {
          setRecommended(recentRes.data.slice(0, 5) as JobWithMatch[]);
        }

        setStats({
          applications: appCnt.count   ?? 0,
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

  const pct = jobSeeker?.profile_completion_score ?? 0;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* ───── Header ───── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.greeting}>{getGreeting()} 👋</Text>
            <Text style={s.userName} numberOfLines={1}>
              {jobSeeker?.full_name || 'Job Seeker'}
            </Text>
          </View>
          <TouchableOpacity
            style={s.bellWrap}
            onPress={() => router.push('/(job-seeker)/applications')}
            activeOpacity={0.8}
          >
            <Bell color={Colors.textPrimary} size={20} strokeWidth={2} />
            {stats.applications > 0 && <View style={s.bellDot} />}
          </TouchableOpacity>
        </View>

        {/* ───── Search Bar ───── */}
        <TouchableOpacity
          style={s.searchBar}
          onPress={() => router.push('/(job-seeker)/jobs')}
          activeOpacity={0.88}
        >
          <View style={s.searchLeft}>
            <Search color={Colors.textMuted} size={17} strokeWidth={2.5} />
            <Text style={s.searchText}>Search jobs, companies…</Text>
          </View>
          <View style={s.searchBtn}>
            <MapPin color={Palette.white} size={15} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>

        {/* ───── Stats Card ───── */}
        <View style={s.statsWrap}>
          <LinearGradient
            colors={['#1E3A8A', '#1D4ED8', '#2563EB']}
            style={s.statsCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Decorative circles */}
            <View style={s.deco1} />
            <View style={s.deco2} />

            {/* Top row */}
            <View style={s.statsTop}>
              <View style={s.statsLeft}>
                <Text style={s.statsTitle}>Your Dashboard</Text>
                <Text style={s.statsSubtitle}>{pct}% profile complete</Text>
              </View>
              {pct < 100 && (
                <TouchableOpacity
                  style={s.statsBtn}
                  onPress={() => router.push('/(job-seeker)/profile')}
                >
                  <Text style={s.statsBtnText}>Complete</Text>
                  <ChevronRight color={Colors.primary} size={13} strokeWidth={3} />
                </TouchableOpacity>
              )}
            </View>

            {/* Progress bar */}
            <View style={s.progTrack}>
              <View style={[s.progFill, { width: `${pct}%` as any }]} />
            </View>

            {/* Stats row */}
            <View style={s.statsRow}>
              {[
                { label: 'Applied', value: stats.applications },
                { label: 'Matches', value: stats.matches },
                { label: 'Saved',   value: stats.saved },
              ].map((st, i) => (
                <View key={st.label} style={s.statCell}>
                  {i > 0 && <View style={s.statSep} />}
                  <Text style={s.statVal}>{st.value}</Text>
                  <Text style={s.statLbl}>{st.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* ───── Quick Actions ───── */}
        <View style={s.qaRow}>
          {[
            { label: 'Find Jobs', icon: Briefcase, color: Colors.primary,  bg: Colors.primaryLight, path: '/(job-seeker)/jobs' },
            { label: 'Near Me',   icon: MapPin,    color: '#059669',        bg: '#ECFDF5',            path: '/(job-seeker)/map' },
            { label: 'Saved',     icon: Bookmark,  color: '#7C3AED',        bg: '#F3E8FF',            path: '/(job-seeker)/saved' },
            { label: 'Matches',   icon: Zap,       color: '#D97706',        bg: '#FFFBEB',            path: '/(job-seeker)/jobs' },
          ].map(a => (
            <QuickAction key={a.label} {...a} onPress={() => router.push(a.path as any)} />
          ))}
        </View>

        {/* ───── Categories ───── */}
        {categories.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>Categories</Text>
              <TouchableOpacity onPress={() => router.push('/(job-seeker)/jobs')}>
                <Text style={s.seeAll}>All →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.catScroll}
            >
              {categories.map(c => (
                <CategoryPill
                  key={c.id}
                  category={c}
                  onPress={() => router.push(`/(job-seeker)/jobs?category=${c.id}` as any)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ───── Recommended ───── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <View style={s.sectionTitleRow}>
              <Star color="#F59E0B" size={15} strokeWidth={2.5} fill="#F59E0B" />
              <Text style={s.sectionTitle}>Recommended</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(job-seeker)/jobs')}>
              <Text style={s.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            [1, 2].map(k => <JobCardSkeleton key={k} />)
          ) : recommended.length > 0 ? (
            recommended.map(job => (
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
              description="Complete your profile to get personalised recommendations"
              actionLabel="Complete Profile"
              onAction={() => router.push('/(job-seeker)/profile')}
            />
          )}
        </View>

        {/* ───── Recent Jobs ───── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <View style={s.sectionTitleRow}>
              <TrendingUp color={Colors.primary} size={15} strokeWidth={2.5} />
              <Text style={s.sectionTitle}>Recent Jobs</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(job-seeker)/jobs')}>
              <Text style={s.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          {loading
            ? [1, 2, 3].map(k => <JobCardSkeleton key={k} />)
            : recent.slice(0, 6).map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onPress={() => router.push(`/(job-seeker)/jobs/${job.id}` as any)}
                />
              ))}
        </View>

        {/* Bottom space for tab bar */}
        <View style={{ height: Space.tabBarHeight + 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Card Sub-Styles ──────────────────────────────────────────────────────────
const card = StyleSheet.create({
  wrap: {
    backgroundColor: Palette.white,
    borderRadius: isTablet ? 18 : 16,
    marginBottom: spacing(12),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
      default: { boxShadow: '0px 2px 8px rgba(15,23,42,0.06)' },
    }),
  },
  top:    { flexDirection: 'row', alignItems: 'center', padding: spacing(14), paddingBottom: spacing(10), gap: spacing(12) },
  logo:   { width: isSmall ? 40 : 44, height: isSmall ? 40 : 44, borderRadius: 10, overflow: 'hidden' },
  logoImg:{ width: isSmall ? 40 : 44, height: isSmall ? 40 : 44 },
  logoFallback: { width: isSmall ? 40 : 44, height: isSmall ? 40 : 44, alignItems: 'center', justifyContent: 'center' },
  info:   { flex: 1 },
  title:  { fontSize: fontSize(15), fontWeight: '600', color: '#0F172A', marginBottom: 2 },
  company:{ fontSize: fontSize(13), color: '#64748B' },

  matchBadge: {
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: isSmall ? 6 : 8,
    paddingVertical: isSmall ? 4 : 5,
    minWidth: isSmall ? 45 : 50,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  matchPct: { fontSize: fontSize(14), fontWeight: '700', color: '#2563EB' },
  matchLbl: { fontSize: fontSize(9), color: '#2563EB', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },

  divider:{ height: 1, backgroundColor: '#F8FAFC', marginHorizontal: spacing(14) },
  bottom: { flexDirection: 'row', alignItems: 'center', padding: spacing(10), paddingHorizontal: spacing(14), gap: spacing(6), flexWrap: 'wrap' },

  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: isSmall ? 6 : 8, paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  chipSalary: { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' },
  chipText:  { fontSize: fontSize(11), color: '#94A3B8', fontWeight: '500' },
  salaryText:{ fontSize: fontSize(11), color: '#15803D', fontWeight: '600' },
  chipRight: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    marginLeft: 'auto',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: isSmall ? 6 : 8, paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
});

// ─── Category Sub-Styles ──────────────────────────────────────────────────────
const catStyle = StyleSheet.create({
  wrap: { alignItems: 'center', width: 72, gap: 6 },
  icon: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: Palette.white,
    borderWidth: 1, borderColor: '#E2E8F0',
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios:     { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 1 },
      default: { boxShadow: '0px 1px 4px rgba(15,23,42,0.05)' },
    }),
  },
  name: { fontSize: 11, color: '#475569', fontWeight: '600', textAlign: 'center', lineHeight: 14 },
});

// ─── Quick Action Sub-Styles ──────────────────────────────────────────────────
const qa = StyleSheet.create({
  wrap:  { flex: 1, alignItems: 'center', gap: 7 },
  icon:  {
    width: 50, height: 50, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios:     { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6 },
      android: { elevation: 2 },
      default: { boxShadow: '0px 2px 6px rgba(15,23,42,0.07)' },
    }),
  },
  label: { fontSize: 11, color: '#475569', fontWeight: '600', textAlign: 'center' },
});

// ─── Screen Styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: { flex: 1, marginRight: 12 },
  greeting:   { fontSize: 13, color: '#94A3B8', fontWeight: '500', marginBottom: 2 },
  userName:   { fontSize: 22, fontWeight: '700', color: '#0F172A', letterSpacing: -0.3 },
  bellWrap: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Palette.white,
    borderWidth: 1, borderColor: '#E2E8F0',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
    ...Platform.select({
      ios:     { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 1 },
      default: { boxShadow: '0px 1px 4px rgba(15,23,42,0.05)' },
    }),
  },
  bellDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5, borderColor: Palette.white,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.white,
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios:     { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
      default: { boxShadow: '0px 2px 8px rgba(15,23,42,0.06)' },
    }),
  },
  searchLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, paddingVertical: 8 },
  searchText: { fontSize: 14, color: '#94A3B8', fontWeight: '400' },
  searchBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },

  // Stats card
  statsWrap: { paddingHorizontal: 20, marginBottom: 20 },
  statsCard: {
    borderRadius: 20,
    padding: 20,
    gap: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  deco1: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -40, right: -30,
  },
  deco2: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -20, left: -20,
  },
  statsTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statsLeft:    { gap: 3 },
  statsTitle:   { fontSize: 17, fontWeight: '700', color: Palette.white },
  statsSubtitle:{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
  statsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Palette.white,
    borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  statsBtnText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  progTrack: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
  progFill:  { height: '100%', backgroundColor: Palette.white, borderRadius: 2 },
  statsRow:  { flexDirection: 'row' },
  statCell:  { flex: 1, flexDirection: 'row', alignItems: 'center' },
  statSep:   { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)', marginRight: 16 },
  statVal:   { flex: 1, fontSize: 24, fontWeight: '700', color: Palette.white, textAlign: 'center' },
  statLbl:   { fontSize: 11, color: 'rgba(255,255,255,0.65)', textAlign: 'center', marginTop: 1 },

  // Quick actions
  qaRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },

  // Sections
  section:       { paddingHorizontal: 20, marginBottom: 24 },
  sectionHead:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitleRow:{ flexDirection: 'row', alignItems: 'center', gap: 7 },
  sectionTitle:  { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  seeAll:        { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  // Category scroll
  catScroll: { gap: 12, paddingRight: 20 },
});
