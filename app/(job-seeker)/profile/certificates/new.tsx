/**
 * Add Certificate Screen
 * - Full form with validation
 * - Saves to Supabase certificates table
 * - Responsive on all screen sizes
 */
import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Award, Building2, Calendar, Link2, Hash, Check,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Colors, Palette } from '@/constants/theme';

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
  required?: boolean;
  hint?: string;
  icon?: React.ReactNode;
  error?: string;
}

function Field({ label, value, onChange, placeholder, keyboardType, required, hint, icon, error }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={f.wrap}>
      <Text style={f.label}>
        {label}{required && <Text style={f.req}> *</Text>}
      </Text>
      <View style={[f.row, focused && f.focused, error && f.err]}>
        {icon && <View style={f.icon}>{icon}</View>}
        <TextInput
          style={f.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType={keyboardType || 'default'}
          autoCapitalize={keyboardType === 'url' || keyboardType === 'email-address' ? 'none' : 'sentences'}
          autoCorrect={keyboardType === 'url' ? false : true}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {error && <Text style={f.errText}>{error}</Text>}
      {hint && !error && <Text style={f.hint}>{hint}</Text>}
    </View>
  );
}

export default function AddCertificateScreen() {
  const router = useRouter();
  const { jobSeeker } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title:                '',
    issuing_organization: '',
    issue_date:           '',
    expiry_date:          '',
    credential_id:        '',
    certificate_url:      '',
  });

  const set = (key: string) => (val: string) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Certificate title is required';
    if (form.issue_date && !/^\d{4}-\d{2}-\d{2}$/.test(form.issue_date))
      e.issue_date = 'Use format YYYY-MM-DD';
    if (form.expiry_date && !/^\d{4}-\d{2}-\d{2}$/.test(form.expiry_date))
      e.expiry_date = 'Use format YYYY-MM-DD';
    if (form.certificate_url && !form.certificate_url.startsWith('http'))
      e.certificate_url = 'Must start with http:// or https://';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !jobSeeker) return;
    setSaving(true);
    const payload: any = { job_seeker_id: jobSeeker.id };
    Object.entries(form).forEach(([k, v]) => {
      if (v.trim()) payload[k] = v.trim();
    });
    const { error } = await supabase.from('certificates').insert(payload);
    setSaving(false);
    if (error) {
      Alert.alert('Error', 'Could not save certificate. Please try again.');
      return;
    }
    router.back();
  };

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ArrowLeft color="#0F172A" size={20} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.title}>Add Certificate</Text>
          <Text style={s.subtitle}>Add your certifications & achievements</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Core Info ── */}
        <View style={s.card}>
          <View style={s.cardTitleRow}>
            <View style={s.cardIconWrap}>
              <Award color={Colors.primary} size={18} strokeWidth={2} />
            </View>
            <Text style={s.cardTitle}>Certificate Details</Text>
          </View>

          <Field
            label="Certificate Title"
            value={form.title}
            onChange={set('title')}
            placeholder="e.g. AWS Solutions Architect – Associate"
            required
            icon={<Award color="#94A3B8" size={16} strokeWidth={2} />}
            error={errors.title}
          />

          <Field
            label="Issuing Organisation"
            value={form.issuing_organization}
            onChange={set('issuing_organization')}
            placeholder="e.g. Amazon Web Services"
            icon={<Building2 color="#94A3B8" size={16} strokeWidth={2} />}
          />
        </View>

        {/* ── Dates ── */}
        <View style={s.card}>
          <View style={s.cardTitleRow}>
            <View style={s.cardIconWrap}>
              <Calendar color="#059669" size={18} strokeWidth={2} />
            </View>
            <Text style={s.cardTitle}>Validity</Text>
          </View>

          <View style={s.row}>
            <View style={s.half}>
              <Field
                label="Issue Date"
                value={form.issue_date}
                onChange={set('issue_date')}
                placeholder="YYYY-MM-DD"
                icon={<Calendar color="#94A3B8" size={16} strokeWidth={2} />}
                error={errors.issue_date}
                hint="Leave blank if unknown"
              />
            </View>
            <View style={s.half}>
              <Field
                label="Expiry Date"
                value={form.expiry_date}
                onChange={set('expiry_date')}
                placeholder="YYYY-MM-DD"
                icon={<Calendar color="#94A3B8" size={16} strokeWidth={2} />}
                error={errors.expiry_date}
                hint="Leave blank if no expiry"
              />
            </View>
          </View>
        </View>

        {/* ── Verification ── */}
        <View style={s.card}>
          <View style={s.cardTitleRow}>
            <View style={[s.cardIconWrap, { backgroundColor: '#F0FDF4' }]}>
              <Hash color="#059669" size={18} strokeWidth={2} />
            </View>
            <Text style={s.cardTitle}>Verification (optional)</Text>
          </View>

          <Field
            label="Credential ID"
            value={form.credential_id}
            onChange={set('credential_id')}
            placeholder="e.g. ABC-123456-XYZW"
            icon={<Hash color="#94A3B8" size={16} strokeWidth={2} />}
            hint="Usually found on your certificate"
          />

          <Field
            label="Certificate URL"
            value={form.certificate_url}
            onChange={set('certificate_url')}
            placeholder="https://verify.example.com/cert/..."
            keyboardType="url"
            icon={<Link2 color="#94A3B8" size={16} strokeWidth={2} />}
            error={errors.certificate_url}
            hint="Link to verify or view your certificate"
          />
        </View>

        {/* Save */}
        <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          {saving ? (
            <ActivityIndicator color={Palette.white} />
          ) : (
            <View style={s.saveBtnInner}>
              <Check color={Palette.white} size={20} strokeWidth={2.5} />
              <Text style={s.saveBtnText}>Save Certificate</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const f = StyleSheet.create({
  wrap:  { gap: 6, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155' },
  req:   { color: '#EF4444' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: Palette.white,
    paddingHorizontal: 14,
    minHeight: 50,
    gap: 10,
  },
  focused:  { borderColor: Colors.primary, backgroundColor: Colors.primaryLight + '33' },
  err:      { borderColor: '#EF4444', backgroundColor: '#FFF1F2' },
  icon:     { opacity: 0.7 },
  input:    { flex: 1, fontSize: 15, color: '#0F172A', padding: 0, paddingVertical: 12 },
  errText:  { fontSize: 12, color: '#EF4444', fontWeight: '500' },
  hint:     { fontSize: 11, color: '#94A3B8' },
});

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: Palette.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  headerText: { flex: 1 },
  title:      { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  subtitle:   { fontSize: 12, color: '#94A3B8', marginTop: 2 },

  scroll: { padding: 20 },

  card: {
    backgroundColor: Palette.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios:     { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 1 },
      default: { boxShadow: '0px 2px 6px rgba(15,23,42,0.04)' },
    }),
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  cardIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },

  row:  { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },

  saveBtn: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...Platform.select({
      ios:     { shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
      android: { elevation: 4 },
      default: { boxShadow: '0px 4px 12px rgba(37,99,235,0.3)' },
    }),
  },
  saveBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  saveBtnText:  { fontSize: 17, fontWeight: '700', color: Palette.white },
});
