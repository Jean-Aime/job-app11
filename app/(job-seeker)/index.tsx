import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
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

const { width } = Dimensions.get('window');

export default function JobSeekerHomeScreen() {
  const router = useRouter();
  const { jobSeeker, user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('job_categories')
        .select('*')
        .limit(8);

      if (categoriesData) setCategories(categoriesData);

      // Fetch recent jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select(`
          *,
          employer:employers(company_name, company_logo_url),
          category:job_categories(name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      if (jobsData) setRecentJobs(jobsData);

      // Fetch recommended jobs (random for now)
      const { data: recommendedData } = await supabase
        .from('jobs')
        .select(`
          *,
          employer:employers(company_name, company_logo_url),
          category:job_categories(name)
        `)
        .eq('status', 'active')
        .limit(5);

      if (recommendedData) setRecommendedJobs(recommendedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffMs = now.getTime() - posted.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
  };

  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    if (!min && !max) return 'Salary not specified';
    const curr = currency || 'RWF';
    if (min && max) return `${curr} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${curr} ${min.toLocaleString()}+`;
    return `Up to ${curr} ${max?.toLocaleString()}`;
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
              onPress={() => router.push('/(job-seeker)/notifications')}
            >
              <Bell color="#1E293B" size={24} />
              <View style={styles.notificationBadge} />
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
              onSubmitEditing={() => router.push(`/(job-seeker)/jobs?search=${searchQuery}`)}
            />
            <TouchableOpacity style={styles.filterButton}>
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
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Applications</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
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
                onPress={() => router.push(`/(job-seeker)/jobs?category=${category.id}`)}
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
                  <View style={styles.jobMatch}>
                    <Text style={styles.matchScore}>95%</Text>
                    <Text style={styles.matchLabel}>Match</Text>
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
                      {job.employment_type.replace('_', ' ')}
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
                    {job.employment_type.replace('_', ' ')}
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
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#64748B',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
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
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  filterButton: {
    padding: 4,
  },
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
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
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
  statsButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  categoriesContainer: {
    paddingRight: 20,
    gap: 12,
  },
  categoryItem: {
    alignItems: 'center',
    width: 80,
  },
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
  jobCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#64748B',
  },
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
  matchScore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  matchLabel: {
    fontSize: 10,
    color: '#2563EB',
  },
  jobCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopColor: '#F1F5F9',
    borderTopWidth: 1,
    gap: 16,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobMetaText: {
    fontSize: 13,
    color: '#64748B',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100,
  },
});
