import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft, Clock, MapPin, Briefcase, Calendar, Trash2, ChevronRight,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/Badge';
import {
  Colors, Typography, Spacing, Radius, Space, G, StatusConfig, Palette,
} from '@/constants/theme';
import { formatDate, formatSalary } from '@/utils/formatters';

export default function ApplicationDetailScreen() {
  const router = useRouter();
  const { id }  = useLocalSearchParams();
  const [app,     setApp]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`id, status, match_score, cover_letter, created_at, updated_at,
          job:jobs(id, title, description, employment_type, city, country,
                   is_remote, salary_min, salary_max, salary_currency, deadline,
                   employer:employers(company_name, company_logo_url, industry))`)
        .eq('id', id).single();
      if (error) { Alert.alert('Error', 'Failed to load'); router.back(); return; }
      setApp(data);
      setLoading(false);
    })();
  }, [id]);

  const withdraw = () => {
    Alert.alert('Withdraw Application', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Withdraw', style: 'destructive',
        onPress: async () => {
          await supabase.from('applications').update({ status: 'withdrawn' }).eq('id', id);
          Alert.alert('Withdrawn', 'Your application has been withdrawn.');
          router.back();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={G.emptyCenter}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </SafeAreaView>
    );
  }
  if (!app) return null;

  const sc     = StatusConfig[app.status] || StatusConfig.pending;
  const job    = app.job;
  const canWithdraw = !['withdrawn','accepted','rejected'].includes(app.status);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity style={G.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={Colors.textPrimary} size={20} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Application</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Status hero */}
        <View style={styles.statusCard}>
          <View style={[styles.statusIcon, { backgroundColor: sc.bg }]}>
            <Clock color={sc.color} size={28} strokeWidth={1.5} />
          </View>
          <Text style={styles.statusLabel}>{sc.label}</Text>
          <Text style={styles.appliedDate}>Applied {formatDate(app.created_at)}</Text>

          {app.match_score != null && (
            <View style={styles.matchPill}>
              <Text style={styles.matchPct}>{Math.round(app.match_score)}%</Text>
              <Text style={styles.matchLbl}>Match Score</Text>
            </View>
          )}
        </View>

        {/* Job info */}
        <View style={styles.section}>
          <Text style={G.sectionTitle}>Job Details</Text>
          <View style={styles.jobCard}>
            <Text style={styles.jobTitle}>{job?.title}</Text>
            <Text style={styles.company}>{job?.employer?.company_name}</Text>

            <View style={styles.jobMeta}>
              {[
                { icon: MapPin,    val: job?.is_remote ? 'Remote' : [job?.city, job?.country].filter(Boolean).join(', ') || 'TBD' },
                { icon: Briefcase, val: job?.employment_type?.replace(/_/g, ' ') },
                ...(job?.salary_min || job?.salary_max ? [{ icon: null, val: formatSalary(job.salary_min, job.salary_max, job.salary_currency) }] : []),
                ...(job?.deadline ? [{ icon: Calendar, val: `Deadline: ${formatDate(job.deadline)}` }] : []),
              ].map(({ icon: Icon, val }, i) => (
                <View key={i} style={styles.metaRow}>
                  {Icon && <Icon color={Colors.textMuted} size={14} strokeWidth={2} />}
                  <Text style={styles.metaText}>{val}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.viewJobBtn}
              onPress={() => router.push(`/(job-seeker)/jobs/${job?.id}` as any)}
            >
              <Text style={styles.viewJobText}>View Full Job Details</Text>
              <ChevronRight color={Colors.primary} size={15} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Cover letter */}
        {app.cover_letter && (
          <View style={styles.section}>
            <Text style={G.sectionTitle}>Your Cover Letter</Text>
            <View style={styles.coverCard}>
              <Text style={styles.coverText}>{app.cover_letter}</Text>
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={G.sectionTitle}>Activity</Text>
          <View style={styles.timelineCard}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: Colors.primary }]} />
              <View>
                <Text style={styles.timelineLabel}>Application Submitted</Text>
                <Text style={styles.timelineDate}>{formatDate(app.created_at)}</Text>
              </View>
            </View>
            {app.status !== 'pending' && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: sc.color }]} />
                <View>
                  <Text style={styles.timelineLabel}>Status: {sc.label}</Text>
                  <Text style={styles.timelineDate}>{formatDate(app.updated_at)}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={G.listBottom} />
      </ScrollView>

      {/* Footer */}
      {canWithdraw && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.withdrawBtn} onPress={withdraw}>
            <Trash2 color={Colors.error} size={18} strokeWidth={2} />
            <Text style={styles.withdrawText}>Withdraw Application</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { ...G.screen },

  navBar: {
    ...G.rowBetween,
    paddingHorizontal: Space.pagePadding,
    paddingTop: Space.pageTop,
    paddingBottom: Spacing[3],
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navTitle: { ...Typography.h5, color: Colors.textPrimary },

  scroll: { paddingBottom: 20 },

  statusCard: {
    alignItems: 'center',
    padding: Spacing[8],
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing[2],
  },
  statusIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[2] },
  statusLabel:{ ...Typography.h3, color: Colors.textPrimary },
  appliedDate:{ ...Typography.bodySm, color: Colors.textSecondary },
  matchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginTop: Spacing[2],
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[2],
  },
  matchPct: { ...Typography.h3, color: Colors.primary },
  matchLbl: { ...Typography.label, color: Colors.textSecondary },

  section:  { paddingHorizontal: Space.pagePadding, marginTop: Space.sectionGap },

  jobCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Space.cardPadding,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[2],
  },
  jobTitle: { ...Typography.h4, color: Colors.textPrimary },
  company:  { ...Typography.bodySm, color: Colors.textSecondary },
  jobMeta:  { gap: Spacing[1.5], marginTop: Spacing[1] },
  metaRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  metaText: { ...Typography.bodySm, color: Colors.textSecondary },
  viewJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[1],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    marginTop: Spacing[2],
  },
  viewJobText: { ...Typography.label, color: Colors.primary, fontWeight: '600' },

  coverCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Space.cardPadding, borderWidth: 1, borderColor: Colors.border },
  coverText: { ...Typography.body, color: Colors.textSecondary, lineHeight: 24 },

  timelineCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Space.cardPadding, borderWidth: 1, borderColor: Colors.border, gap: Spacing[4] },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[3] },
  timelineDot:  { width: 10, height: 10, borderRadius: 5, marginTop: 4, flexShrink: 0 },
  timelineLabel:{ ...Typography.body, color: Colors.textPrimary, fontWeight: '500' },
  timelineDate: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },

  footer: {
    paddingHorizontal: Space.pagePadding,
    paddingVertical: Spacing[4],
    paddingBottom: Spacing[8],
    backgroundColor: Colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  withdrawBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing[2], paddingVertical: Spacing[4],
    backgroundColor: Colors.errorLight, borderRadius: Radius.lg,
  },
  withdrawText: { ...Typography.button, color: Colors.error },
});
