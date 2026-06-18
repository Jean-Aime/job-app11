import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Briefcase, Users, FileCheck, Bell, Plus, ChevronRight,
  TrendingUp, Clock, Eye, Building2, CheckCircle, AlertCircle,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { JobCardSkeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors, Typography, Spacing, Radius, Palette, Space, StatusConfig } from '@/constants/theme';
import { formatDate } from '@/utils/formatters';

export default function EmployerDashboardScreen() {
  const router = useRouter();
  const { employer } = useAuthStore();

  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [stats,        setStats]        = useState({ active: 0, total: 0, pending: 0, shortlisted: 0 });
  const [recentApps,   setRecentApps]   = useState<any[]>([]);
  const [activeJobs,   setActiveJobs]   = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    if (!employer) return;
    try {
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title, city, status, view_count, created_at')
        .eq('employer_id', employer.id)
        .order('created_at', { ascending: false });

      const jobIds = jobs?.map(j => j.id) || [];
      setActiveJobs(jobs?.filter(j => j.status === 'active').slice(0, 4) || []);

      if (jobIds.length > 0) {
        const { data: apps } = await supabase
          .from('applications')
          .select('id, status, created_at, job:jobs(id, title), job_seeker:job_seekers(id, full_name, profile_photo_url, current_occupation)')
          .in('job_id', jobIds)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentApps(apps || []);

        const all = apps || [];
        setStats({
          active:      jobs?.filter(j => j.status === 'active').length || 0,
          total:       all.length,
          pending:     all.filter((a: any) => a.status === 'pending').length,
          shortlisted: all.filter((a: any) => a.status === 'shortlisted').length,
        });
      } else {
        setStats({ active: jobs?.filter(j => j.status === 'active').length || 0, total: 0, pending: 0, shortlisted: 0 });
      }
    } catch (e) {
      console.error('Dashboard error:', e);
    } finally {
      setLoading(false);
    }
  }, [employer?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.employer} />}
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.companyName}>{employer?.company_name || 'Your Company'}</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push('/(employer)/notifications')}
          >
            <Bell color={Colors.textPrimary} size={22} strokeWidth={2} />
            {stats.pending > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {stats.pending > 9 ? '9+' : stats.pending}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Hero Banner ─────────────────────────────────────── */}
        <LinearGradient
          colors={['#065F46', '#047857', '#059669']}
          style={styles.heroBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <View>
              <Text style={styles.heroTitle}>Hiring Dashboard</Text>
              <Text style={styles.heroSubtitle}>
                {stats.pending > 0
                  ? `${stats.pending} applications need review`
                  : 'All applications reviewed'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.postJobBtn}
              onPress={() => router.push('/(employer)/jobs/new')}
            >
              <Plus color={Colors.employer} size={18} strokeWidth={2.5} />
              <Text style={styles.postJobText}>Post Job</Text>
            </TouchableOpacity>
          </View>

          {/* Stats row */}
          <View style={styles.heroStats}>
            {[
              { label: 'Active Jobs',   value: stats.active },
              { label: 'Applications', value: stats.total },
              { label: 'Shortlisted',  value: stats.shortlisted },
            ].map((s, i) => (
              <View key={s.label} style={styles.heroStat}>
                {i > 0 && <View style={styles.heroStatDivider} />}
                <View style={styles.heroStatContent}>
                  <Text style={styles.heroStatValue}>{s.value}</Text>
                  <Text style={styles.heroStatLabel}>{s.label}</Text>
                </View>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* ── Quick Actions ───────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickGrid}>
            {[
              { label: 'Post New Job',    icon: Plus,       color: Colors.employer, bg: Colors.employerLight, path: '/(employer)/jobs/new' },
              { label: 'View Candidates', icon: Users,      color: Colors.primary,  bg: Colors.primaryLight,  path: '/(employer)/candidates' },
              { label: 'My Jobs',         icon: Briefcase,  color: '#7C3AED',       bg: '#F3E8FF',            path: '/(employer)/jobs' },
              { label: 'Company Profile', icon: Building2,  color: '#D97706',       bg: '#FEF3C7',            path: '/(employer)/profile' },
            ].map(({ label, icon: Icon, color, bg, path }) => (
              <TouchableOpacity
                key={label}
                style={styles.quickCard}
                onPress={() => router.push(path as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.quickIcon, { backgroundColor: bg }]}>
                  <Icon color={color} size={22} strokeWidth={2} />
                </View>
                <Text style={styles.quickLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Recent Applications ─────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Applications</Text>
            <TouchableOpacity onPress={() => router.push('/(employer)/candidates')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <JobCardSkeleton />
          ) : recentApps.length > 0 ? (
            recentApps.map((app: any) => {
              const sc = StatusConfig[app.status] || StatusConfig.pending;
              return (
                <TouchableOpacity
                  key={app.id}
                  style={styles.appCard}
                  onPress={() => router.push(`/(employer)/candidates/${app.id}` as any)}
                  activeOpacity={0.85}
                >
                  <Avatar
                    uri={app.job_seeker?.profile_photo_url}
                    name={app.job_seeker?.full_name}
                    size="md"
                    color={Colors.employer}
                  />
                  <View style={styles.appInfo}>
                    <Text style={styles.appName}>{app.job_seeker?.full_name}</Text>
                    <Text style={styles.appJob} numberOfLines={1}>{app.job?.title}</Text>
                    <Text style={styles.appTime}>{formatDate(app.created_at)}</Text>
                  </View>
                  <Badge label={sc.label} color={sc.color} bg={sc.bg} dot size="sm" />
                </TouchableOpacity>
              );
            })
          ) : (
            <EmptyState
              compact
              icon={<Users color={Colors.textMuted} size={32} strokeWidth={1.5} />}
              title="No applications yet"
              description="Post a job to start receiving applications"
              actionLabel="Post a Job"
              onAction={() => router.push('/(employer)/jobs/new')}
            />
          )}
        </View>

        {/* ── Active Jobs ─────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Jobs</Text>
            <TouchableOpacity onPress={() => router.push('/(employer)/jobs')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          {activeJobs.length > 0 ? (
            activeJobs.map((job: any) => (
              <TouchableOpacity
                key={job.id}
                style={styles.jobRow}
                onPress={() => router.push(`/(employer)/jobs/${job.id}` as any)}
                activeOpacity={0.85}
              >
                <View style={styles.jobRowIcon}>
                  <Briefcase color={Colors.employer} size={18} strokeWidth={2} />
                </View>
                <View style={styles.jobRowInfo}>
                  <Text style={styles.jobRowTitle} numberOfLines={1}>{job.title}</Text>
                  <Text style={styles.jobRowMeta}>
                    {job.city || 'Remote'} · {job.view_count || 0} views
                  </Text>
                </View>
                <ChevronRight color={Colors.textMuted} size={18} strokeWidth={2} />
              </TouchableOpacity>
            ))
          ) : (
            <TouchableOpacity
              style={styles.emptyJobCard}
              onPress={() => router.push('/(employer)/jobs/new')}
            >
              <Plus color={Colors.employer} size={24} strokeWidth={2} />
              <Text style={styles.emptyJobText}>Post your first job</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: Space.tabBarHeight + 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Space.pagePadding,
    paddingTop: Spacing[4],
    paddingBottom: Spacing[3],
  },
  greeting:    { ...Typography.label, color: Colors.textMuted },
  companyName: { ...Typography.h3, color: Colors.textPrimary, marginTop: 2 },
  notifBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute', top: -4, right: -4,
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.error,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.bg,
  },
  notifBadgeText: { fontSize: 10, fontWeight: '700', color: Palette.white },

  // Hero
  heroBanner: {
    marginHorizontal: Space.pagePadding,
    borderRadius: Radius.xl,
    padding: Spacing[5],
    marginBottom: Spacing[6],
    gap: Spacing[5],
  },
  heroContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroTitle:   { ...Typography.h3, color: Palette.white },
  heroSubtitle:{ ...Typography.label, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  postJobBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Palette.white,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3.5],
    paddingVertical: Spacing[2],
  },
  postJobText: { ...Typography.label, fontWeight: '700', color: Colors.employer },
  heroStats:       { flexDirection: 'row' },
  heroStat:        { flex: 1, flexDirection: 'row', alignItems: 'center' },
  heroStatDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.25)', marginRight: Spacing[4] },
  heroStatContent: { flex: 1, alignItems: 'center' },
  heroStatValue:   { ...Typography.h3, color: Palette.white },
  heroStatLabel:   { ...Typography.caption, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  // Sections
  section:      { paddingHorizontal: Space.pagePadding, marginBottom: Spacing[6] },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[4] },
  sectionTitle: { ...Typography.h4, color: Colors.textPrimary },
  seeAll:       { ...Typography.label, color: Colors.employer, fontWeight: '600' },

  // Quick actions
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[3] },
  quickCard: {
    width: '47.5%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    borderWidth: 1, borderColor: Colors.border,
    gap: Spacing[3],
  },
  quickIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  quickLabel:{ ...Typography.bodySm, color: Colors.textPrimary, fontWeight: '600' },

  // Applications
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    marginBottom: Spacing[3],
    borderWidth: 1, borderColor: Colors.border,
    gap: Spacing[3],
  },
  appInfo:  { flex: 1 },
  appName:  { ...Typography.h5, color: Colors.textPrimary, marginBottom: 2 },
  appJob:   { ...Typography.bodySm, color: Colors.textSecondary, marginBottom: 2 },
  appTime:  { ...Typography.caption, color: Colors.textMuted },

  // Active jobs
  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    marginBottom: Spacing[3],
    borderWidth: 1, borderColor: Colors.border,
    gap: Spacing[3],
  },
  jobRowIcon: {
    width: 40, height: 40, borderRadius: Radius.md,
    backgroundColor: Colors.employerLight,
    alignItems: 'center', justifyContent: 'center',
  },
  jobRowInfo:  { flex: 1 },
  jobRowTitle: { ...Typography.h5, color: Colors.textPrimary, marginBottom: 3 },
  jobRowMeta:  { ...Typography.caption, color: Colors.textMuted },

  emptyJobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[3],
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing[5],
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyJobText: { ...Typography.body, color: Colors.employer, fontWeight: '600' },
});
