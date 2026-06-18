import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User, Phone, MapPin, Briefcase, Calendar, Award,
  FileText, Plus, ChevronRight, Edit3, Settings, LogOut, Star, Building2,
} from 'lucide-react-native';
// LogOut is imported above — no dynamic require needed
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { useSignOut } from '@/hooks/useSignOut';
import {
  Colors, Typography, Spacing, Radius, Space, G, Palette,
} from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, jobSeeker, fetchJobSeekerProfile } = useAuthStore();
  const { handleSignOut } = useSignOut();
  const [loading,  setLoading]  = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [skills,   setSkills]   = useState<any[]>([]);
  const [exps,     setExps]     = useState<any[]>([]);
  const [certs,    setCerts]    = useState<any[]>([]);
  const [form, setForm] = useState({
    full_name: '', phone_number: '', city: '', country: '',
    bio: '', current_occupation: '', years_of_experience: 0,
  });

  const load = useCallback(async () => {
    if (!jobSeeker) return;
    setForm({
      full_name:           jobSeeker.full_name           || '',
      phone_number:        jobSeeker.phone_number        || '',
      city:                jobSeeker.city                || '',
      country:             jobSeeker.country             || '',
      bio:                 jobSeeker.bio                 || '',
      current_occupation:  jobSeeker.current_occupation  || '',
      years_of_experience: jobSeeker.years_of_experience || 0,
    });
    const [{ data: s }, { data: e }, { data: c }] = await Promise.all([
      supabase.from('job_seeker_skills').select('*, skill:skills(*)').eq('job_seeker_id', jobSeeker.id),
      supabase.from('experiences').select('*').eq('job_seeker_id', jobSeeker.id).order('start_date', { ascending: false }),
      supabase.from('certificates').select('*').eq('job_seeker_id', jobSeeker.id),
    ]);
    if (s) setSkills(s);
    if (e) setExps(e);
    if (c) setCerts(c);
  }, [jobSeeker?.id]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!jobSeeker) return;
    setLoading(true);
    const { error } = await supabase.from('job_seekers').update({ ...form }).eq('id', jobSeeker.id);
    setLoading(false);
    if (error) {
      Alert.alert('Error', 'Failed to save. Please try again.');
    } else {
      setEditing(false);
      fetchJobSeekerProfile();
    }
  };

  const pct = jobSeeker?.profile_completion_score || 0;
  const progressColor = pct < 40 ? Colors.error : pct < 70 ? Colors.warning : Colors.success;

  if (!jobSeeker) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={G.emptyCenter}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Top bar ─────────────────────────────────── */}
        <View style={styles.topBar}>
          <Text style={styles.pageTitle}>My Profile</Text>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => Alert.alert('Settings', 'Coming soon')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Settings color={Colors.textSecondary} size={22} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* ── Profile hero card ────────────────────────── */}
        <View style={styles.heroCard}>
          <View style={styles.avatarWrap}>
            {jobSeeker.profile_photo_url
              ? <Image source={{ uri: jobSeeker.profile_photo_url }} style={styles.avatar} />
              : <View style={styles.avatarFallback}><User color={Palette.white} size={36} strokeWidth={1.8} /></View>}
            <TouchableOpacity style={styles.editAvatar}>
              <Edit3 color={Palette.white} size={14} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{form.full_name || 'Your Name'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          {/* Profile completion */}
          <View style={styles.progressWrap}>
            <View style={G.rowBetween}>
              <Text style={styles.progressLabel}>Profile Completion</Text>
              <Text style={[styles.progressPct, { color: progressColor }]}>{pct}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: progressColor }]} />
            </View>
          </View>
        </View>

        {/* ── Edit form ───────────────────────────────── */}
        {editing ? (
          <View style={styles.editSection}>
            <Text style={styles.sectionTitle}>Edit Profile</Text>

            {[
              { key: 'full_name',          label: 'Full Name',            keyboard: 'default' as const },
              { key: 'phone_number',        label: 'Phone',                keyboard: 'phone-pad' as const },
              { key: 'current_occupation',  label: 'Current Occupation',   keyboard: 'default' as const },
            ].map(f => (
              <View key={f.key} style={styles.fieldWrap}>
                <Text style={G.inputLabel}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  value={String((form as any)[f.key])}
                  onChangeText={v => setForm({ ...form, [f.key]: v })}
                  keyboardType={f.keyboard}
                />
              </View>
            ))}

            <View style={styles.rowFields}>
              {['city','country'].map(k => (
                <View key={k} style={styles.halfField}>
                  <Text style={G.inputLabel}>{k.charAt(0).toUpperCase() + k.slice(1)}</Text>
                  <TextInput
                    style={styles.input}
                    value={(form as any)[k]}
                    onChangeText={v => setForm({ ...form, [k]: v })}
                  />
                </View>
              ))}
            </View>

            <View style={styles.fieldWrap}>
              <Text style={G.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.bio}
                onChangeText={v => setForm({ ...form, bio: v })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                {loading
                  ? <ActivityIndicator color={Palette.white} />
                  : <Text style={styles.saveBtnText}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          </View>

        ) : (
          <>
            {/* ── Personal info ───────────────────────── */}
            <View style={styles.section}>
              <View style={G.sectionHeader}>
                <Text style={G.sectionTitle}>Personal Information</Text>
                <TouchableOpacity onPress={() => setEditing(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Edit3 color={Colors.primary} size={18} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <View style={styles.infoCard}>
                {[
                  { icon: Phone,    value: form.phone_number       || 'Add phone number' },
                  { icon: MapPin,   value: [form.city, form.country].filter(Boolean).join(', ') || 'Add location' },
                  { icon: Briefcase,value: form.current_occupation  || 'Add occupation' },
                  { icon: Calendar, value: `${form.years_of_experience} yrs experience` },
                ].map((row, i) => (
                  <View key={i} style={[styles.infoRow, i > 0 && styles.infoRowBorder]}>
                    <row.icon color={Colors.textMuted} size={18} strokeWidth={2} />
                    <Text style={styles.infoValue}>{row.value}</Text>
                  </View>
                ))}
              </View>

              {form.bio ? (
                <View style={styles.bioCard}>
                  <Text style={styles.bioText}>{form.bio}</Text>
                </View>
              ) : null}
            </View>

            {/* ── Skills ──────────────────────────────── */}
            <View style={styles.section}>
              <View style={G.sectionHeader}>
                <Text style={G.sectionTitle}>Skills ({skills.length})</Text>
                <TouchableOpacity onPress={() => router.push('/(job-seeker)/profile/skills' as any)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Plus color={Colors.primary} size={20} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
              {skills.length > 0 ? (
                <View style={styles.skillsGrid}>
                  {skills.slice(0, 8).map((s: any) => (
                    <View key={s.id} style={styles.skillChip}>
                      <Star color={Colors.warning} size={11} strokeWidth={2} fill={Colors.warning} />
                      <Text style={styles.skillText}>{s.skill?.name}</Text>
                    </View>
                  ))}
                  {skills.length > 8 && (
                    <TouchableOpacity
                      style={[styles.skillChip, styles.skillChipMore]}
                      onPress={() => router.push('/(job-seeker)/profile/skills' as any)}
                    >
                      <Text style={styles.skillChipMoreText}>+{skills.length - 8} more</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <TouchableOpacity style={styles.addCard} onPress={() => router.push('/(job-seeker)/profile/skills' as any)}>
                  <Plus color={Colors.textMuted} size={22} strokeWidth={2} />
                  <Text style={styles.addCardText}>Add your skills</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ── Experience ──────────────────────────── */}
            <View style={styles.section}>
              <View style={G.sectionHeader}>
                <Text style={G.sectionTitle}>Experience ({exps.length})</Text>
                <TouchableOpacity onPress={() => router.push('/(job-seeker)/profile/experience/new' as any)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Plus color={Colors.primary} size={20} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
              {exps.length > 0 ? (
                exps.slice(0, 3).map((e: any) => (
                  <View key={e.id} style={styles.listCard}>
                    <View style={[styles.listIcon, { backgroundColor: Colors.primaryLight }]}>
                      <Building2 color={Colors.primary} size={18} strokeWidth={2} />
                    </View>
                    <View style={styles.listInfo}>
                      <Text style={styles.listTitle}>{e.job_title}</Text>
                      <Text style={styles.listSub}>{e.company_name}</Text>
                      <Text style={styles.listMeta}>
                        {new Date(e.start_date).getFullYear()} – {e.is_current ? 'Present' : e.end_date ? new Date(e.end_date).getFullYear() : ''}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <TouchableOpacity style={styles.addCard} onPress={() => router.push('/(job-seeker)/profile/experience/new' as any)}>
                  <Plus color={Colors.textMuted} size={22} strokeWidth={2} />
                  <Text style={styles.addCardText}>Add work experience</Text>
                </TouchableOpacity>
              )}
              {exps.length > 3 && (
                <TouchableOpacity style={styles.seeMore} onPress={() => router.push('/(job-seeker)/profile/experience/new' as any)}>
                  <Text style={styles.seeMoreText}>See all {exps.length} experiences</Text>
                  <ChevronRight color={Colors.primary} size={15} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>

            {/* ── Certificates ─────────────────────────── */}
            <View style={styles.section}>
              <View style={G.sectionHeader}>
                <Text style={G.sectionTitle}>Certificates ({certs.length})</Text>
                <TouchableOpacity onPress={() => router.push('/(job-seeker)/profile/certificates/new' as any)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Plus color={Colors.primary} size={20} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
              {certs.length > 0 ? (
                certs.slice(0, 3).map((c: any) => (
                  <View key={c.id} style={styles.listCard}>
                    <View style={[styles.listIcon, { backgroundColor: Colors.successLight }]}>
                      <Award color={Colors.success} size={18} strokeWidth={2} />
                    </View>
                    <View style={styles.listInfo}>
                      <Text style={styles.listTitle}>{c.title}</Text>
                      <Text style={styles.listSub}>{c.issuing_organization}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <TouchableOpacity style={styles.addCard} onPress={() => router.push('/(job-seeker)/profile/certificates/new' as any)}>
                  <Plus color={Colors.textMuted} size={22} strokeWidth={2} />
                  <Text style={styles.addCardText}>Add certificates</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ── Resume ───────────────────────────────── */}
            <View style={styles.section}>
              <Text style={[G.sectionTitle, { marginBottom: Spacing[3] }]}>Resume</Text>
              <TouchableOpacity style={styles.resumeCard}>
                <View style={[styles.listIcon, { backgroundColor: Colors.primaryLight }]}>
                  <FileText color={Colors.primary} size={18} strokeWidth={2} />
                </View>
                <View style={styles.listInfo}>
                  <Text style={styles.listTitle}>
                    {jobSeeker.resume_url ? 'My_Resume.pdf' : 'Upload your resume'}
                  </Text>
                  <Text style={styles.listMeta}>
                    {jobSeeker.resume_url ? 'Tap to update' : 'PDF, DOC up to 5 MB'}
                  </Text>
                </View>
                <ChevronRight color={Colors.textMuted} size={18} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── Sign out ─────────────────────────────────── */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <LogOut color={Colors.error} size={18} strokeWidth={2} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={G.listBottom} />
      </ScrollView>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: { ...G.screen },

  topBar: {
    ...G.rowBetween,
    paddingHorizontal: Space.pagePadding,
    paddingTop: Space.pageTop,
    paddingBottom: Spacing[3],
  },
  pageTitle:   { ...Typography.h2, color: Colors.textPrimary },
  settingsBtn: { padding: Spacing[1] },

  // Hero card
  heroCard: {
    alignItems: 'center',
    marginHorizontal: Space.pagePadding,
    marginBottom: Spacing[2],
    padding: Space.cardPaddingLg,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarWrap:    { position: 'relative', marginBottom: Spacing[4] },
  avatar:        { width: 96, height: 96, borderRadius: 48 },
  avatarFallback:{
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  editAvatar: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.bgCard,
  },
  userName:  { ...Typography.h3, color: Colors.textPrimary, marginBottom: Spacing[0.5] },
  userEmail: { ...Typography.bodySm, color: Colors.textSecondary, marginBottom: Spacing[4] },

  // Progress
  progressWrap: { width: '100%', gap: Spacing[2] },
  progressLabel: { ...Typography.caption, color: Colors.textSecondary },
  progressPct:   { ...Typography.label, fontWeight: '700' },
  progressTrack: { height: 6, backgroundColor: Colors.bg, borderRadius: 3, overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 3 },

  // Sections
  section: {
    paddingHorizontal: Space.pagePadding,
    marginTop: Space.sectionGap,
  },
  sectionTitle: { ...G.sectionTitle },

  // Info card
  infoCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Space.cardPadding,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[3.5],
  },
  infoRowBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  infoValue: { ...Typography.body, color: Colors.textPrimary, flex: 1 },
  bioCard:   {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Space.cardPadding,
    marginTop: Spacing[3],
  },
  bioText: { ...Typography.body, color: Colors.textSecondary, lineHeight: 24 },

  // Skills grid
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skillText:         { ...Typography.label, color: Colors.textPrimary },
  skillChipMore:     { backgroundColor: Colors.primaryLight, borderColor: Colors.primaryLight },
  skillChipMoreText: { ...Typography.label, color: Colors.primary, fontWeight: '600' },

  // Add empty card
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing[5],
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  addCardText: { ...Typography.body, color: Colors.textMuted },

  // List items (experience / cert / resume)
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Space.cardPadding,
    marginBottom: Space.cardGapSm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[3],
  },
  listIcon: {
    width: 44, height: 44, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  listInfo:  { flex: 1 },
  listTitle: { ...Typography.h5, color: Colors.textPrimary, marginBottom: 2 },
  listSub:   { ...Typography.bodySm, color: Colors.textSecondary },
  listMeta:  { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },

  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Space.cardPadding,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[3],
  },

  seeMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[1],
    marginTop: Spacing[3],
  },
  seeMoreText: { ...Typography.label, color: Colors.primary, fontWeight: '600' },

  // Edit form
  editSection: {
    paddingHorizontal: Space.pagePadding,
    marginTop: Space.sectionGap,
    gap: Spacing[4],
  },
  fieldWrap: { gap: Spacing[1.5] },
  rowFields: { flexDirection: 'row', gap: Spacing[3] },
  halfField: { flex: 1, gap: Spacing[1.5] },
  input: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Space.inputPaddingH,
    paddingVertical: Space.inputPaddingV,
    ...Typography.input,
    color: Colors.textPrimary,
    minHeight: 52,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top', paddingTop: Spacing[3] },

  editActions: { flexDirection: 'row', gap: Spacing[3], marginTop: Spacing[2] },
  cancelBtn: {
    flex: 1, height: 52, borderRadius: Radius.md,
    backgroundColor: Colors.bg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  cancelBtnText: { ...Typography.button, color: Colors.textSecondary },
  saveBtn: {
    flex: 1, height: 52, borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtnText: { ...Typography.button, color: Palette.white },

  // Sign out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    marginHorizontal: Space.pagePadding,
    marginTop: Space.sectionGap,
    padding: Spacing[4],
    backgroundColor: Colors.errorLight,
    borderRadius: Radius.lg,
  },
  signOutText: { ...Typography.button, color: Colors.error },
});
