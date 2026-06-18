import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Search,
  MapPin,
  Briefcase,
  SlidersHorizontal,
  X,
  Building2,
  Clock,
  Heart,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Job } from '@/types/database';

const { width } = Dimensions.get('window');

export default function JobsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>(
    Array.isArray(params.search) ? params.search[0] : params.search || ''
  );
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(params.category || '');
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;

  const employmentTypes = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'freelance', label: 'Freelance' },
  ];

  const fetchJobs = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
      setPage(0);
    }

    const currentPage = reset ? 0 : page;

    let query = supabase
      .from('jobs')
      .select(`
        *,
        employer:employers(company_name, company_logo_url, city),
        category:job_categories(name)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(currentPage * pageSize, (currentPage + 1) * pageSize - 1);

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }

    if (selectedEmploymentType) {
      query = query.eq('employment_type', selectedEmploymentType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
    } else {
      const newJobs = data || [];
      if (reset) {
        setJobs(newJobs);
      } else {
        setJobs((prev) => [...prev, ...newJobs]);
      }
      setHasMore(newJobs.length === pageSize);
      setPage(currentPage + 1);
    }

    setLoading(false);
    setRefreshing(false);
  }, [searchQuery, selectedCategory, selectedEmploymentType, page, pageSize]);

  useEffect(() => {
    fetchJobs(true);
  }, [selectedCategory, selectedEmploymentType]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.length >= 2 || searchQuery.length === 0) {
        fetchJobs(true);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchJobs(false);
    }
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

  const renderJob = ({ item }: { item: Job }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => router.push(`/(job-seeker)/jobs/${item.id}`)}
    >
      <View style={styles.jobCardHeader}>
        <View style={styles.companyLogo}>
          {item.employer?.company_logo_url ? (
            <Image
              source={{ uri: item.employer.company_logo_url }}
              style={styles.logoImage}
            />
          ) : (
            <Building2 color="#64748B" size={24} />
          )}
        </View>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.companyName}>
            {item.employer?.company_name}
          </Text>
          <Text style={styles.jobSalary}>
            {formatSalary(item.salary_min, item.salary_max, item.salary_currency)}
          </Text>
        </View>
        <TouchableOpacity style={styles.saveButton}>
          <Heart color="#94A3B8" size={20} />
        </TouchableOpacity>
      </View>
      <View style={styles.jobTags}>
        <View style={styles.jobTag}>
          <Briefcase color="#64748B" size={12} />
          <Text style={styles.jobTagText}>
            {item.employment_type.replace('_', ' ')}
          </Text>
        </View>
        <View style={styles.jobTag}>
          <MapPin color="#64748B" size={12} />
          <Text style={styles.jobTagText}>{item.city || item.location || 'Remote'}</Text>
        </View>
      </View>
      <View style={styles.jobCardFooter}>
        <View style={styles.jobMeta}>
          <Clock color="#94A3B8" size={14} />
          <Text style={styles.jobMetaText}>{formatTimeAgo(item.created_at)}</Text>
        </View>
        <Text style={styles.jobViews}>{item.view_count || 0} views</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Jobs</Text>
        <Text style={styles.headerSubtitle}>
          {jobs.length} opportunities available
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search color="#94A3B8" size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X color="#94A3B8" size={20} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal color={showFilters ? '#2563EB' : '#64748B'} size={20} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>Employment Type</Text>
          <View style={styles.filterOptions}>
            {employmentTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.filterOption,
                  selectedEmploymentType === type.value && styles.filterOptionActive,
                ]}
                onPress={() =>
                  setSelectedEmploymentType(
                    selectedEmploymentType === type.value ? '' : type.value
                  )
                }
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedEmploymentType === type.value && styles.filterOptionTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Active Filters */}
      {(selectedEmploymentType || selectedCategory) && (
        <View style={styles.activeFilters}>
          {selectedEmploymentType && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>
                {employmentTypes.find((t) => t.value === selectedEmploymentType)?.label}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedEmploymentType('')}
              >
                <X color="#2563EB" size={14} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Jobs List */}
      <FlatList
        data={jobs}
        renderItem={renderJob}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
          ) : null
        }
        ListEmptyComponent={
          loading ? undefined : (
            <View style={styles.emptyState}>
              <Briefcase color="#CBD5E1" size={48} />
              <Text style={styles.emptyStateTitle}>No jobs found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search or filters
              </Text>
            </View>
          )
        }
      />
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
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 12,
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
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterOptionActive: {
    backgroundColor: '#EFF6FF',
  },
  filterOptionText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#2563EB',
  },
  activeFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 8,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  activeFilterText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '500',
  },
  listContainer: {
    padding: 20,
    paddingTop: 8,
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
    alignItems: 'flex-start',
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
    marginBottom: 4,
  },
  jobSalary: {
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
  },
  saveButton: {
    padding: 8,
  },
  jobTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  jobTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  jobTagText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  jobCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopColor: '#F1F5F9',
    borderTopWidth: 1,
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
  jobViews: {
    fontSize: 13,
    color: '#94A3B8',
  },
  loader: {
    paddingVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
  },
});
