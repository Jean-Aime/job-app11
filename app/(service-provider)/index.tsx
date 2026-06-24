import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Briefcase, Star, TrendingUp, Clock, CheckCircle, AlertCircle,
  MapPin, DollarSign, Calendar, ChevronRight,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import {
  Colors, Typography, Spacing, Radius, Space, G, Palette,
} from '@/constants/theme';
import { formatTimeAgo } from '@/utils/formatters';

const VERIFICATION_BADGES = {
  1: { label: 'Basic', icon: '🟡', color: Colors.warning },
  2: { label: 'Skill Verified', icon: '🟢', color: Colors.success },
  3: { label: 'Background Check', icon: '🔵', color: Colors.primary },
  4: { label: 'Top Professional', icon: '🏆', color: Colors.employer },
};

export default function ServiceProviderDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [provider, setProvider] = useState<any>(null);
  const [stats, setStats] = useState({
    active_requests: 0,
    pending_requests: 0,
    completed_jobs: 0,
    earnings_month: 0,
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    if (!user?.id) return;

    // Get provider profile
    const { data: providerData } = await supabase
      .from('service_providers')
      .select(`
        *,
        skills:service_provider_skills(
          service_category:service_categories(name, icon)
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (providerData) {
      setProvider(providerData);

      // Get stats
      const [activeRequests, pendingRequests, completedJobs] = await Promise.all([
        supabase
          .from('service_requests')
          .select('id', { count: 'exact', head: true })
          .eq('assigned_provider_id', providerData.id)
          .in('status', ['accepted', 'in_progress']),
        supabase
          .from('service_provider_interests')
          .select('id', { count: 'exact', head: true })
          .eq('service_provider_id', providerData.id)
          .eq('status', 'interested'),
        supabase
          .from('service_requests')
          .select('id', { count: 'exact', head: true })
          .eq('assigned_provider_id', providerData.id)
          .eq('status', 'completed'),
      ]);

      setStats({
        active_requests: activeRequests.count || 0,
        pending_requests: pendingRequests.count || 0,
        completed_jobs: completedJobs.count || 0,
        earnings_month: 0, // TODO: Calculate from completed jobs
      });

      // Get recent requests (interested or assigned)
      const { data: requests } = await supabase
        .from('service_requests')
        .select(`
          *,
          service_category:service_categories(name, icon),
          customer:job_seekers(full_name, profile_photo_url, city)
        `)
        .or(`assigned_provider_id.eq.${providerData.id}`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (requests) setRecentRequests(requests);
    }

    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!provider) {
    // Provider profile not created yet - redirect to onboarding
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Briefcase color={Colors.textMuted} size={64} strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Complete Your Profile</Text>
          <Text style={styles.emptyText}>Set up your service provider profile to start accepting jobs</Text>
          <TouchableOpacity
            style={styles.setupButton}
            onPress={() => router.push('/(service-provider)/profile')}
          >
            <Text style={styles.setupButtonText}>Set Up Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const verificationBadge = VERIFICATION_BADGES[provider.verification_level as keyof typeof VERIFICATION_BADGES];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.success} />}
      >
        {/* Header with gradient */}
        <LinearGradient
          colors={[Colors.success, Colors.successDark]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerInfo}>
              <Text style={styles.greeting}>Hello,</Text>
              <Text style={styles.name}>{provider.full_name}</Text>
              <View style={styles.verificationRow}>
                <Text style={styles.verificationBadge}>{verificationBadge.icon} {verificationBadge.label}</Text>
              </View>
            </View>
            <Avatar
              uri={provider.profile_photo_url}
              name={provider.full_name}
              size="lg"
              color={Colors.success}
            />
          </View>

          {/* Availability Toggle */}
          <TouchableOpacity
            style={[styles.availabilityCard, !provider.is_available && styles.availabilityCardOff]}
            activeOpacity={0.8}
          >
            <View style={styles.availabilityLeft}>
              <View style={[styles.availabilityDot, !provider.is_available && styles.availabilityDotOff]} />
              <View>
                <Text style={styles.availabilityLabel}>
                  {provider.is_available ? 'Available for Work' : 'Currently Unavailable'}
                </Text>
                <Text style={styles.availabilitySubtext}>
                  {provider.is_available ? 'Customers can contact you' : 'You won\'t receive requests'}
                </Text>
              </View>
            </View>
            <ChevronRight color={Palette.white} size={20} strokeWidth={2} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: Colors.primaryLight }]}>
              <View style={[styles.statIcon, { backgroundColor: Colors.primary }]}>
                <Briefcase color={Palette.white} size={20} strokeWidth={2} />
              </View>
              <Text style={styles.statValue}>{stats.active_requests}</Text>
              <Text style={styles.statLabel}>Active Jobs</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: Colors.warningLight }]}>
              <View style={[styles.statIcon, { backgroundColor: Colors.warning }]}>
                <Clock color={Palette.white} size={20} strokeWidth={2} />
              </View>
              <Text style={styles.statValue}>{stats.pending_requests}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: Colors.successLight }]}>
              <View style={[styles.statIcon, { backgroundColor: Colors.success }]}>
                <CheckCircle color={Palette.white} size={20} strokeWidth={2} />
              </View>
              <Text style={styles.statValue}>{provider.total_jobs_completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: Colors.employerLight }]}>
              <View style={[styles.statIcon, { backgroundColor: Colors.employer }]}>
                <Star color={Palette.white} size={20} strokeWidth={2} />
              </View>
              <Text style={styles.statValue}>{provider.average_rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Performance Card */}
        <View style={styles.section}>
          <View style={styles.performanceCard}>
            <View style={styles.performanceHeader}>
              <TrendingUp color={Colors.success} size={24} strokeWidth={2} />
              <View style={styles.performanceInfo}>
                <Text style={styles.performanceTitle}>Your Performance</Text>
                <Text style={styles.performanceSubtext}>This month</Text>
              </View>
            </View>
            <View style={styles.performanceStats}>
              <View style={styles.performanceStat}>
                <Text style={styles.performanceValue}>{provider.response_rate.toFixed(0)}%</Text>
                <Text style={styles.performanceLabel}>Response Rate</Text>
              </View>
              <View style={styles.performanceDivider} />
              <View style={styles.performanceStat}>
                <Text style={styles.performanceValue}>{provider.total_reviews}</Text>
                <Text style={styles.performanceLabel}>Reviews</Text>
              </View>
              <View style={styles.performanceDivider} />
              <View style={styles.performanceStat}>
                <Text style={styles.performanceValue}>
                  {provider.skills?.length || 0}
                </Text>
                <Text style={styles.performanceLabel}>Skills</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Skills */}
        {provider.skills && provider.skills.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={G.sectionTitle}>Your Services</Text>
              <TouchableOpacity onPress={() => router.push('/(service-provider)/profile')}>
                <Text style={G.seeAllText}>Edit →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.skillsScroll}>
              {provider.skills.map((skill: any) => (
                <View key={skill.service_category.name} style={styles.skillChip}>
                  <Text style={styles.skillEmoji}>{skill.service_category.icon || '🔧'}</Text>
                  <Text style={styles.skillText}>{skill.service_category.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Requests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={G.sectionTitle}>Recent Requests</Text>
            <TouchableOpacity onPress={() => router.push('/(service-provider)/requests')}>
              <Text style={G.seeAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          {recentRequests.length === 0 ? (
            <View style={styles.emptyRequests}>
              <AlertCircle color={Colors.textMuted} size={40} strokeWidth={1.5} />
              <Text style={styles.emptyRequestsText}>No requests yet</Text>
              <Text style={styles.emptyRequestsSubtext}>New job requests will appear here</Text>
            </View>
          ) : (
            recentRequests.map((request) => (
              <TouchableOpacity
                key={request.id}
                style={styles.requestCard}
                onPress={() => router.push(`/(service-provider)/requests/${request.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={styles.requestHeader}>
                  <View style={[styles.requestIcon, { backgroundColor: Colors.successLight }]}>
                    <Text style={styles.requestEmoji}>{request.service_category?.icon || '🔧'}</Text>
                  </View>
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestTitle} numberOfLines={1}>{request.title}</Text>
                    <Text style={styles.requestCategory}>{request.service_category?.name}</Text>
                  </View>
                  <Badge
                    label={request.status}
                    color={request.status === 'pending' ? Colors.warning : Colors.success}
                    bg={request.status === 'pending' ? Colors.warningLight : Colors.successLight}
                    size="sm"
                  />
                </View>
                <View style={styles.requestMeta}>
                  <View style={styles.requestMetaItem}>
                    <MapPin color={Colors.textMuted} size={14} strokeWidth={2} />
                    <Text style={styles.requestMetaText}>{request.city}</Text>
                  </View>
                  {request.budget_max && (
                    <View style={styles.requestMetaItem}>
                      <DollarSign color={Colors.success} size={14} strokeWidth={2} />
                      <Text style={[styles.requestMetaText, { color: Colors.success, fontWeight: '600' }]}>
                        RWF {(request.budget_max / 1000).toFixed(0)}K
                      </Text>
                    </View>
                  )}
                  <View style={styles.requestMetaItem}>
                    <Calendar color={Colors.textMuted} size={14} strokeWidth={2} />
                    <Text style={styles.requestMetaText}>{formatTimeAgo(request.created_at)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={G.listBottom} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { ...G.screen },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...Typography.body, color: Colors.textSecondary },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Space.pagePadding },
  emptyTitle: { ...Typography.h2, color: Colors.textPrimary, marginTop: Spacing[4] },
  emptyText: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing[2], marginBottom: Spacing[6] },
  setupButton: { backgroundColor: Colors.success, paddingHorizontal: Spacing[8], paddingVertical: Spacing[4], borderRadius: Radius.full },
  setupButtonText: { ...Typography.button, color: Palette.white },

  header: { paddingHorizontal: Space.pagePadding, paddingTop: Space.pageTop, paddingBottom: Spacing[6] },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing[5] },
  headerInfo: { flex: 1 },
  greeting: { ...Typography.body, color: Palette.white, opacity: 0.9 },
  name: { ...Typography.h1, color: Palette.white, marginTop: 2, marginBottom: Spacing[2] },
  verificationRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  verificationBadge: { ...Typography.caption, color: Palette.white, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: Spacing[2], paddingVertical: Spacing[1], borderRadius: Radius.sm },

  availabilityCard: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.lg, padding: Spacing[4], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  availabilityCardOff: { backgroundColor: 'rgba(255,255,255,0.1)' },
  availabilityLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], flex: 1 },
  availabilityDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4ade80' },
  availabilityDotOff: { backgroundColor: Colors.textMuted },
  availabilityLabel: { ...Typography.label, color: Palette.white, fontWeight: '600' },
  availabilitySubtext: { ...Typography.caption, color: Palette.white, opacity: 0.8, marginTop: 2 },

  statsSection: { paddingHorizontal: Space.pagePadding, marginTop: -Spacing[8], marginBottom: Spacing[4] },
  statsRow: { flexDirection: 'row', gap: Spacing[3], marginBottom: Spacing[3] },
  statCard: { flex: 1, borderRadius: Radius.xl, padding: Spacing[4], alignItems: 'center', gap: Spacing[2] },
  statIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[1] },
  statValue: { ...Typography.h2, color: Colors.textPrimary, fontWeight: '700' },
  statLabel: { ...Typography.caption, color: Colors.textSecondary },

  section: { paddingHorizontal: Space.pagePadding, marginTop: Space.sectionGap },
  sectionHeader: { ...G.sectionHeader, marginBottom: Spacing[3] },

  performanceCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Space.cardPaddingLg, borderWidth: 1, borderColor: Colors.border },
  performanceHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], marginBottom: Spacing[5] },
  performanceInfo: { flex: 1 },
  performanceTitle: { ...Typography.h4, color: Colors.textPrimary },
  performanceSubtext: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  performanceStats: { flexDirection: 'row', justifyContent: 'space-around' },
  performanceStat: { alignItems: 'center' },
  performanceValue: { ...Typography.h2, color: Colors.success, fontWeight: '700' },
  performanceLabel: { ...Typography.caption, color: Colors.textSecondary, marginTop: Spacing[1] },
  performanceDivider: { width: 1, backgroundColor: Colors.border },

  skillsScroll: { paddingRight: Space.pagePadding, gap: Spacing[2] },
  skillChip: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing[3], paddingVertical: Spacing[2], borderRadius: Radius.full },
  skillEmoji: { fontSize: 18 },
  skillText: { ...Typography.label, color: Colors.textPrimary, fontWeight: '600' },

  emptyRequests: { alignItems: 'center', paddingVertical: Spacing[8], gap: Spacing[2] },
  emptyRequestsText: { ...Typography.h5, color: Colors.textPrimary, marginTop: Spacing[2] },
  emptyRequestsSubtext: { ...Typography.body, color: Colors.textMuted },

  requestCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Space.cardPadding, marginBottom: Spacing[3], borderWidth: 1, borderColor: Colors.border },
  requestHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], marginBottom: Spacing[3] },
  requestIcon: { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  requestEmoji: { fontSize: 24 },
  requestInfo: { flex: 1 },
  requestTitle: { ...Typography.h5, color: Colors.textPrimary, marginBottom: 2 },
  requestCategory: { ...Typography.caption, color: Colors.textMuted },
  requestMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[3] },
  requestMetaItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing[1] },
  requestMetaText: { ...Typography.caption, color: Colors.textSecondary },
});
