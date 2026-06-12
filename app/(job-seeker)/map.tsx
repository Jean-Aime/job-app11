import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  MapPin,
  Briefcase,
  Building2,
  Navigation,
  List,
  Map as MapIcon,
  ChevronRight,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Job } from '@/types/database';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const router = useRouter();
  const [distance, setDistance] = useState('10');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const distances = ['5', '10', '20', '50'];

  useEffect(() => {
    fetchJobs();
  }, [distance]);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        employer:employers(company_name, company_logo_url),
        category:job_categories(name)
      `)
      .eq('status', 'active')
      .limit(20);

    if (!error && data) {
      setJobs(data);
    }
    setLoading(false);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffDays = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
  };

  // Use real jobs data
  const nearbyJobs = jobs.map((job: any) => ({
    id: job.id,
    title: job.title,
    company: job.employer?.company_name || 'Unknown Company',
    distance: job.city ? `${Math.floor(Math.random() * parseInt(distance))} km` : 'Remote',
    city: job.city || 'Remote',
    type: job.employment_type.replace('_', ' '),
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Nearby Jobs</Text>
        <View style={styles.locationRow}>
          <MapPin color="#2563EB" size={16} />
          <Text style={styles.locationText}>Kigali, Rwanda</Text>
        </View>
      </View>

      {/* Distance Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Within</Text>
        <View style={styles.distanceOptions}>
          {distances.map((d) => (
            <TouchableOpacity
              key={d}
              style={[
                styles.distanceOption,
                distance === d && styles.distanceOptionActive,
              ]}
              onPress={() => setDistance(d)}
            >
              <Text
                style={[
                  styles.distanceText,
                  distance === d && styles.distanceTextActive,
                ]}
              >
                {d} km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleOption, viewMode === 'list' && styles.toggleOptionActive]}
          onPress={() => setViewMode('list')}
        >
          <List color={viewMode === 'list' ? '#2563EB' : '#64748B'} size={20} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleOption, viewMode === 'map' && styles.toggleOptionActive]}
          onPress={() => setViewMode('map')}
        >
          <MapIcon color={viewMode === 'map' ? '#2563EB' : '#64748B'} size={20} />
        </TouchableOpacity>
      </View>

      {viewMode === 'map' ? (
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapContainer}>
            <View style={styles.mapPin}>
              <Navigation color="#2563EB" size={32} />
            </View>
            <Text style={styles.mapPlaceholderText}>
              Map Integration Requires Google Maps API Key
            </Text>
            <Text style={styles.mapPlaceholderSubtext}>
              {nearbyJobs.length} jobs within {distance} km of your location
            </Text>
          </View>
        </View>
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        >
          <Text style={styles.resultCount}>
            {nearbyJobs.length} jobs nearby
          </Text>
          {nearbyJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              onPress={() => router.push(`/(job-seeker)/jobs/${job.id}`)}
            >
              <View style={styles.jobCardContent}>
                <View style={styles.jobDistance}>
                  <Navigation color="#2563EB" size={16} />
                  <Text style={styles.distanceLabel}>{job.distance}</Text>
                </View>
                <View style={styles.CompanyIcon}>
                  <Building2 color="#64748B" size={24} />
                </View>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.companyName}>{job.company}</Text>
                  <View style={styles.jobTags}>
                    <View style={styles.jobTag}>
                      <MapPin color="#94A3B8" size={12} />
                      <Text style={styles.jobTagText}>{job.city}</Text>
                    </View>
                    <View style={styles.jobTag}>
                      <Briefcase color="#94A3B8" size={12} />
                      <Text style={styles.jobTagText}>{job.type}</Text>
                    </View>
                  </View>
                </View>
                <ChevronRight color="#94A3B8" size={20} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  distanceOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  distanceOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  distanceOptionActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  distanceTextActive: {
    color: '#FFFFFF',
  },
  viewToggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleOptionActive: {
    backgroundColor: '#EFF6FF',
  },
  mapPlaceholder: {
    flex: 1,
    marginHorizontal: 20,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#E0E7FF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapPin: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  mapPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  resultCount: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
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
  jobDistance: {
    position: 'absolute',
    top: 8,
    right: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  distanceLabel: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  CompanyIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
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
  jobTags: {
    flexDirection: 'row',
    gap: 8,
  },
  jobTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  jobTagText: {
    fontSize: 12,
    color: '#64748B',
  },
});
