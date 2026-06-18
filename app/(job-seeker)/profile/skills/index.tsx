import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Search,
  Star,
  Plus,
  X,
  Check,
  Trash2,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Skill } from '@/types/database';

export default function SkillManagementScreen() {
  const router = useRouter();
  const { jobSeeker } = useAuthStore();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<any[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [proficiency, setProficiency] = useState(3);
  const [yearsExperience, setYearsExperience] = useState(0);

  useEffect(() => {
    fetchData();
  }, [jobSeeker]);

  const fetchData = async () => {
    if (!jobSeeker) return;

    setLoading(true);

    // Fetch all available skills
    const { data: skillsData } = await supabase
      .from('skills')
      .select('*')
      .order('name');

    if (skillsData) setSkills(skillsData);

    // Fetch user's current skills
    const { data: userSkillsData } = await supabase
      .from('job_seeker_skills')
      .select(`
        id,
        proficiency_level,
        years_of_experience,
        skill:skills(*)
      `)
      .eq('job_seeker_id', jobSeeker.id);

    if (userSkillsData) setUserSkills(userSkillsData);

    setLoading(false);
  };

  const addSkill = async () => {
    if (!jobSeeker || !selectedSkill) return;

    // Check if skill already exists
    const exists = userSkills.some((us: any) => us.skill?.id === selectedSkill.id);
    if (exists) {
      Alert.alert('Error', 'This skill is already added to your profile');
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('job_seeker_skills').insert({
      job_seeker_id: jobSeeker.id,
      skill_id: selectedSkill.id,
      proficiency_level: proficiency,
      years_of_experience: yearsExperience,
    });

    setSaving(false);
    if (error) {
      Alert.alert('Error', 'Failed to add skill');
    } else {
      setShowAddModal(false);
      setSelectedSkill(null);
      setProficiency(3);
      setYearsExperience(0);
      fetchData();
    }
  };

  const removeSkill = async (userSkillId: string) => {
    Alert.alert('Remove Skill', 'Are you sure you want to remove this skill?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase
            .from('job_seeker_skills')
            .delete()
            .eq('id', userSkillId);

          if (error) {
            Alert.alert('Error', 'Failed to remove skill');
          } else {
            fetchData();
          }
        },
      },
    ]);
  };

  const filteredSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableSkills = filteredSkills.filter(
    (skill) => !userSkills.some((us: any) => us.skill?.id === skill.id)
  );

  const proficiencyLabels = ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];

  const renderUserSkill = ({ item }: { item: any }) => (
    <View style={styles.userSkillCard}>
      <View style={styles.userSkillInfo}>
        <Text style={styles.skillName}>{item.skill?.name}</Text>
        <View style={styles.skillMeta}>
          <Star color="#F59E0B" size={14} />
          <Text style={styles.skillMetaText}>
            {proficiencyLabels[item.proficiency_level - 1]}
          </Text>
          {item.years_of_experience > 0 && (
            <>
              <Text style={styles.skillMetaDot}>-</Text>
              <Text style={styles.skillMetaText}>
                {item.years_of_experience} year{item.years_of_experience !== 1 ? 's' : ''}
              </Text>
            </>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeSkill(item.id)}
      >
        <Trash2 color="#EF4444" size={18} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Skills</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus color="#2563EB" size={24} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : showAddModal ? (
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Skill</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X color="#64748B" size={24} />
            </TouchableOpacity>
          </View>

          {/* Search Skills */}
          <View style={styles.searchContainer}>
            <Search color="#94A3B8" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search skills..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Skill Selection */}
          <View style={styles.skillGrid}>
            {availableSkills.slice(0, 12).map((skill) => (
              <TouchableOpacity
                key={skill.id}
                style={[
                  styles.skillChip,
                  selectedSkill?.id === skill.id && styles.skillChipSelected,
                ]}
                onPress={() => setSelectedSkill(skill)}
              >
                <Text
                  style={[
                    styles.skillChipText,
                    selectedSkill?.id === skill.id && styles.skillChipTextSelected,
                  ]}
                >
                  {skill.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedSkill && (
            <View style={styles.proficiencySection}>
              <Text style={styles.sectionLabel}>Proficiency Level</Text>
              <View style={styles.proficiencyOptions}>
                {proficiencyLabels.map((label, index) => (
                  <TouchableOpacity
                    key={label}
                    style={[
                      styles.proficiencyOption,
                      proficiency === index + 1 && styles.proficiencyOptionSelected,
                    ]}
                    onPress={() => setProficiency(index + 1)}
                  >
                    <Text
                      style={[
                        styles.proficiencyOptionText,
                        proficiency === index + 1 && styles.proficiencyOptionTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionLabel}>Years of Experience</Text>
              <View style={styles.yearsInput}>
                <TouchableOpacity
                  style={styles.yearButton}
                  onPress={() => setYearsExperience(Math.max(0, yearsExperience - 1))}
                >
                  <Text style={styles.yearButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.yearsValue}>{yearsExperience}</Text>
                <TouchableOpacity
                  style={styles.yearButton}
                  onPress={() => setYearsExperience(yearsExperience + 1)}
                >
                  <Text style={styles.yearButtonText}>+</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={addSkill}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Check color="#FFFFFF" size={20} />
                    <Text style={styles.saveButtonText}>Add Skill</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <>
          <Text style={styles.subtitle}>
            {userSkills.length} skill{userSkills.length !== 1 ? 's' : ''} added
          </Text>

          <FlatList
            data={userSkills}
            renderItem={renderUserSkill}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Star color="#CBD5E1" size={48} />
                <Text style={styles.emptyStateTitle}>No Skills Added</Text>
                <Text style={styles.emptyStateText}>
                  Add your skills to improve job matches
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => setShowAddModal(true)}
                >
                  <Plus color="#FFFFFF" size={20} />
                  <Text style={styles.emptyButtonText}>Add Your First Skill</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  addButton: {
    padding: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  userSkillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userSkillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  skillMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  skillMetaText: {
    fontSize: 13,
    color: '#64748B',
  },
  skillMetaDot: {
    fontSize: 13,
    color: '#CBD5E1',
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  skillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 8,
  },
  skillChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  skillChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  skillChipText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  skillChipTextSelected: {
    color: '#2563EB',
  },
  proficiencySection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 10,
  },
  proficiencyOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  proficiencyOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  proficiencyOptionSelected: {
    backgroundColor: '#2563EB',
  },
  proficiencyOptionText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  proficiencyOptionTextSelected: {
    color: '#FFFFFF',
  },
  yearsInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  yearButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearButtonText: {
    fontSize: 24,
    color: '#64748B',
    fontWeight: '600',
  },
  yearsValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    minWidth: 60,
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
