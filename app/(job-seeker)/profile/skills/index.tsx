/**
 * Skills Management Screen
 * - Fetches all available skills from DB
 * - Shows user's current skills with proficiency
 * - Allows adding new skills with proficiency level + years
 * - Allows removing skills
 * - Fully responsive (phone / tablet)
 */
import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Dimensions, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Plus, Search, Star, Trash2, Check, X,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Skill } from '@/types/database';
import { Colors, Palette, Space } from '@/constants/theme';

const { width: SW } = Dimensions.get('window');

const PROFICIENCY_LABELS = ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];
const PROFICIENCY_COLORS = ['#94A3B8', '#60A5FA', '#34D399', '#F59E0B', '#8B5CF6'];

export default function SkillsScreen() {
  const router = useRouter();
  const { jobSeeker } = useAuthStore();

  const [allSkills,  setAllSkills]  = useState<Skill[]>([]);
  const [mySkills,   setMySkills]   = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [mode,       setMode]       = useState<'view' | 'add'>('view');
  const [search,     setSearch]     = useState('');
  const [selected,   setSelected]   = useState<Skill | null>(null);
  const [profLevel,  setProfLevel]  = useState(3);
  const [years,      setYears]      = useState(0);

  const loadData = useCallback(async () => {
    if (!jobSeeker) return;
    setLoading(true);
    const [{ data: all }, { data: mine }] = await Promise.all([
      supabase.from('skills').select('*').order('name'),
      supabase.from('job_seeker_skills')
        .select('id, proficiency_level, years_of_experience, skill:skills(id, name, category)')
        .eq('job_seeker_id', jobSeeker.id),
    ]);
    if (all)  setAllSkills(all);
    if (mine) setMySkills(mine);
    setLoading(false);
  }, [jobSeeker?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const addSkill = async () => {
    if (!jobSeeker || !selected) return;
    if (mySkills.some((s: any) => s.skill?.id === selected.id)) {
      Alert.alert('Already added', 'This skill is already on your profile.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('job_seeker_skills').insert({
      job_seeker_id:      jobSeeker.id,
      skill_id:           selected.id,
      proficiency_level:  profLevel,
      years_of_experience: years,
    });
    setSaving(false);
    if (error) { Alert.alert('Error', 'Could not add skill. Please try again.'); return; }
    setMode('view');
    setSelected(null);
    setProfLevel(3);
    setYears(0);
    setSearch('');
    loadData();
  };

  const removeSkill = (id: string, name: string) => {
    Alert.alert('Remove Skill', `Remove "${name}" from your profile?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          await supabase.from('job_seeker_skills').delete().eq('id', id);
          loadData();
        },
      },
    ]);
  };

  // Skills available to add (not yet added)
  const available = allSkills
    .filter(s => !mySkills.some((m: any) => m.skill?.id === s.id))
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => mode === 'add' ? (setMode('view'), setSelected(null)) : router.back()}
        >
          <ArrowLeft color="#0F172A" size={20} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.title}>{mode === 'add' ? 'Add Skill' : 'My Skills'}</Text>
          <Text style={s.subtitle}>
            {mode === 'add' ? 'Search and configure a skill' : `${mySkills.length} skill${mySkills.length !== 1 ? 's' : ''} added`}
          </Text>
        </View>
        {mode === 'view' && (
          <TouchableOpacity style={s.addBtn} onPress={() => setMode('add')}>
            <Plus color={Palette.white} size={18} strokeWidth={2.5} />
          </TouchableOpacity>
        )}
        {mode === 'add' && <View style={{ width: 40 }} />}
      </View>

      {/* ── View mode ── */}
      {mode === 'view' && (
        <FlatList
          data={mySkills}
          keyExtractor={i => i.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={loading ? (
            <View style={s.loadingWrap}><ActivityIndicator color={Colors.primary} /></View>
          ) : null}
          renderItem={({ item }) => {
            const lvl   = (item.proficiency_level || 3) - 1;
            const color = PROFICIENCY_COLORS[lvl];
            const label = PROFICIENCY_LABELS[lvl];
            return (
              <View style={s.skillCard}>
                <View style={[s.skillDot, { backgroundColor: color + '22' }]}>
                  <Star color={color} size={14} fill={color} />
                </View>
                <View style={s.skillInfo}>
                  <Text style={s.skillName}>{item.skill?.name}</Text>
                  <View style={s.skillMeta}>
                    <Text style={[s.profLabel, { color }]}>{label}</Text>
                    {item.years_of_experience > 0 && (
                      <>
                        <Text style={s.dot}>·</Text>
                        <Text style={s.yearsLabel}>
                          {item.years_of_experience} yr{item.years_of_experience !== 1 ? 's' : ''}
                        </Text>
                      </>
                    )}
                    {item.skill?.category && (
                      <>
                        <Text style={s.dot}>·</Text>
                        <Text style={s.catLabel}>{item.skill.category}</Text>
                      </>
                    )}
                  </View>
                </View>
                {/* Proficiency bar */}
                <View style={s.profBarTrack}>
                  {[1,2,3,4,5].map(i => (
                    <View
                      key={i}
                      style={[s.profBarSeg, { backgroundColor: i <= item.proficiency_level ? color : '#E2E8F0' }]}
                    />
                  ))}
                </View>
                <TouchableOpacity
                  style={s.removeBtn}
                  onPress={() => removeSkill(item.id, item.skill?.name)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Trash2 color="#EF4444" size={16} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={!loading ? (
            <View style={s.empty}>
              <Star color="#CBD5E1" size={40} strokeWidth={1.5} />
              <Text style={s.emptyTitle}>No skills yet</Text>
              <Text style={s.emptyBody}>Tap the + button to add your first skill</Text>
            </View>
          ) : null}
        />
      )}

      {/* ── Add mode ── */}
      {mode === 'add' && (
        <View style={{ flex: 1 }}>
          {/* Search */}
          <View style={s.searchWrap}>
            <Search color="#94A3B8" size={16} strokeWidth={2.5} />
            <TextInput
              style={s.searchInput}
              placeholder="Search skills (e.g. React, Python…)"
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <X color="#94A3B8" size={15} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>

          {/* Skill grid */}
          <FlatList
            data={available}
            keyExtractor={i => i.id}
            numColumns={2}
            contentContainerStyle={s.gridList}
            columnWrapperStyle={s.gridRow}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[s.skillChip, selected?.id === item.id && s.skillChipOn]}
                onPress={() => setSelected(selected?.id === item.id ? null : item)}
              >
                {selected?.id === item.id && (
                  <Check color={Colors.primary} size={13} strokeWidth={3} />
                )}
                <Text
                  style={[s.chipText, selected?.id === item.id && s.chipTextOn]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={s.noResults}>No skills match "{search}"</Text>
            }
          />

          {/* Config panel (shown when a skill is selected) */}
          {selected && (
            <View style={s.configPanel}>
              <Text style={s.configTitle}>{selected.name}</Text>

              {/* Proficiency */}
              <Text style={s.configLabel}>Proficiency Level</Text>
              <View style={s.profRow}>
                {PROFICIENCY_LABELS.map((label, i) => (
                  <TouchableOpacity
                    key={label}
                    style={[
                      s.profChip,
                      profLevel === i + 1 && { backgroundColor: PROFICIENCY_COLORS[i], borderColor: PROFICIENCY_COLORS[i] },
                    ]}
                    onPress={() => setProfLevel(i + 1)}
                  >
                    <Text style={[s.profChipText, profLevel === i + 1 && s.profChipTextOn]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Years */}
              <Text style={s.configLabel}>Years of Experience</Text>
              <View style={s.yearsRow}>
                <TouchableOpacity style={s.yearBtn} onPress={() => setYears(Math.max(0, years - 1))}>
                  <Text style={s.yearBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={s.yearsVal}>{years}</Text>
                <TouchableOpacity style={s.yearBtn} onPress={() => setYears(years + 1)}>
                  <Text style={s.yearBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* Save button */}
              <TouchableOpacity style={s.saveBtn} onPress={addSkill} disabled={saving}>
                {saving
                  ? <ActivityIndicator color={Palette.white} />
                  : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Check color={Palette.white} size={18} strokeWidth={2.5} />
                      <Text style={s.saveBtnText}>Add to Profile</Text>
                    </View>
                  )
                }
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
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
  headerCenter: { flex: 1 },
  title:        { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  subtitle:     { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  addBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },

  loadingWrap: { paddingTop: 60, alignItems: 'center' },
  list: { padding: 20, paddingBottom: 40 },

  // Skill card
  skillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
    ...Platform.select({
      ios:     { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 1 },
      default: { boxShadow: '0px 1px 4px rgba(15,23,42,0.05)' },
    }),
  },
  skillDot:   { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  skillInfo:  { flex: 1 },
  skillName:  { fontSize: 15, fontWeight: '600', color: '#0F172A', marginBottom: 3 },
  skillMeta:  { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  profLabel:  { fontSize: 12, fontWeight: '600' },
  dot:        { fontSize: 12, color: '#CBD5E1' },
  yearsLabel: { fontSize: 12, color: '#64748B' },
  catLabel:   { fontSize: 11, color: '#94A3B8' },
  profBarTrack:{ flexDirection: 'row', gap: 2 },
  profBarSeg: { width: 8, height: 4, borderRadius: 2 },
  removeBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#FFF1F2',
    alignItems: 'center', justifyContent: 'center',
  },

  // Empty
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  emptyBody:  { fontSize: 14, color: '#64748B', textAlign: 'center' },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderRadius: 14,
    margin: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#0F172A', padding: 0 },

  // Grid
  gridList: { paddingHorizontal: 20, paddingBottom: 16 },
  gridRow:  { gap: 10, marginBottom: 10 },
  skillChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Palette.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  skillChipOn: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText:    { fontSize: 13, color: '#475569', fontWeight: '600' },
  chipTextOn:  { color: Colors.primary },
  noResults: { textAlign: 'center', color: '#94A3B8', marginTop: 40, fontSize: 14 },

  // Config panel
  configPanel: {
    backgroundColor: Palette.white,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    padding: 20,
    gap: 14,
    ...Platform.select({
      ios:     { shadowColor: '#0F172A', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 4 },
      default: { boxShadow: '0px -2px 8px rgba(15,23,42,0.05)' },
    }),
  },
  configTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  configLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginTop: 4 },

  profRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  profChip: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  profChipText:   { fontSize: 12, color: '#64748B', fontWeight: '600' },
  profChipTextOn: { color: Palette.white },

  yearsRow: { flexDirection: 'row', alignItems: 'center', gap: 20, alignSelf: 'center' },
  yearBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  yearBtnText: { fontSize: 22, color: '#475569', lineHeight: 26 },
  yearsVal:    { fontSize: 28, fontWeight: '700', color: '#0F172A', minWidth: 48, textAlign: 'center' },

  saveBtn: {
    height: 52, borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: Palette.white },
});
