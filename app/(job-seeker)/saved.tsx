import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Bookmark,
  MapPin,
  Briefcase,
  DollarSign,
  ChevronRight,
  Trash2,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

interface SavedJob {
  id: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    city: string | null;
    country: string | null;
    is_remote: boolean;
    employment_type: string;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string;
    employer: {
      company_name: string;
      company_logo_url: string | null;
    };
  };
}

export default function SavedJobsScreen() {
  const router = useRouter();
  const { jobSeeker } = useAuthStore();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobSeeker) {
      fetchSavedJobs();
    }
  }, [jobSeeker]);

  const fetchSavedJobs = async () => {
    if (!jobSeeker) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('saved_jobs')
      .select(`
        id,
        created_at,
        job:jobs(
          id,
          title,
          city,
          country,
          is_remote,
          employment_type,
          salary_min,
          salary_max,
          salary_currency,
          employer:employers(
            company_name,
            company_logo_url
          )
        )
      `)
      .eq('job_seeker_id', jobSeeker.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved jobs:', error);
    } else if (data) {
      const formatted = data.map((item: any) => ({
        id: item.id,
        created_at: item.created_at,
        job: Array.isArray(item.job) ? item.job[0] : item.job,
      }));
      setSavedJobs(formatted);
    }
    setLoading(false);
  };

  const removeSavedJob = async (savedJobId: string, jobTitle: string) => {
    Alert.alert(
      'Remove Saved Job',
      `Remove "${jobTitle}" from saved jobs?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('saved_jobs')
              .delete()
              .eq('id', savedJobId);

            if (error) {
              Alert.alert('Error', 'Failed to remove saved job');
            } else {
              setSavedJobs(savedJobs.filter((sj) => sj.id !== savedJobId));
            }
          },
        },
      ]
    );
  };

  const renderSavedJob = ({ item }: { item: SavedJob }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => router.push(`/(job-seeker)/jobs/${item.job.id}`)}
    >
      <View style={styles.jobCardContent}>
        <View style={styles.jobIcon}>
          <Briefcase color="#059669" size={20} />
        </View>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {item.job.title}
          </Text>
          <Text style={styles.companyName}>
            {item.job.employer?.company_name || 'Company'}
          </Text>
          <View style={styles.jobMeta}>
            <View style={styles.jobMetaItem}>
              <MapPin color="#94A3B8" size={12} />
              <Text style={styles.jobMetaText}>
                {item.job.is_remote
                  ? 'Remote'
                  : [item.job.city, item.job.country].filter(Boolean).join(', ') || 'Location TBD'}
              </Text>
            </View>
            <View style={styles.jobMetaItem}>
              <Briefcase color="#94A3B8" size={12} />
              <Text style={styles.jobMetaText}>
                {item.job.employment_type.replace('_', ' ')}
              </Text>
            </View>
          </View>
          {item.job.salary_min && (
            <View style={styles.salaryRow}>
              <DollarSign color="#10B981" size={12} />
              <Text style={styles.salaryText}>
                {item.job.salary_currency} {item.job.salary_min.toLocaleString()}
                {item.job.salary_max && ` - ${item.job.salary_max.toLocaleString()}`}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeSavedJob(item.id, item.job.title)}
          >
            <Trash2 color="#EF4444" size={18} />
          </TouchableOpacity>
          <ChevronRight color="#CBD5E1" size={20} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Jobs</Text>
        <Text style={styles.headerSubtitle}>
          {savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={savedJobs}
          renderItem={renderSavedJob}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Bookmark color="#CBD5E1" size={56} />
              <Text style={styles.emptyTitle}>No Saved Jobs Yet</Text>
              <Text style={styles.emptyText}>
                Save jobs to review them later. Tap the bookmark icon on any job listing.
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push('/(job-seeker)/jobs')}
              >
                <Text style={styles.browseButtonText}>Browse Jobs</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
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
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
    paddingTop: 20,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  jobCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  jobIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    marginBottom: 8,
  },
  jobMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 6,
  },
  jobMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobMetaText: {
    fontSize: 12,
    color: '#64748B',
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  salaryText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeButton: {
    padding: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 64,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  browseButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
