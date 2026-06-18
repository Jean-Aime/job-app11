import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Star,
  Award,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ChevronRight,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface ApplicantDetails {
  id: string;
  status: string;
  cover_letter: string | null;
  match_score: number | null;
  skills_match: number | null;
  location_match: number | null;
  experience_match: number | null;
  created_at: string;
  job_seeker: {
    id: string;
    full_name: string;
    profile_photo_url: string | null;
    bio: string | null;
    city: string | null;
    country: string | null;
    current_occupation: string | null;
    years_of_experience: number;
    phone_number: string | null;
    availability: string;
  };
  job: {
    id: string;
    title: string;
  };
}

export default function CandidateDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [application, setApplication] = useState<ApplicantDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    if (!id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        cover_letter,
        match_score,
        skills_match,
        location_match,
        experience_match,
        created_at,
        job:jobs(id, title),
        job_seeker:job_seekers(
          id,
          full_name,
          profile_photo_url,
          bio,
          city,
          country,
          current_occupation,
          years_of_experience,
          phone_number,
          availability
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching application:', error);
      Alert.alert('Error', 'Failed to load candidate details');
      router.back();
    } else {
      setApplication(data as unknown as ApplicantDetails);
    }
    setLoading(false);
  };

  const updateStatus = async (newStatus: string) => {
    if (!application) return;

    setUpdating(true);
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', application.id);

    setUpdating(false);
    if (error) {
      Alert.alert('Error', 'Failed to update status');
    } else {
      setApplication({ ...application, status: newStatus });
      Alert.alert('Success', `Application ${newStatus}`);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
        </View>
      </SafeAreaView>
    );
  }

  if (!application) return null;

  const getStatusConfig = () => {
    switch (application.status) {
      case 'accepted':
        return { color: '#10B981', icon: CheckCircle, label: 'Accepted' };
      case 'rejected':
        return { color: '#EF4444', icon: XCircle, label: 'Rejected' };
      case 'shortlisted':
        return { color: '#8B5CF6', icon: Star, label: 'Shortlisted' };
      case 'reviewed':
        return { color: '#3B82F6', icon: Clock, label: 'Reviewed' };
      default:
        return { color: '#F59E0B', icon: Clock, label: 'Pending' };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="#1E293B" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Candidate Details</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Candidate Info */}
        <View style={styles.candidateCard}>
          <View style={styles.avatar}>
            {application.job_seeker.profile_photo_url ? (
              <Image
                source={{ uri: application.job_seeker.profile_photo_url }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarPlaceholder}>
                {application.job_seeker.full_name?.charAt(0) || '?'}
              </Text>
            )}
          </View>
          <Text style={styles.candidateName}>{application.job_seeker.full_name}</Text>
          <Text style={styles.appliedFor}>
            Applied for: {application.job?.title}
          </Text>
          <Text style={styles.appliedDate}>
            Applied {formatDate(application.created_at)}
          </Text>
        </View>

        {/* Match Score */}
        {application.match_score && (
          <View style={styles.matchCard}>
            <Text style={styles.matchTitle}>Match Analysis</Text>
            <View style={styles.matchScoreContainer}>
              <Text style={styles.matchScoreValue}>
                {Math.round(application.match_score)}%
              </Text>
              <Text style={styles.matchScoreLabel}>Overall Match</Text>
            </View>
            <View style={styles.matchBreakdown}>
              {application.skills_match && (
                <View style={styles.matchItem}>
                  <View style={styles.matchItemHeader}>
                    <Star color="#F59E0B" size={16} />
                    <Text style={styles.matchItemLabel}>Skills</Text>
                  </View>
                  <Text style={styles.matchItemValue}>
                    {Math.round(application.skills_match)}%
                  </Text>
                </View>
              )}
              {application.location_match && (
                <View style={styles.matchItem}>
                  <View style={styles.matchItemHeader}>
                    <MapPin color="#10B981" size={16} />
                    <Text style={styles.matchItemLabel}>Location</Text>
                  </View>
                  <Text style={styles.matchItemValue}>
                    {Math.round(application.location_match)}%
                  </Text>
                </View>
              )}
              {application.experience_match && (
                <View style={styles.matchItem}>
                  <View style={styles.matchItemHeader}>
                    <Briefcase color="#3B82F6" size={16} />
                    <Text style={styles.matchItemLabel}>Experience</Text>
                  </View>
                  <Text style={styles.matchItemValue}>
                    {Math.round(application.experience_match)}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
            <StatusIcon color={statusConfig.color} size={18} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoCard}>
            {application.job_seeker.phone_number && (
              <View style={styles.infoRow}>
                <Phone color="#64748B" size={20} />
                <Text style={styles.infoValue}>{application.job_seeker.phone_number}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <MapPin color="#64748B" size={20} />
              <Text style={styles.infoValue}>
                {[application.job_seeker.city, application.job_seeker.country]
                  .filter(Boolean)
                  .join(', ') || 'Location not specified'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Calendar color="#64748B" size={20} />
              <Text style={styles.infoValue}>
                Available: {application.job_seeker.availability}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Briefcase color="#64748B" size={20} />
              <Text style={styles.infoValue}>
                {application.job_seeker.years_of_experience} years experience
              </Text>
            </View>
          </View>
        </View>

        {/* About */}
        {application.job_seeker.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.infoCard}>
              <Text style={styles.bioText}>{application.job_seeker.bio}</Text>
            </View>
          </View>
        )}

        {/* Cover Letter */}
        {application.cover_letter && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cover Letter</Text>
            <View style={styles.infoCard}>
              <Text style={styles.bioText}>{application.cover_letter}</Text>
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Actions */}
      <View style={styles.actionsFooter}>
        {application.status === 'pending' || application.status === 'reviewed' ? (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.shortlistButton]}
              onPress={() => updateStatus('shortlisted')}
              disabled={updating}
            >
              <Star color="#8B5CF6" size={18} />
              <Text style={styles.shortlistButtonText}>Shortlist</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => updateStatus('rejected')}
              disabled={updating}
            >
              <XCircle color="#EF4444" size={18} />
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
          </>
        ) : application.status === 'shortlisted' ? (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => updateStatus('accepted')}
              disabled={updating}
            >
              <CheckCircle color="#FFFFFF" size={18} />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => updateStatus('rejected')}
              disabled={updating}
            >
              <XCircle color="#EF4444" size={18} />
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.fullButton]}
            onPress={() => updateStatus('pending')}
            disabled={updating}
          >
            <Text style={styles.acceptButtonText}>Reset to Pending</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  candidateCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    fontSize: 32,
    fontWeight: '600',
    color: '#64748B',
  },
  candidateName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  appliedFor: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  appliedDate: {
    fontSize: 13,
    color: '#94A3B8',
  },
  matchCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  matchScoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  matchScoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#059669',
  },
  matchScoreLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  matchBreakdown: {
    gap: 12,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchItemLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  matchItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  infoValue: {
    fontSize: 15,
    color: '#1E293B',
    flex: 1,
  },
  bioText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  bottomPadding: {
    height: 120,
  },
  actionsFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  fullButton: {
    backgroundColor: '#059669',
  },
  shortlistButton: {
    backgroundColor: '#F3E8FF',
  },
  shortlistButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  acceptButton: {
    backgroundColor: '#059669',
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rejectButton: {
    backgroundColor: '#FEE2E2',
  },
  rejectButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
});
