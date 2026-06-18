import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Users, Building2, Briefcase, FileCheck, AlertTriangle,
  ArrowRight, TrendingUp, Shield, LogOut,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useSignOut } from '@/hooks/useSignOut';
import { StatCard } from '@/components/ui/StatCard';
import { Colors, Typography, Spacing, Radius, Palette, Space } from '@/constants/theme';

interface Stats {
  users: number;
  employers: number;
  activeJobs: number;
  applications: number;
  pendingVerifications: number;
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { handleSignOut } = useSignOut();

  const [stats,      setStats]      = useState<Stats>({ users: 0, employers: 0, activeJobs: 0, applications: 0, pendingVerifications: 0 });
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const [u, e, j, a, pv] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('employers').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('applications').select('id', { count: 'exact', head: true }),
        supabase.from('employers').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
      ]);
      setStats({
        users:                u.count  ?? 0,
        employers:            e.count  ?? 0,
        activeJobs:           j.count  ?? 0,
        applications:         a.count  ?? 0,
        pendingVerifications: pv.count ?? 0,
      });
    } catch (err) {
      console.error('Admin stats error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  const onRefresh = async () => { setRefreshing(true); await fetchStats(); setRefreshing(false); };

  const STAT_CARDS = [
    { label: 'Active Users',    value: stats.users,        icon: <Users color={Colors.primary} size={22} strokeWidth={2} />,    color: Colors.primary,  bg: Colors.primaryLight },
    { label: 'Employers',       value: stats.employers,    icon: <Building2 color={Colors.employer} size={22} strokeWidth={2} />, color: Colors.employer, bg: Colors.employerLight },
    { label: 'Active Jobs',     value: stats.activeJobs,   icon: <Briefcase color="#D97706" size={22} strokeWidth={2} />,        color: '#D97706',       bg: '#FEF3C7' },
    { label: 'Applications',    value: stats.applications, icon: <FileCheck color={Colors.admin} size={22} strokeWidth={2} />,   color: Colors.admin,    bg: Colors.adminLight },
  ];

  const QUICK_LINKS = [
    { label: 'Manage Users',         desc: 'View & moderate job seekers',    icon: Users,      color: Colors.primary,  path: '/(admin)/users' },
    { label: 'Employer Verification',desc: 'Review company registrations',    icon: Building2,  color: Colors.employer, path: '/(admin)/employers' },
    { label: 'Platform Jobs',         desc: 'Monitor all job listings',       icon: Briefcase,  color: '#D97706',       path: '/(admin)/jobs' },
    { label: 'Applications',          desc: 'Platform-wide applications',     icon: FileCheck,  color: Colors.admin,    path: '/(admin)/applications' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.admin} />}
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.adminBadge}>
              <Shield color={Colors.admin} size={14} strokeWidth={2.5} />
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
            <Text style={styles.headerTitle}>Control Panel</Text>
            <Text style={styles.headerEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <LogOut color={Colors.error} size={20} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* ── Pending Verification Alert ───────────────────────── */}
        {stats.pendingVerifications > 0 && (
          <TouchableOpacity
            style={styles.alertCard}
            onPress={() => router.push('/(admin)/employers')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#D97706', '#F59E0B']}
              style={styles.alertGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.alertIcon}>
                <AlertTriangle color={Palette.white} size={20} strokeWidth={2.5} />
              </View>
              <View style={styles.alertText}>
                <Text style={styles.alertTitle}>Action Required</Text>
                <Text style={styles.alertDesc}>
                  {stats.pendingVerifications} employer{stats.pendingVerifications !== 1 ? 's' : ''} awaiting verification
                </Text>
              </View>
              <ArrowRight color={Palette.white} size={20} strokeWidth={2} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ── Stats Grid ───────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Overview</Text>
          <View style={styles.statsGrid}>
            {STAT_CARDS.map(s => (
              <View key={s.label} style={styles.statWrap}>
                <StatCard
                  label={s.label}
                  value={loading ? '—' : s.value.toLocaleString()}
                  icon={s.icon}
                  color={s.color}
                  bg={s.bg}
                />
              </View>
            ))}
          </View>
        </View>

        {/* ── Quick Links ──────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage Platform</Text>
          <View style={styles.linkList}>
            {QUICK_LINKS.map(({ label, desc, icon: Icon, color, path }) => (
              <TouchableOpacity
                key={label}
                style={styles.linkCard}
                onPress={() => router.push(path as any)}
                activeOpacity={0.85}
              >
                <View style={[styles.linkIcon, { backgroundColor: color + '18' }]}>
                  <Icon color={color} size={22} strokeWidth={2} />
                </View>
                <View style={styles.linkText}>
                  <Text style={styles.linkTitle}>{label}</Text>
                  <Text style={styles.linkDesc}>{desc}</Text>
                </View>
                <ArrowRight color={Colors.textMuted} size={18} strokeWidth={2} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Analytics placeholder ─────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics</Text>
          <View style={styles.analyticsCard}>
            <TrendingUp color={Colors.admin} size={36} strokeWidth={1.5} />
            <Text style={styles.analyticsTitle}>Detailed Analytics</Text>
            <Text style={styles.analyticsDesc}>
              Advanced charts and reporting coming in the next release.
            </Text>
          </View>
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
    alignItems: 'flex-start',
    paddingHorizontal: Space.pagePadding,
    paddingTop: Spacing[5],
    paddingBottom: Spacing[4],
  },
  headerLeft: { gap: 4 },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.adminLight,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[0.5],
    gap: 4,
    marginBottom: 2,
  },
  adminBadgeText: { ...Typography.caption, color: Colors.admin, fontWeight: '700' },
  headerTitle:    { ...Typography.h2, color: Colors.textPrimary },
  headerEmail:    { ...Typography.bodySm, color: Colors.textSecondary },
  signOutBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.errorLight,
    alignItems: 'center', justifyContent: 'center',
  },

  alertCard: {
    marginHorizontal: Space.pagePadding,
    marginBottom: Spacing[5],
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  alertGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[4],
    gap: Spacing[3],
  },
  alertIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  alertText:  { flex: 1 },
  alertTitle: { ...Typography.h5, color: Palette.white },
  alertDesc:  { ...Typography.bodySm, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  section:      { paddingHorizontal: Space.pagePadding, marginBottom: Spacing[6] },
  sectionTitle: { ...Typography.h4, color: Colors.textPrimary, marginBottom: Spacing[4] },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[3] },
  statWrap:  { width: '47.5%' },

  linkList: { gap: Spacing[3] },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    borderWidth: 1, borderColor: Colors.border,
    gap: Spacing[3],
  },
  linkIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  linkText: { flex: 1 },
  linkTitle:{ ...Typography.h5, color: Colors.textPrimary, marginBottom: 2 },
  linkDesc: { ...Typography.bodySm, color: Colors.textSecondary },

  analyticsCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing[8],
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    gap: Spacing[3],
  },
  analyticsTitle: { ...Typography.h4, color: Colors.textPrimary },
  analyticsDesc:  { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
