import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Star, Plus, X, Check, Trash2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Skill } from '@/types/database';
import {
  Colors, Typography, Spacing, Radius, Space, G, Palette,
} from '@/constants/theme';

const PROFICIENCY = ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];

export default function SkillManagementScreen() {
  const router = useRouter();
  const { jobSeeker } = useAuthStore();
  const [allSkills,  setAllSkills]  = useState<Skill[]>([]);
  const [mySkills,   setMySkills]   = useState<any[]>([]);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [mode,       setMode]       = useState<'list'|'add'>('list');
  const [selected,   setSelected]   = useState<Skill | null>(null);
  const [prof,       setProf]       = useState(3);
  const [years,      setYears]      = useState(0);

  const fetchData = useCallback(async () => {
    if (!jobSeeker) return;
    setLoading(true);
    const [{ data: all }, { data: mine }] = await Promise.all([
      supabase.from('skills').select('*').order('name'),
      supabase.from('job_seeker_skills').select('*, skill:skills(*)').eq('job_seeker_id', jobSeeker.id),
    ]);
    if (all)  setAllSkills(all);
    if (mine) setMySkills(mine);
    setLoading(false);
  }, [jobSeeker?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addSkill = async () => {
    if (!jobSeeker || !selected) return;
    if (mySkills.some((s: any) => s.skill?.id === selected.id)) {
      Alert.alert('Already added', 'This skill is already on your profile.');
      return;
    }
    setSaving(true);
    await supabase.from('job_seeker_skills').insert({ job_seeker_id: jobSeeker.id, skill_id: selected.id, proficiency_level: prof, years_of_experience: years });
    setSaving(false);
    setMode('list'); setSelected(null); setProf(3); setYears(0); setSearch('');
    fetchData();
  };

  const removeSkill = (id: string) => {
    Alert.alert('Remove Skill', 'Remove this skill from your profile?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => { await supabase.from('job_seeker_skills').delete().eq('id', id); fetchData(); } },
    ]);
  };

  const available = allSkills
    .filter(s => !mySkills.some((m: any) => m.skill?.id === s.id))
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity style={G.backBtn} onPress={() => mode === 'add' ? setMode('list') : router.back()}>
          <ArrowLeft color={Colors.textPrimary} size={20} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{mode === 'add' ? 'Add Skill' : 'My Skills'}</Text>
        {mode === 'list' && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setMode('add')}>
            <Plus color={Palette.white} size={18} strokeWidth={2.5} />
          </TouchableOpacity>
        )}
        {mode === 'add' && <View style={{ width: 40 }} />}
      </View>

      {mode === 'list' ? (
        <>
          {loading ? (
            <View style={G.emptyCenter}><ActivityIndicator color={Colors.primary} /></View>
          ) : (
            <FlatList
              data={mySkills}
              keyExtractor={i => i.id}
              contentContainerStyle={styles.list}
              ListHeaderComponent={<Text style={styles.listCount}>{mySkills.length} skill{mySkills.length !== 1 ? 's' : ''}</Text>}
              renderItem={({ item }) => (
                <View style={styles.skillCard}>
                  <View style={styles.skillCardLeft}>
                    <Text style={styles.skillName}>{item.skill?.name}</Text>
                    <View style={styles.skillMeta}>
                      <Star color={Colors.warning} size={12} fill={Colors.warning} />
                      <Text style={styles.skillMetaText}>{PROFICIENCY[(item.proficiency_level || 3) - 1]}</Text>
                      {item.years_of_experience > 0 && (
                        <>
                          <Text style={styles.dot}>·</Text>
                          <Text style={styles.skillMetaText}>{item.years_of_experience} yr{item.years_of_experience !== 1 ? 's' : ''}</Text>
                        </>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeSkill(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Trash2 color={Colors.error} size={17} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <View style={G.emptyCenter}>
                  <Star color={Colors.textMuted} size={40} strokeWidth={1.5} />
                  <Text style={G.emptyTitle}>No skills yet</Text>
                  <Text style={G.emptyBody}>Tap + to add skills to your profile</Text>
                </View>
              }
            />
          )}
        </>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Search */}
          <View style={styles.searchWrap}>
            <Search color={Colors.textMuted} size={17} strokeWidth={2.5} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search skills…"
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X color={Colors.textMuted} size={16} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>

          {/* Skill grid */}
          <FlatList
            data={available}
            keyExtractor={i => i.id}
            contentContainerStyle={styles.addList}
            numColumns={2}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.skillChip, selected?.id === item.id && styles.skillChipActive]}
                onPress={() => setSelected(selected?.id === item.id ? null : item)}
              >
                <Text style={[styles.chipText, selected?.id === item.id && styles.chipTextActive]} numberOfLines={1}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />

          {/* Proficiency & years */}
          {selected && (
            <View style={styles.configPanel}>
              <Text style={styles.configTitle}>Configure: {selected.name}</Text>

              <Text style={styles.configLabel}>Proficiency Level</Text>
              <View style={styles.profRow}>
                {PROFICIENCY.map((p, i) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.profChip, prof === i + 1 && styles.profChipActive]}
                    onPress={() => setProf(i + 1)}
                  >
                    <Text style={[styles.profText, prof === i + 1 && styles.profTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.configLabel}>Years of Experience</Text>
              <View style={styles.yearsRow}>
                <TouchableOpacity style={styles.yearBtn} onPress={() => setYears(Math.max(0, years - 1))}>
                  <Text style={styles.yearBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.yearsVal}>{years}</Text>
                <TouchableOpacity style={styles.yearBtn} onPress={() => setYears(years + 1)}>
                  <Text style={styles.yearBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={addSkill} disabled={saving}>
                {saving ? <ActivityIndicator color={Palette.white} /> : (
                  <>
                    <Check color={Palette.white} size={18} strokeWidth={2.5} />
                    <Text style={styles.saveBtnText}>Add Skill</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { ...G.screen },
  navBar:    { ...G.rowBetween, paddingHorizontal: Space.pagePadding, paddingTop: Space.pageTop, paddingBottom: Spacing[3], backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  navTitle:  { ...Typography.h5, color: Colors.textPrimary },
  addBtn:    { width: 36, height: 36, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },

  list:       { padding: Space.pagePadding, paddingBottom: Space.listBottom },
  listCount:  { ...Typography.bodySm, color: Colors.textSecondary, marginBottom: Spacing[3] },

  skillCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Space.cardPadding, marginBottom: Space.cardGap, borderWidth: 1, borderColor: Colors.border },
  skillCardLeft: { flex: 1 },
  skillName:     { ...Typography.h5, color: Colors.textPrimary, marginBottom: 4 },
  skillMeta:     { flexDirection: 'row', alignItems: 'center', gap: Spacing[1.5] },
  skillMetaText: { ...Typography.caption, color: Colors.textMuted },
  dot:           { ...Typography.caption, color: Colors.textMuted },
  removeBtn:     { width: 36, height: 36, borderRadius: Radius.md, backgroundColor: Colors.errorLight, alignItems: 'center', justifyContent: 'center' },

  searchWrap:  { flexDirection: 'row', alignItems: 'center', margin: Space.pagePadding, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: Spacing[4], paddingVertical: Spacing[3], gap: Spacing[2.5] },
  searchInput: { flex: 1, ...Typography.body, color: Colors.textPrimary, padding: 0 },

  addList:     { paddingHorizontal: Space.pagePadding, paddingBottom: Spacing[6] },
  skillChip:   { flex: 1, margin: Spacing[1], paddingHorizontal: Spacing[3], paddingVertical: Spacing[2.5], borderRadius: Radius.full, backgroundColor: Colors.bgCard, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  skillChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText:        { ...Typography.label, color: Colors.textSecondary },
  chipTextActive:  { color: Colors.primary, fontWeight: '600' },

  configPanel: { backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.border, padding: Space.pagePadding, gap: Spacing[4] },
  configTitle: { ...Typography.h5, color: Colors.textPrimary },
  configLabel: { ...Typography.label, color: Colors.textSecondary },
  profRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  profChip:    { paddingHorizontal: Spacing[3], paddingVertical: Spacing[1.5], borderRadius: Radius.full, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border },
  profChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  profText:    { ...Typography.label, color: Colors.textSecondary },
  profTextActive: { color: Palette.white, fontWeight: '600' },
  yearsRow:    { flexDirection: 'row', alignItems: 'center', gap: Spacing[5], alignSelf: 'center' },
  yearBtn:     { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  yearBtnText: { ...Typography.h3, color: Colors.textSecondary },
  yearsVal:    { ...Typography.display, color: Colors.textPrimary, minWidth: 48, textAlign: 'center' },
  saveBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[2], height: 52, backgroundColor: Colors.primary, borderRadius: Radius.lg },
  saveBtnText: { ...Typography.button, color: Palette.white },
});
