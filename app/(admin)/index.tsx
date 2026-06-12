import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Users,
  Building2,
  Briefcase,
  FileCheck,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalUsers: number;
  totalEmployers: number;
  totalJobs: number;
  totalApplications: number;
  pendingVerifications: number;
  newUsersToday: number;
  activeJobs: number;
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEmployers: 0,
    totalJobs: 0,
    totalApplications: 0,
    pendingVerifications: 0,
    newUsersToday: 0,
    activeJobs: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);

    const [usersCount, employersCount, jobsCount, appsCount, pendingCount, activeJobsCount] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('employers').select('id', { count: 'exact', head: true }),
      supabase.from('jobs').select('id', { count: 'exact', head: true }),
      supabase.from('applications').select('id', { count: 'exact', head: true }),
      supabase.from('employers').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
      supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    ]);

    setStats({
      totalUsers: usersCount.count || 0,
      totalEmployers: employersCount.count || 0,
      totalJobs: jobsCount.count || 0,
      totalApplications: appsCount.count || 0,
      pendingVerifications: pendingCount.count || 0,
      newUsersToday: 0,
      activeJobs: activeJobsCount.count || 0,
    });

    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Platform Overview</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
            <Users color="#2563EB" size={24} />
            <Text style={styles.statValue}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#ECFDF5' }]}>
            <Building2 color="#059669" size={24} />
            <Text style={styles.statValue}>{stats.totalEmployers}</Text>
            <Text style={styles.statLabel}>Employers</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Briefcase color="#D97706" size={24} />
            <Text style={styles.statValue}>{stats.activeJobs}</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FCE7F3' }]}>
            <FileCheck color="#DB2777" size={24} />
            <Text style={styles.statValue}>{stats.totalApplications}</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </View>
        </View>

        {/* Pending Verifications Alert */}
        {stats.pendingVerifications > 0 && (
          <TouchableOpacity onPress={() => router.push('/(admin)/employers')}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              style={styles.alertCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.alertContent}>
                <AlertCircle color="#FFFFFF" size={24} />
                <View style={styles.alertText}>
                  <Text style={styles.alertTitle}>Pending Verifications</Text>
                  <Text style={styles.alertDesc}>
                    {stats.pendingVerifications} employer{stats.pendingVerifications !== 1 ? 's' : ''} awaiting verification
                  </Text>
                </View>
              </View>
              <ArrowRight color="#FFFFFF" size={20} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(admin)/users')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
                <Users color="#2563EB" size={24} />
              </View>
              <Text style={styles.actionTitle}>Manage Users</Text>
              <Text style={styles.actionDesc}>View and manage job seekers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(admin)/employers')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#ECFDF5' }]}>
                <Building2 color="#059669" size={24} />
              </View>
              <Text style={styles.actionTitle}>Employer Verification</Text>
              <Text style={styles.actionDesc}>Review and verify companies</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(admin)/jobs')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Briefcase color="#D97706" size={24} />
              </View>
              <Text style={styles.actionTitle}>Manage Jobs</Text>
              <Text style={styles.actionDesc}>Review posted jobs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(admin)/applications')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FCE7F3' }]}>
                <FileCheck color="#DB2777" size={24} />
              </View>
              <Text style={styles.actionTitle}>Applications</Text>
              <Text style={styles.actionDesc}>View all applications</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Platform Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Statistics</Text>
          <View style={styles.chartPlaceholder}>
            <TrendingUp color="#8B5CF6" size={32} />
            <Text style={styles.chartPlaceholderTitle}>Analytics Dashboard</Text>
            <Text style={styles.chartPlaceholderDesc}>
              Detailed analytics coming soon. Track user growth, job postings, and application trends.
            </Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.activityText}>Platform initialized</Text>
              <Text style={styles.activityTime}>Just now</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  alertCard: {
    margin: 20,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertText: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  alertDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 13,
    color: '#64748B',
  },
  chartPlaceholder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  chartPlaceholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 8,
  },
  chartPlaceholderDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
  },
  activityTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  bottomPadding: {
    height: 100,
  },
});
