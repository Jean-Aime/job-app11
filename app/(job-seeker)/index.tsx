import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  MapPin,
  Briefcase,
  TrendingUp,
  Bell,
  ChevronRight,
  Star,
  Building2,
  Clock,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Job, JobCategory } from '@/types/database';
import { formatTimeAgo, formatSalary, getGreeting } from '@/utils/formatters';

interface JobWithMatch extends Job {
  match_score?: number;
  employer?: any;
  category?: any;
}

export default function JobSeekerHomeScreen() {
  const router = useRouter();
  const { jobSeeker } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<JobWithMatch[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({ applications: 0, matches: 0, saved: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [jobSeeker?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Categories
      const { data: catData } = await supabase
        .from('job_categories')
        .select('*')
        .limit(8);
      if (catData) setCategories(catData as JobCategory[]);

      // Recent jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*, employer:employers(company_name, company_logo_url), category:job_categories(name)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);
      if (jobsData) setRecentJobs(jobsData as Job[]);

      if (jobSeeker?.id) {
        // Recommended: real match scores from job_matches table
        const { data: matchData } = await supabase
          .from('job_matches')
          .select('match_score, job:jobs(*, employer:employers(company_name, company_logo_url), category:job_categories(name))')
          .eq('job_seeker_id', jobSeeker.id)
          .order('match_score', { ascending: false })
          .limit(5);

        if (matchData && matchData.length > 0) {
          const withScores: JobWithMatch[] = matchData.map((m: any) => ({
            ...(Array.isArray(m.job) ? m.job[0] : m.job),
            match_score: m.match_score,
          }));
          setRecommendedJobs(withScores.filter(Boolean));
        } else {
          // Fallback when no match scores exist yet
          const { data: fallback } = await supabase
            .from('jobs')
            .select('*, employer:employers(company_name, company_logo_url), category:job_categories(name)')
            .eq('status', 'active')
            .limit(5);
          if (fallback) setRecommendedJobs(fallback as JobWithMatch[]);
        }

        // Real stats
        const [appRes, matchRes, savedRes] = await Promise.all([
          supabase.from('applications').select('id', { count: 'exact', head: true }).eq('job_seeker_id', jobSeeker.id),
          supabase.from('job_matches').select('id', { count: 'exact', head: true }).eq('job_seeker_id', jobSeeker.id),
          supabase.from('saved_jobs').select('id', { count: 'exact', head: true }).eq('job_seeker_id', jobSeeker.id),
        ]);
        setStats({
          applications: appRes.count ?? 0,
          matches: matchRes.count ?? 0,
          saved: savedRes.count ?? 0,
        });
      }
    } catch (error) {
      console.error('Home fetchData error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>
                {jobSeeker?.full_name || 'Job Seeker'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push('/(job-seeker)/applications')}
            >
              <Bell color="#1E293B" size={24} />
              {stats.applications > 0 && <View style={styles.notificationBadge} />}
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search color="#94A3B8" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search jobs, companies..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() =>
                router.push(`/(job-seeker)/jobs?search=${searchQuery}`)
              }
              returnKeyType="search"
            />
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => router.push('/(job-seeker)/map')}
            >
              <MapPin color="#2563EB" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Card */}
        <LinearGradient
          colors={['#2563EB', '#3B82F6']}
          style={styles.statsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statsContent}>
            <View>
              <Text style={styles.statsTitle}>Your Job Search</Text>
              <Text style={styles.statsSubtitle}>
                {jobSeeker?.profile_completion_score || 0}% Profile Complete
              </Text>
            </View>
            <TouchableOpacity
              style={styles.statsButton}
              onPress={() => router.push('/(job-seeker)/profile')}
            >
              <Text style={styles.statsButtonText}>Complete Profile</Text>
              <ChevronRight color="#2563EB" size={16} />
            </TouchableOpacity>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.applications}</Text>
              <Text style={styles.statLabel}>Applications</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.matches}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.saved}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse Categories</Text>
            <TouchableOpacity onPress={() => router.push('/(job-seeker)/jobs')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                onPress={() =>
                  router.push(`/(job-seeker)/jobs?category=${category.id}`)
                }
              >
                <View style={styles.categoryIcon}>
                  <Briefcase color="#2563EB" size={24} />
                </View>
                <Text style={styles.categoryName} numberOfLines={2}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recommended Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Star color="#F59E0B" size={20} />
              <Text style={styles.sectionTitle}>Recommended for You</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(job-seeker)/jobs')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {recommendedJobs.length > 0 ? (
            recommendedJobs.map((job) => (
              <TouchableOpacity
                key={job.id}
                style={styles.jobCard}
                onPress={() => router.push(`/(job-seeker)/jobs/${job.id}`)}
              >
                <View style={styles.jobCardHeader}>
                  <View style={styles.companyLogo}>
                    {job.employer?.company_logo_url ? (
                      <Image
                        source={{ uri: job.employer.company_logo_url }}
                        style={styles.logoImage}
                      />
                    ) : (
                      <Building2 color="#64748B" size={24} />
                    )}
                  </View>
                  <View style={styles.jobInfo}>
                    <Text style={styles.jobTitle} numberOfLines={1}>
                      {job.title}
                    </Text>
                    <Text style={styles.companyName}>
                      {job.employer?.company_name}
                    </Text>
                  </View>
                  {job.match_score != null && (
                    <View style={styles.jobMatch}>
                      <Text style={styles.matchScore}>
                        {Math.round(job.match_score)}%
                      </Text>
                      <Text style={styles.matchLabel}>Match</Text>
                    </View>
                  )}
                </View>
                <View style={styles.jobCardFooter}>
                  <View style={styles.jobMeta}>
                    <MapPin color="#94A3B8" size={14} />
                    <Text style={styles.jobMetaText}>{job.city || 'Remote'}</Text>
                  </View>
                  <View style={styles.jobMeta}>
                    <Briefcase color="#94A3B8" size={14} />
                    <Text style={styles.jobMetaText}>
                      {job.employment_type?.replace('_', ' ')}
                    </Text>
                  </View>
                  <View style={styles.jobMeta}>
                    <Clock color="#94A3B8" size={14} />
                    <Text style={styles.jobMetaText}>
                      {formatTimeAgo(job.created_at)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No recommended jobs yet. Complete your profile for better matches.
              </Text>
            </View>
          )}
        </View>

        {/* Recent Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <TrendingUp color="#2563EB" size={20} />
              <Text style={styles.sectionTitle}>Recent Jobs</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(job-seeker)/jobs')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentJobs.slice(0, 5).map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              onPress={() => router.push(`/(job-seeker)/jobs/${job.id}`)}
            >
              <View style={styles.jobCardHeader}>
                <View style={styles.companyLogo}>
                  {job.employer?.company_logo_url ? (
                    <Image
                      source={{ uri: job.employer.company_logo_url }}
                      style={styles.logoImage}
                    />
                  ) : (
                    <Building2 color="#64748B" size={24} />
                  )}
                </View>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle} numberOfLines={1}>
                    {job.title}
                  </Text>
                  <Text style={styles.companyName}>
                    {job.employer?.company_name}
                  </Text>
                  <Text style={styles.jobSalary}>
                    {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                  </Text>
                </View>
              </View>
              <View style={styles.jobCardFooter}>
                <View style={styles.jobMeta}>
                  <MapPin color="#94A3B8" size={14} />
                  <Text style={styles.jobMetaText}>{job.city || 'Remote'}</Text>
                </View>
                <View style={styles.jobMeta}>
                  <Briefcase color="#94A3B8" size={14} />
                  <Text style={styles.jobMetaText}>
                    {job.employment_type?.replace('_', ' ')}
                  </Text>
                </View>
                <View style={styles.jobMeta}>
                  <Clock color="#94A3B8" size={14} />
                  <Text style={styles.jobMetaText}>
                    {formatTimeAgo(job.created_at)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { fontSize: 14, color: '#64748B' },
  userName: { fontSize: 24, fontWeight: '700', color: '#1E293B' },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: { flex: 1, fontSize: 16, color: '#1E293B' },
  filterButton: { padding: 4 },
  statsCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  statsSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  statsButtonText: { fontSize: 13, fontWeight: '600', color: '#2563EB' },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
  },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  seeAll: { fontSize: 14, fontWeight: '600', color: '#2563EB' },
  categoriesContainer: { paddingRight: 20, gap: 12 },
  categoryItem: { alignItems: 'center', width: 80 },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryName: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  jobCardHeader: { flexDirection: 'row', alignItems: 'center' },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoImage: { width: 48, height: 48, borderRadius: 12 },
  jobInfo: { flex: 1 },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  companyName: { fontSize: 14, color: '#64748B' },
  jobSalary: {
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
    marginTop: 4,
  },
  jobMatch: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  matchScore: { fontSize: 16, fontWeight: '700', color: '#2563EB' },
  matchLabel: { fontSize: 10, color: '#2563EB' },
  jobCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopColor: '#F1F5F9',
    borderTopWidth: 1,
    gap: 16,
  },
  jobMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  jobMetaText: { fontSize: 13, color: '#64748B' },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyStateText: { fontSize: 14, color: '#64748B', textAlign: 'center' },
  bottomPadding: { height: 100 },
});
