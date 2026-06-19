import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft, MapPin, Briefcase, Clock, DollarSign, Building2,
  Heart, Share2, Calendar, Users, CheckCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { Job } from '@/types/database';
import { useAuthStore } from '@/stores/authStore';
import {
  Colors, Typography, Spacing, Radius, Space, G, Palette,
} from '@/constants/theme';
import { formatSalary, formatDate } from '@/utils/formatters';

export default function JobDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { jobSeeker, isAuthenticated } = useAuthStore();
  const [job,       setJob]       = useState<Job | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [applying,  setApplying]  = useState(false);
  const [hasApplied,setHasApplied]= useState(false);
  const [isSaved,   setIsSaved]   = useState(false);
  const [savedId,   setSavedId]   = useState<string | null>(null);

  useEffect(() => { fetchJob(); }, [id]);

  const fetchJob = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, employer:employers(*), category:job_categories(name), required_skills:job_skills(*, skill:skills(name))')
      .eq('id', id).single();
    if (error) { Alert.alert('Error', 'Failed to load job'); router.back(); return; }
    setJob(data);
    await supabase.from('jobs').update({ view_count: (data.view_count || 0) + 1 }).eq('id', id);

    if (jobSeeker) {
      const [{ data: app }, { data: saved }] = await Promise.all([
        supabase.from('applications').select('id').eq('job_id', id).eq('job_seeker_id', jobSeeker.id).single(),
        supabase.from('saved_jobs').select('id').eq('job_id', id).eq('job_seeker_id', jobSeeker.id).single(),
      ]);
      if (app)  setHasApplied(true);
      if (saved){ setIsSaved(true); setSavedId(saved.id); }
    }
    setLoading(false);
  };

  const toggleSave = async () => {
    if (!jobSeeker) { Alert.alert('Login required', 'Please sign in to save jobs'); return; }
    if (isSaved && savedId) {
      await supabase.from('saved_jobs').delete().eq('id', savedId);
      setIsSaved(false); setSavedId(null);
    } else {
      const { data } = await supabase.from('saved_jobs')
        .insert({ job_id: id, job_seeker_id: jobSeeker.id }).select('id').single();
      if (data) { setIsSaved(true); setSavedId(data.id); }
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated || !jobSeeker) { Alert.alert('Login required', 'Please sign in to apply'); return; }
    setApplying(true);
    const { error } = await supabase.from('applications').insert({ job_id: id, job_seeker_id: jobSeeker.id, status: 'pending' });
    setApplying(false);
    if (error?.code === '23505') { setHasApplied(true); Alert.alert('Already Applied', 'You already applied for this job.'); }
    else if (error) { Alert.alert('Error', 'Failed to submit. Try again.'); }
    else { setHasApplied(true); Alert.alert('Applied!', 'Your application was submitted successfully.'); }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loading} edges={['top']}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }
  if (!job) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Nav bar */}
        <View style={styles.navBar}>
          <TouchableOpacity style={G.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={Colors.textPrimary} size={20} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={G.backBtn}>
            <Share2 color={Colors.textSecondary} size={18} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Company header */}
        <View style={styles.companyHeader}>
          <View style={styles.companyLogo}>
            {job.employer?.company_logo_url
              ? <Image source={{ uri: job.employer.company_logo_url }} style={styles.logoImg} />
              : <Building2 color={Colors.primary} size={36} strokeWidth={1.5} />}
          </View>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.companyName}>{job.employer?.company_name}</Text>
          <View style={styles.locationRow}>
            <MapPin color={Colors.textMuted} size={14} strokeWidth={2} />
            <Text style={styles.locationText}>{job.city || job.location || 'Remote'}</Text>
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          {[
            { icon: Briefcase, label: 'Type',       value: job.employment_type.replace(/_/g, ' ') },
            { icon: Clock,     label: 'Experience',  value: `${job.required_experience_years}+ yrs` },
            { icon: Users,     label: 'Positions',   value: String(job.positions_available) },
          ].map(({ icon: Icon, label, value }, i) => (
            <View key={label} style={[styles.statItem, i > 0 && styles.statItemBorder]}>
              <Icon color={Colors.primary} size={18} strokeWidth={2} />
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={styles.statValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Salary */}
        {(job.salary_min || job.salary_max) && (
          <View style={styles.salaryCard}>
            <DollarSign color={Colors.employer} size={20} strokeWidth={2} />
            <View>
              <Text style={styles.salaryLabel}>Salary Range</Text>
              <Text style={styles.salaryValue}>{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</Text>
            </View>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={G.sectionTitle}>Job Description</Text>
          <Text style={styles.description}>{job.description}</Text>
        </View>

        {/* Required skills */}
        {job.required_skills?.length > 0 && (
          <View style={styles.section}>
            <Text style={G.sectionTitle}>Required Skills</Text>
            <View style={styles.skillsList}>
              {(job.required_skills as any[]).map((s: any) => (
                <View key={s.id} style={styles.skillRow}>
                  <CheckCircle color={Colors.employer} size={15} strokeWidth={2.5} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.skillName}>{s.skill?.name}</Text>
                    {s.minimum_years > 0 && <Text style={styles.skillYears}>{s.minimum_years}+ years</Text>}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Deadline */}
        {job.deadline && (
          <View style={styles.deadlineCard}>
            <Calendar color={Colors.error} size={18} strokeWidth={2} />
            <View>
              <Text style={styles.deadlineLabel}>Application Deadline</Text>
              <Text style={styles.deadlineValue}>{formatDate(job.deadline)}</Text>
            </View>
          </View>
        )}

        {/* About company */}
        <View style={styles.section}>
          <Text style={[G.sectionTitle, { marginBottom: Spacing[3] }]}>About the Company</Text>
          <View style={styles.companyCard}>
            <View style={styles.companyCardHeader}>
              {job.employer?.company_logo_url
                ? <Image source={{ uri: job.employer.company_logo_url }} style={styles.companyLogoSm} />
                : <View style={styles.companyLogoSmFallback}><Building2 color={Colors.textMuted} size={20} strokeWidth={1.8} /></View>}
              <View style={{ flex: 1 }}>
                <Text style={styles.companyCardName}>{job.employer?.company_name}</Text>
                {job.employer?.industry && <Text style={styles.companyIndustry}>{job.employer.industry}</Text>}
              </View>
            </View>
            {job.employer?.company_description && (
              <Text style={styles.companyDesc}>{job.employer.company_description}</Text>
            )}
          </View>
        </View>

        <View style={G.listBottom} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveBtn} onPress={toggleSave}>
          <Heart
            color={isSaved ? Colors.error : Colors.textSecondary}
            size={22}
            strokeWidth={2}
            fill={isSaved ? Colors.error : 'transparent'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.applyBtn, hasApplied && styles.applyBtnDone]}
          onPress={handleApply}
          disabled={applying || hasApplied}
          activeOpacity={0.85}
        >
          {applying
            ? <ActivityIndicator color={Palette.white} />
            : <Text style={styles.applyBtnText}>{hasApplied ? '✓ Applied' : 'Apply Now'}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { ...G.screenWhite },
  loading:   { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bgCard },
  scroll:    { paddingBottom: 20 },

  navBar: { ...G.rowBetween, paddingHorizontal: Space.pagePadding, paddingTop: Space.pageTop, paddingBottom: Spacing[2] },

  companyHeader: {
    alignItems: 'center',
    paddingHorizontal: Space.pagePadding,
    paddingVertical: Spacing[6],
  },
  companyLogo: {
    width: 80, height: 80, borderRadius: Radius.xl,
    backgroundColor: Colors.bg,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing[4], overflow: 'hidden',
  },
  logoImg:      { width: 80, height: 80 },
  jobTitle:     { ...Typography.h2, color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing[1.5] },
  companyName:  { ...Typography.bodyLg, color: Colors.textSecondary, marginBottom: Spacing[2] },
  locationRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing[1] },
  locationText: { ...Typography.bodySm, color: Colors.textSecondary },

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Space.pagePadding,
    backgroundColor: Colors.bg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
  },
  statItem:       { flex: 1, alignItems: 'center', gap: Spacing[1] },
  statItemBorder: { borderLeftWidth: 1, borderLeftColor: Colors.border },
  statLabel:      { ...Typography.caption, color: Colors.textMuted, marginTop: Spacing[1] },
  statValue:      { ...Typography.label, color: Colors.textPrimary, fontWeight: '600', textAlign: 'center' },

  salaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    marginHorizontal: Space.pagePadding,
    marginTop: Spacing[4],
    padding: Space.cardPadding,
    backgroundColor: Colors.employerLight,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.employerMid,
  },
  salaryLabel: { ...Typography.caption, color: Colors.employer },
  salaryValue: { ...Typography.h4, color: Colors.textPrimary, marginTop: 2 },

  section:     { paddingHorizontal: Space.pagePadding, marginTop: Space.sectionGap },
  description: { ...Typography.bodyLg, color: Colors.textSecondary, lineHeight: 28 },

  skillsList: { gap: Spacing[3] },
  skillRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[2.5] },
  skillName:  { ...Typography.body, color: Colors.textPrimary, fontWeight: '500' },
  skillYears: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },

  deadlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    marginHorizontal: Space.pagePadding,
    marginTop: Spacing[4],
    padding: Space.cardPadding,
    backgroundColor: Colors.errorLight,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.errorMid,
  },
  deadlineLabel: { ...Typography.caption, color: Colors.error },
  deadlineValue: { ...Typography.h5, color: Colors.textPrimary, marginTop: 2 },

  companyCard: {
    backgroundColor: Colors.bg,
    borderRadius: Radius.lg,
    padding: Space.cardPadding,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[3],
  },
  companyCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  companyLogoSm: { width: 44, height: 44, borderRadius: Radius.md },
  companyLogoSmFallback: {
    width: 44, height: 44, borderRadius: Radius.md,
    backgroundColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  companyCardName: { ...Typography.h5, color: Colors.textPrimary },
  companyIndustry: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  companyDesc:     { ...Typography.body, color: Colors.textSecondary, lineHeight: 24 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Space.pagePadding,
    paddingVertical: Spacing[4],
    paddingBottom: Spacing[8],
    backgroundColor: Colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing[3],
  },
  saveBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.bg,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  applyBtn: {
    flex: 1, height: 52, borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  applyBtnDone: { backgroundColor: Colors.textMuted },
  applyBtnText: { ...Typography.buttonLg, color: Palette.white },
});
