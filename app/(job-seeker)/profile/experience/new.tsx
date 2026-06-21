/**
 * Add Work Experience Screen
 * - Full form with validation
 * - Saves to Supabase experiences table
 * - "I currently work here" toggle hides end date
 * - Fully responsive
 */
import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Platform, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Building2, Briefcase, MapPin, Calendar,
  FileText, Check,
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
  multiline?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  error?: string;
}

function Field({ label, value, onChange, placeholder, keyboardType, multiline, required, icon, error }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={f.wrap}>
      <Text style={f.label}>
        {label}{required && <Text style={f.req}> *</Text>}
      </Text>
      <View style={[f.inputWrap, focused && f.focused, error && f.error, multiline && f.multiWrap]}>
        {icon && <View style={f.icon}>{icon}</View>}
        <TextInput
          style={[f.input, multiline && f.multiInput]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType={keyboardType || 'default'}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        />
      </View>
      {error && <Text style={f.errorText}>{error}</Text>}
    </View>
  );
}

export default function AddExperienceScreen() {
  const router = useRouter();
  const { jobSeeker } = useAuthStore();

  const [saving,      setSaving]      = useState(false);
  const [isCurrent,   setIsCurrent]   = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    company_name:  '',
    job_title:     '',
    location:      '',
    start_date:    '',
    end_date:      '',
    description:   '',
  });

  const set = (key: string) => (val: string) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.company_name.trim()) e.company_name = 'Company name is required';
    if (!form.job_title.trim())    e.job_title    = 'Job title is required';
    if (!form.start_date.trim())   e.start_date   = 'Start date is required';
    if (form.start_date && !/^\d{4}-\d{2}-\d{2}$/.test(form.start_date))
      e.start_date = 'Use format YYYY-MM-DD';
    if (!isCurrent && form.end_date && !/^\d{4}-\d{2}-\d{2}$/.test(form.end_date))
      e.end_date = 'Use format YYYY-MM-DD';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !jobSeeker) return;
    setSaving(true);
    const { error } = await supabase.from('experiences').insert({
      job_seeker_id: jobSeeker.id,
      company_name:  form.company_name.trim(),
      job_title:     form.job_title.trim(),
      location:      form.location.trim() || null,
      start_date:    form.start_date.trim(),
      end_date:      isCurrent ? null : (form.end_date.trim() || null),
      is_current:    isCurrent,
      description:   form.description.trim() || null,
    });
    setSaving(false);
    if (error) {
      Alert.alert('Error', 'Could not save experience. Please try again.');
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
          <Text style={s.title}>Add Experience</Text>
          <Text style={s.subtitle}>Add your work history</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Company & Role ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Position Details</Text>

          <Field
            label="Job Title"
            value={form.job_title}
            onChange={set('job_title')}
            placeholder="e.g. Senior Software Engineer"
            required
            icon={<Briefcase color="#94A3B8" size={16} strokeWidth={2} />}
            error={errors.job_title}
          />

          <Field
            label="Company Name"
            value={form.company_name}
            onChange={set('company_name')}
            placeholder="e.g. Andela Rwanda"
            required
            icon={<Building2 color="#94A3B8" size={16} strokeWidth={2} />}
            error={errors.company_name}
          />

          <Field
            label="Location"
            value={form.location}
            onChange={set('location')}
            placeholder="e.g. Kigali, Rwanda"
            icon={<MapPin color="#94A3B8" size={16} strokeWidth={2} />}
          />
        </View>

        {/* ── Dates ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Duration</Text>

          {/* Currently working toggle */}
          <View style={s.toggleRow}>
            <View style={s.toggleInfo}>
              <Text style={s.toggleLabel}>I currently work here</Text>
              <Text style={s.toggleSub}>Leave end date empty if ongoing</Text>
            </View>
            <Switch
              value={isCurrent}
              onValueChange={setIsCurrent}
              trackColor={{ false: '#E2E8F0', true: Colors.primaryLight }}
              thumbColor={isCurrent ? Colors.primary : '#94A3B8'}
            />
          </View>

          <View style={s.dateRow}>
            <View style={s.dateHalf}>
              <Field
                label="Start Date"
                value={form.start_date}
                onChange={set('start_date')}
                placeholder="YYYY-MM-DD"
                required
                icon={<Calendar color="#94A3B8" size={16} strokeWidth={2} />}
                error={errors.start_date}
              />
            </View>
            {!isCurrent && (
              <View style={s.dateHalf}>
                <Field
                  label="End Date"
                  value={form.end_date}
                  onChange={set('end_date')}
                  placeholder="YYYY-MM-DD"
                  icon={<Calendar color="#94A3B8" size={16} strokeWidth={2} />}
                  error={errors.end_date}
                />
              </View>
            )}
          </View>
        </View>

        {/* ── Description ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Description (optional)</Text>
          <Field
            label="What did you do?"
            value={form.description}
            onChange={set('description')}
            placeholder="Describe your responsibilities, achievements and impact…"
            multiline
            icon={<FileText color="#94A3B8" size={16} strokeWidth={2} />}
          />
        </View>

        {/* Save button */}
        <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          {saving ? (
            <ActivityIndicator color={Palette.white} />
          ) : (
            <View style={s.saveBtnInner}>
              <Check color={Palette.white} size={20} strokeWidth={2.5} />
              <Text style={s.saveBtnText}>Save Experience</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* Field sub-styles */
const f = StyleSheet.create({
  wrap:       { gap: 6, marginBottom: 16 },
  label:      { fontSize: 13, fontWeight: '600', color: '#334155' },
  req:        { color: '#EF4444' },
  inputWrap:  {
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
  multiWrap:  { alignItems: 'flex-start', paddingVertical: 12 },
  focused:    { borderColor: Colors.primary, backgroundColor: Colors.primaryLight + '33' },
  error:      { borderColor: '#EF4444', backgroundColor: '#FFF1F2' },
  icon:       { opacity: 0.7 },
  input:      { flex: 1, fontSize: 15, color: '#0F172A', padding: 0 },
  multiInput: { minHeight: 90, paddingTop: 2 },
  errorText:  { fontSize: 12, color: '#EF4444', fontWeight: '500' },
});

/* Screen styles */
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

  scroll: { padding: 20, gap: 0 },

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
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 16 },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleInfo: { flex: 1 },
  toggleLabel:{ fontSize: 14, fontWeight: '600', color: '#0F172A' },
  toggleSub:  { fontSize: 12, color: '#94A3B8', marginTop: 2 },

  dateRow:  { flexDirection: 'row', gap: 12 },
  dateHalf: { flex: 1 },

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
