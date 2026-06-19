import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft, Briefcase, MapPin, DollarSign, Users, Calendar,
  Edit3, Trash2, Pause, Play, ChevronRight,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { JobCardSkeleton } from '@/components/ui/SkeletonLoader';
import {
  Colors, Typography, Spacing, Radius, Space, G, JobStatusConfig, StatusConfig, Palette,
} from '@/constants/theme';
import { formatSalary, formatDate } from '@/utils/formatters';

export default function EmployerJobDetailScreen() {
  const router = useRouter();
  const { id }  = useLocalSearchParams();
  const [job,      setJob]      = useState<any>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { fetchJob(); }, [id]);

  const fetchJob = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('jobs')
      .select(`*, category:job_categories(name),
        applications(id, status, match_score, created_at,
          job_seeker:job_seekers(id, full_name, profile_photo_url, current_occupation, city))`)
      .eq('id', id).single();
    if (error) { Alert.alert('Error', 'Failed to load job'); router.back(); return; }
    setJob(data);
    setLoading(false);
  };

  const toggleStatus = async () => {
    const next = job.status === 'active' ? 'closed' : 'active';
    await supabase.from('jobs').update({ status: next }).eq('id', id);
    setJob({ ...job, status: next });
  };

  const deleteJob = () => {
    Alert.alert('Delete Job', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('jobs').delete().eq('id', id);
        router.back();
      }},
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.navBar}>
          <TouchableOpacity style={G.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={Colors.textPrimary} size={20} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Job Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ padding: Space.pagePadding }}>
          <JobCardSkeleton />
          <JobCardSkeleton />
        </View>
      </SafeAreaView>
    );
  }
  if (!job) return null;

  const sc  = JobStatusConfig[job.status]  || JobStatusConfig.draft;
  const apps = job.applications || [];
  const pending     = apps.filter((a: any) => a.status === 'pending').length;
  const shortlisted = apps.filter((a: any) => a.status === 'shortlisted').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity style={G.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={Colors.textPrimary} size={20} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Job Details</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push(`/(employer)/jobs/${id}/edit` as any)}
        >
          <Edit3 color={Colors.employer} size={18} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Job card */}
        <View style={styles.jobCard}>
          <View style={styles.jobHeader}>
            <View style={[G.iconLg, { backgroundColor: Colors.employerLight }]}>
              <Briefcase color={Colors.employer} size={24} strokeWidth={2} />
            </View>
            <View style={styles.jobHeaderInfo}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobCategory}>{job.category?.name || 'Uncategorized'}</Text>
            </View>
          </View>
          <Badge label={sc.label} color={sc.color} bg={sc.bg} dot />

          <View style={styles.jobMeta}>
            {[
              { icon: MapPin,    val: job.is_remote ? 'Remote' : [job.city, job.country].filter(Boolean).join(', ') || 'TBD' },
              { icon: Users,     val: `${job.positions_available} position${job.positions_available !== 1 ? 's' : ''}` },
              { icon: Calendar,  val: `${job.required_experience_years}+ yrs exp` },
            ].map(({ icon: Icon, val }, i) => (
              <View key={i} style={styles.metaRow}>
                <Icon color={Colors.textMuted} size={14} strokeWidth={2} />
                <Text style={styles.metaText}>{val}</Text>
              </View>
            ))}
            {(job.salary_min || job.salary_max) && (
              <View style={styles.metaRow}>
                <DollarSign color={Colors.employer} size={14} strokeWidth={2} />
                <Text style={[styles.metaText, { color: Colors.employer, fontWeight: '600' }]}>
                  {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.postedDate}>Posted {formatDate(job.created_at)}</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total',       value: apps.length },
            { label: 'Pending',     value: pending },
            { label: 'Shortlisted', value: shortlisted },
          ].map((s, i) => (
            <View key={s.label} style={[styles.statCard, i > 0 && { borderLeftWidth: 1, borderLeftColor: Colors.border }]}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={G.sectionTitle}>Description</Text>
          <View style={styles.descCard}>
            <Text style={styles.descText}>{job.description}</Text>
          </View>
        </View>

        {/* Applications */}
        <View style={styles.section}>
          <View style={G.sectionHeader}>
            <Text style={G.sectionTitle}>Applications ({apps.length})</Text>
            {apps.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(employer)/candidates' as any)}>
                <Text style={G.seeAllText}>View All →</Text>
              </TouchableOpacity>
            )}
          </View>

          {apps.length === 0 ? (
            <View style={styles.emptyApps}>
              <Users color={Colors.textMuted} size={32} strokeWidth={1.5} />
              <Text style={styles.emptyAppsText}>No applications yet</Text>
            </View>
          ) : (
            apps.slice(0, 5).map((app: any) => {
              const asc = StatusConfig[app.status] || StatusConfig.pending;
              return (
                <TouchableOpacity
                  key={app.id}
                  style={styles.appRow}
                  onPress={() => router.push(`/(employer)/candidates/${app.id}` as any)}
                  activeOpacity={0.85}
                >
                  <Avatar uri={app.job_seeker?.profile_photo_url} name={app.job_seeker?.full_name} size="sm" color={Colors.employer} />
                  <View style={styles.appInfo}>
                    <Text style={styles.appName}>{app.job_seeker?.full_name}</Text>
                    <Text style={styles.appMeta}>{app.job_seeker?.current_occupation || app.job_seeker?.city || 'Applicant'}</Text>
                  </View>
                  {app.match_score != null && (
                    <View style={styles.matchBadge}>
                      <Text style={styles.matchText}>{Math.round(app.match_score)}%</Text>
                    </View>
                  )}
                  <ChevronRight color={Colors.textMuted} size={16} strokeWidth={2} />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={G.listBottom} />
      </ScrollView>

      {/* Footer actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerBtn, { backgroundColor: job.status === 'active' ? Colors.warningLight : Colors.successLight }]}
          onPress={toggleStatus}
        >
          {job.status === 'active'
            ? <><Pause color={Colors.warning} size={16} strokeWidth={2} /><Text style={[styles.footerBtnText, { color: Colors.warning }]}>Close</Text></>
            : <><Play  color={Colors.success} size={16} strokeWidth={2} /><Text style={[styles.footerBtnText, { color: Colors.success }]}>Activate</Text></>
          }
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerBtn, { backgroundColor: Colors.errorLight }]} onPress={deleteJob}>
          <Trash2 color={Colors.error} size={16} strokeWidth={2} />
          <Text style={[styles.footerBtnText, { color: Colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { ...G.screen },
  navBar:    { ...G.rowBetween, paddingHorizontal: Space.pagePadding, paddingTop: Space.pageTop, paddingBottom: Spacing[3], backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  navTitle:  { ...Typography.h5, color: Colors.textPrimary },
  editBtn:   { width: 40, height: 40, borderRadius: Radius.md, backgroundColor: Colors.employerLight, alignItems: 'center', justifyContent: 'center' },
  scroll:    { paddingBottom: 20 },

  jobCard: { margin: Space.pagePadding, backgroundColor: Colors.bgCard, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, padding: Space.cardPaddingLg, gap: Spacing[4] },
  jobHeader:    { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[3] },
  jobHeaderInfo:{ flex: 1 },
  jobTitle:     { ...Typography.h3, color: Colors.textPrimary, marginBottom: 3 },
  jobCategory:  { ...Typography.bodySm, color: Colors.textSecondary },
  jobMeta:      { gap: Spacing[2.5] },
  metaRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  metaText:     { ...Typography.body, color: Colors.textSecondary },
  postedDate:   { ...Typography.caption, color: Colors.textMuted },

  statsRow: { flexDirection: 'row', marginHorizontal: Space.pagePadding, marginBottom: Spacing[2], backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border },
  statCard:  { flex: 1, alignItems: 'center', paddingVertical: Spacing[4] },
  statValue: { ...Typography.h2, color: Colors.textPrimary },
  statLabel: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },

  section:  { paddingHorizontal: Space.pagePadding, marginTop: Space.sectionGap },
  descCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Space.cardPadding, borderWidth: 1, borderColor: Colors.border },
  descText: { ...Typography.bodyLg, color: Colors.textSecondary, lineHeight: 28 },

  emptyApps:     { alignItems: 'center', paddingVertical: Spacing[8], gap: Spacing[2] },
  emptyAppsText: { ...Typography.body, color: Colors.textMuted },

  appRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Space.cardPadding, marginBottom: Spacing[3], borderWidth: 1, borderColor: Colors.border },
  appInfo:  { flex: 1 },
  appName:  { ...Typography.h5, color: Colors.textPrimary },
  appMeta:  { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  matchBadge: { backgroundColor: Colors.employerLight, borderRadius: Radius.sm, paddingHorizontal: Spacing[2.5], paddingVertical: Spacing[1] },
  matchText:  { ...Typography.label, color: Colors.employer, fontWeight: '700' },

  footer:       { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: Spacing[3], paddingHorizontal: Space.pagePadding, paddingVertical: Spacing[4], paddingBottom: Spacing[8], backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.border },
  footerBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[2], paddingVertical: Spacing[3.5], borderRadius: Radius.lg },
  footerBtnText:{ ...Typography.button, fontWeight: '600' },
});
