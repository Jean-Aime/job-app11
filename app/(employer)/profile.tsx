import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Building2, Phone, MapPin, Globe, Edit3,
  CheckCircle, AlertCircle, Clock, LogOut, ChevronRight, Shield,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { useSignOut } from '@/hooks/useSignOut';
import {
  Colors, Typography, Spacing, Radius, Space, G, Palette, VerificationConfig,
} from '@/constants/theme';

export default function EmployerProfileScreen() {
  const { user, employer, fetchEmployerProfile } = useAuthStore();
  const { handleSignOut } = useSignOut();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    company_name: '', industry: '', website: '', company_description: '',
    address: '', city: '', country: '',
    contact_person_name: '', contact_person_phone: '', contact_person_email: '',
  });

  useEffect(() => {
    if (employer) {
      setForm({
        company_name:          employer.company_name           || '',
        industry:              employer.industry               || '',
        website:               employer.website               || '',
        company_description:   employer.company_description   || '',
        address:               employer.address               || '',
        city:                  employer.city                  || '',
        country:               employer.country               || '',
        contact_person_name:   employer.contact_person_name   || '',
        contact_person_phone:  employer.contact_person_phone  || '',
        contact_person_email:  employer.contact_person_email  || '',
      });
    }
  }, [employer]);

  const handleSave = async () => {
    if (!employer) return;
    setLoading(true);
    const { error } = await supabase.from('employers').update({ ...form }).eq('id', employer.id);
    setLoading(false);
    if (error) { Alert.alert('Error', 'Failed to save.'); }
    else { setEditing(false); fetchEmployerProfile(); }
  };

  if (!employer) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={G.emptyCenter}><ActivityIndicator size="large" color={Colors.employer} /></View>
      </SafeAreaView>
    );
  }

  const vcKey = employer.verification_status || 'pending';
  const vc    = VerificationConfig[vcKey] || VerificationConfig.pending;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.pageTitle}>Company Profile</Text>
        </View>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.avatarWrap}>
            {employer.company_logo_url
              ? <Image source={{ uri: employer.company_logo_url }} style={styles.avatar} />
              : <View style={styles.avatarFallback}><Building2 color={Palette.white} size={36} strokeWidth={1.5} /></View>}
            <TouchableOpacity style={[styles.editAvatar, { backgroundColor: Colors.employer }]}>
              <Edit3 color={Palette.white} size={14} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <Text style={styles.companyName}>{form.company_name || 'Your Company'}</Text>
          <Text style={styles.companyEmail}>{user?.email}</Text>

          <View style={[styles.verBadge, { backgroundColor: vc.bg }]}>
            <View style={[styles.verDot, { backgroundColor: vc.color }]} />
            <Text style={[styles.verText, { color: vc.color }]}>{vc.label}</Text>
          </View>
        </View>

        {/* Edit form */}
        {editing ? (
          <View style={styles.editSection}>
            <Text style={styles.sectionTitle}>Edit Company Profile</Text>
            {[
              { key: 'company_name',        label: 'Company Name *' },
              { key: 'industry',            label: 'Industry' },
              { key: 'website',             label: 'Website',       keyboard: 'url' as const },
              { key: 'contact_person_name', label: 'Contact Name' },
              { key: 'contact_person_phone',label: 'Contact Phone', keyboard: 'phone-pad' as const },
              { key: 'contact_person_email',label: 'Contact Email', keyboard: 'email-address' as const },
            ].map(f => (
              <View key={f.key} style={styles.fieldWrap}>
                <Text style={G.inputLabel}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  value={(form as any)[f.key]}
                  onChangeText={v => setForm({ ...form, [f.key]: v })}
                  keyboardType={f.keyboard}
                  autoCapitalize={f.keyboard === 'url' || f.keyboard === 'email-address' ? 'none' : 'sentences'}
                />
              </View>
            ))}

            <View style={styles.rowFields}>
              {['city', 'country'].map(k => (
                <View key={k} style={styles.halfField}>
                  <Text style={G.inputLabel}>{k.charAt(0).toUpperCase() + k.slice(1)}</Text>
                  <TextInput style={styles.input} value={(form as any)[k]} onChangeText={v => setForm({ ...form, [k]: v })} />
                </View>
              ))}
            </View>

            <View style={styles.fieldWrap}>
              <Text style={G.inputLabel}>Company Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.company_description}
                onChangeText={v => setForm({ ...form, company_description: v })}
                multiline numberOfLines={4} textAlignVertical="top"
              />
            </View>

            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: Colors.employer }]} onPress={handleSave} disabled={loading}>
                {loading ? <ActivityIndicator color={Palette.white} /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          </View>

        ) : (
          <>
            {/* Company info */}
            <View style={styles.section}>
              <View style={G.sectionHeader}>
                <Text style={G.sectionTitle}>Company Information</Text>
                <TouchableOpacity onPress={() => setEditing(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Edit3 color={Colors.employer} size={18} strokeWidth={2} />
                </TouchableOpacity>
              </View>
              <View style={styles.infoCard}>
                {[
                  { icon: Building2, val: form.industry || 'Add industry' },
                  { icon: MapPin,    val: [form.city, form.country].filter(Boolean).join(', ') || 'Add location' },
                  { icon: Globe,     val: form.website || 'Add website' },
                ].map(({ icon: Icon, val }, i) => (
                  <View key={i} style={[styles.infoRow, i > 0 && styles.infoRowBorder]}>
                    <Icon color={Colors.textMuted} size={18} strokeWidth={2} />
                    <Text style={styles.infoVal}>{val}</Text>
                  </View>
                ))}
              </View>
              {form.company_description ? (
                <View style={styles.descCard}>
                  <Text style={styles.descText}>{form.company_description}</Text>
                </View>
              ) : null}
            </View>

            {/* Contact */}
            <View style={styles.section}>
              <View style={G.sectionHeader}>
                <Text style={G.sectionTitle}>Contact Person</Text>
                <TouchableOpacity onPress={() => setEditing(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Edit3 color={Colors.employer} size={18} strokeWidth={2} />
                </TouchableOpacity>
              </View>
              <View style={styles.infoCard}>
                {[
                  { icon: Phone, val: form.contact_person_phone || 'Add phone' },
                ].map(({ icon: Icon, val }, i) => (
                  <View key={i} style={[styles.infoRow, i > 0 && styles.infoRowBorder]}>
                    <Icon color={Colors.textMuted} size={18} strokeWidth={2} />
                    <Text style={styles.infoVal}>{val}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Verification */}
            <View style={styles.section}>
              <Text style={[G.sectionTitle, { marginBottom: Spacing[3] }]}>Verification</Text>
              <TouchableOpacity style={styles.verCard}>
                <View style={[G.iconMd, { backgroundColor: Colors.employerLight }]}>
                  <Shield color={Colors.employer} size={20} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.verCardTitle}>Upload Documents</Text>
                  <Text style={styles.verCardDesc}>Business registration & tax documents</Text>
                </View>
                <ChevronRight color={Colors.textMuted} size={18} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Sign out */}
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

  topBar: { ...G.rowBetween, paddingHorizontal: Space.pagePadding, paddingTop: Space.pageTop, paddingBottom: Spacing[3] },
  pageTitle: { ...Typography.h2, color: Colors.textPrimary },

  heroCard: {
    alignItems: 'center', marginHorizontal: Space.pagePadding, marginBottom: Spacing[2],
    padding: Space.cardPaddingLg,
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border,
  },
  avatarWrap:    { position: 'relative', marginBottom: Spacing[4] },
  avatar:        { width: 96, height: 96, borderRadius: 48 },
  avatarFallback:{ width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.employer, alignItems: 'center', justifyContent: 'center' },
  editAvatar:    { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.bgCard },
  companyName:   { ...Typography.h3, color: Colors.textPrimary, marginBottom: Spacing[0.5] },
  companyEmail:  { ...Typography.bodySm, color: Colors.textSecondary, marginBottom: Spacing[4] },
  verBadge:      { flexDirection: 'row', alignItems: 'center', gap: Spacing[1.5], paddingHorizontal: Spacing[3], paddingVertical: Spacing[1.5], borderRadius: Radius.full },
  verDot:        { width: 6, height: 6, borderRadius: 3 },
  verText:       { ...Typography.label, fontWeight: '600' },

  section:       { paddingHorizontal: Space.pagePadding, marginTop: Space.sectionGap },
  sectionTitle:  { ...G.sectionTitle },

  infoCard:      { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Space.cardPadding },
  infoRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], paddingVertical: Spacing[3.5] },
  infoRowBorder: { borderTopWidth: 1, borderTopColor: Colors.divider },
  infoVal:       { ...Typography.body, color: Colors.textPrimary, flex: 1 },
  descCard:      { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Space.cardPadding, marginTop: Spacing[3] },
  descText:      { ...Typography.body, color: Colors.textSecondary, lineHeight: 24 },

  verCard:       { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Space.cardPadding, borderWidth: 1, borderColor: Colors.border, gap: Spacing[3] },
  verCardTitle:  { ...Typography.h5, color: Colors.textPrimary },
  verCardDesc:   { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },

  editSection:   { paddingHorizontal: Space.pagePadding, marginTop: Space.sectionGap, gap: Spacing[4] },
  fieldWrap:     { gap: Spacing[1.5] },
  rowFields:     { flexDirection: 'row', gap: Spacing[3] },
  halfField:     { flex: 1, gap: Spacing[1.5] },
  input:         { backgroundColor: Colors.bgCard, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Space.inputPaddingH, paddingVertical: Space.inputPaddingV, ...Typography.input, color: Colors.textPrimary, minHeight: 52 },
  textArea:      { minHeight: 100, textAlignVertical: 'top', paddingTop: Spacing[3] },
  editActions:   { flexDirection: 'row', gap: Spacing[3], marginTop: Spacing[2] },
  cancelBtn:     { flex: 1, height: 52, borderRadius: Radius.md, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  cancelBtnText: { ...Typography.button, color: Colors.textSecondary },
  saveBtn:       { flex: 1, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  saveBtnText:   { ...Typography.button, color: Palette.white },

  signOutBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[2], marginHorizontal: Space.pagePadding, marginTop: Space.sectionGap, padding: Spacing[4], backgroundColor: Colors.errorLight, borderRadius: Radius.lg },
  signOutText:   { ...Typography.button, color: Colors.error },
});
