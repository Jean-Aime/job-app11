import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft, MapPin, Briefcase, Calendar, Star, CheckCircle, XCircle, Clock,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import {
  Colors, Typography, Spacing, Radius, Space, G, StatusConfig, Palette,
} from '@/constants/theme';

export default function CandidateDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [app,      setApp]      = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`id, status, cover_letter, match_score, skills_match, location_match, experience_match, created_at,
          job:jobs(id, title),
          job_seeker:job_seekers(id, full_name, profile_photo_url, bio, city, country,
                                  current_occupation, years_of_experience, phone_number, availability)`)
        .eq('id', id).single();
      if (error) { Alert.alert('Error', 'Failed to load'); router.back(); return; }
      setApp(data);
      setLoading(false);
    })();
  }, [id]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    await supabase.from('applications').update({ status }).eq('id', id);
    setApp((prev: any) => ({ ...prev, status }));
    setUpdating(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={G.emptyCenter}><ActivityIndicator size="large" color={Colors.employer} /></View>
      </SafeAreaView>
    );
  }
  if (!app) return null;

  const sc = StatusConfig[app.status] || StatusConfig.pending;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity style={G.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={Colors.textPrimary} size={20} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Candidate</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Candidate hero */}
        <View style={styles.heroCard}>
          <Avatar uri={app.job_seeker?.profile_photo_url} name={app.job_seeker?.full_name} size="xl" color={Colors.employer} />
          <Text style={styles.name}>{app.job_seeker?.full_name}</Text>
          <Text style={styles.appliedFor}>Applied for: {app.job?.title}</Text>
          <Badge label={sc.label} color={sc.color} bg={sc.bg} dot />
        </View>

        {/* Match score */}
        {app.match_score != null && (
          <View style={styles.section}>
            <Text style={G.sectionTitle}>Match Analysis</Text>
            <View style={styles.matchCard}>
              <View style={styles.matchTotal}>
                <Text style={styles.matchPct}>{Math.round(app.match_score)}%</Text>
                <Text style={styles.matchLbl}>Overall Match</Text>
              </View>
              <View style={styles.matchBreakdown}>
                {[
                  { label: 'Skills',      value: app.skills_match,    color: Colors.warning },
                  { label: 'Location',    value: app.location_match,  color: Colors.success },
                  { label: 'Experience',  value: app.experience_match,color: Colors.primary },
                ].filter(r => r.value != null).map(r => (
                  <View key={r.label} style={styles.matchRow}>
                    <Text style={styles.matchRowLabel}>{r.label}</Text>
                    <View style={styles.matchBarTrack}>
                      <View style={[styles.matchBarFill, { width: `${r.value}%` as any, backgroundColor: r.color }]} />
                    </View>
                    <Text style={[styles.matchRowPct, { color: r.color }]}>{Math.round(r.value)}%</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Contact info */}
        <View style={styles.section}>
          <Text style={G.sectionTitle}>Contact & Details</Text>
          <View style={styles.infoCard}>
            {[
              { icon: MapPin,    val: [app.job_seeker?.city, app.job_seeker?.country].filter(Boolean).join(', ') || 'Not specified' },
              { icon: Calendar,  val: `Available: ${app.job_seeker?.availability?.replace(/_/g, ' ') || 'Not set'}` },
              { icon: Briefcase, val: `${app.job_seeker?.years_of_experience || 0} years experience` },
            ].map(({ icon: Icon, val }, i) => (
              <View key={i} style={[styles.infoRow, i > 0 && styles.infoRowBorder]}>
                <Icon color={Colors.textMuted} size={16} strokeWidth={2} />
                <Text style={styles.infoVal}>{val}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bio */}
        {app.job_seeker?.bio && (
          <View style={styles.section}>
            <Text style={G.sectionTitle}>About</Text>
            <View style={styles.textCard}>
              <Text style={styles.textBody}>{app.job_seeker.bio}</Text>
            </View>
          </View>
        )}

        {/* Cover letter */}
        {app.cover_letter && (
          <View style={styles.section}>
            <Text style={G.sectionTitle}>Cover Letter</Text>
            <View style={styles.textCard}>
              <Text style={styles.textBody}>{app.cover_letter}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Actions */}
      <View style={styles.footer}>
        {updating
          ? <ActivityIndicator color={Colors.employer} />
          : app.status === 'pending' || app.status === 'reviewed'
          ? (
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.adminLight }]} onPress={() => updateStatus('shortlisted')}>
                <Star color={Colors.admin} size={16} strokeWidth={2} />
                <Text style={[styles.actionText, { color: Colors.admin }]}>Shortlist</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.errorLight }]} onPress={() => updateStatus('rejected')}>
                <XCircle color={Colors.error} size={16} strokeWidth={2} />
                <Text style={[styles.actionText, { color: Colors.error }]}>Reject</Text>
              </TouchableOpacity>
            </View>
          )
          : app.status === 'shortlisted'
          ? (
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.employer, flex: 2 }]} onPress={() => updateStatus('accepted')}>
                <CheckCircle color={Palette.white} size={16} strokeWidth={2} />
                <Text style={[styles.actionText, { color: Palette.white }]}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.errorLight }]} onPress={() => updateStatus('rejected')}>
                <XCircle color={Colors.error} size={16} strokeWidth={2} />
                <Text style={[styles.actionText, { color: Colors.error }]}>Reject</Text>
              </TouchableOpacity>
            </View>
          )
          : (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.bg, flex: 1, borderWidth: 1, borderColor: Colors.border }]} onPress={() => updateStatus('pending')}>
              <Clock color={Colors.textSecondary} size={16} strokeWidth={2} />
              <Text style={[styles.actionText, { color: Colors.textSecondary }]}>Reset to Pending</Text>
            </TouchableOpacity>
          )
        }
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { ...G.screen },
  navBar:    { ...G.rowBetween, paddingHorizontal: Space.pagePadding, paddingTop: Space.pageTop, paddingBottom: Spacing[3], backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  navTitle:  { ...Typography.h5, color: Colors.textPrimary },
  scroll:    { paddingBottom: 20 },

  heroCard:   { alignItems: 'center', padding: Spacing[8], backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: Spacing[2] },
  name:       { ...Typography.h3, color: Colors.textPrimary },
  appliedFor: { ...Typography.bodySm, color: Colors.textSecondary },

  section: { paddingHorizontal: Space.pagePadding, marginTop: Space.sectionGap },

  matchCard:      { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  matchTotal:     { alignItems: 'center', padding: Spacing[6], borderBottomWidth: 1, borderBottomColor: Colors.border },
  matchPct:       { ...Typography.display, color: Colors.employer },
  matchLbl:       { ...Typography.bodySm, color: Colors.textSecondary },
  matchBreakdown: { padding: Space.cardPadding, gap: Spacing[4] },
  matchRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  matchRowLabel:  { ...Typography.label, color: Colors.textSecondary, width: 80 },
  matchBarTrack:  { flex: 1, height: 6, backgroundColor: Colors.bg, borderRadius: 3, overflow: 'hidden' },
  matchBarFill:   { height: '100%', borderRadius: 3 },
  matchRowPct:    { ...Typography.label, fontWeight: '700', width: 36, textAlign: 'right' },

  infoCard:       { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Space.cardPadding },
  infoRow:        { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], paddingVertical: Spacing[3.5] },
  infoRowBorder:  { borderTopWidth: 1, borderTopColor: Colors.divider },
  infoVal:        { ...Typography.body, color: Colors.textPrimary, flex: 1 },

  textCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Space.cardPadding, borderWidth: 1, borderColor: Colors.border },
  textBody: { ...Typography.body, color: Colors.textSecondary, lineHeight: 24 },

  footer:    { paddingHorizontal: Space.pagePadding, paddingVertical: Spacing[4], paddingBottom: Spacing[8], backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.border },
  actionRow: { flexDirection: 'row', gap: Spacing[3] },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[2], paddingVertical: Spacing[4], borderRadius: Radius.lg },
  actionText:{ ...Typography.button, fontWeight: '600' },
});
