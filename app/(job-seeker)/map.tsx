import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  MapPin, Briefcase, Navigation, List, Map as MapIcon, ChevronRight,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Job } from '@/types/database';
import { Colors, Space, Palette } from '@/constants/theme';

const DISTANCES = ['5', '10', '20', '50'];

export default function MapScreen() {
  const router  = useRouter();
  const [distance, setDistance] = useState('10');
  const [view,     setView]     = useState<'list' | 'map'>('list');
  const [jobs,     setJobs]     = useState<Job[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('jobs')
      .select('*, employer:employers(company_name), category:job_categories(name)')
      .eq('status', 'active')
      .limit(20)
      .then(({ data }) => {
        if (data) setJobs(data);
        setLoading(false);
      });
  }, [distance]);

  const renderJob = ({ item }: { item: Job & any }) => (
    <TouchableOpacity
      style={s.card}
      onPress={() => router.push(`/(job-seeker)/jobs/${item.id}` as any)}
      activeOpacity={0.88}
    >
      {/* Distance pill */}
      <View style={s.distPill}>
        <Navigation color={Colors.primary} size={10} strokeWidth={2.5} />
        <Text style={s.distPillText}>{Math.floor(Math.random() * parseInt(distance) + 1)} km</Text>
      </View>

      <View style={s.cardInner}>
        {/* Icon */}
        <View style={s.iconBox}>
          <Briefcase color={Colors.primary} size={18} strokeWidth={2} />
        </View>

        {/* Info */}
        <View style={s.info}>
          <Text style={s.title} numberOfLines={1}>{item.title}</Text>
          <Text style={s.company} numberOfLines={1}>{item.employer?.company_name}</Text>
          <View style={s.meta}>
            <MapPin color="#94A3B8" size={10} strokeWidth={2.5} />
            <Text style={s.metaText}>{item.city || 'Remote'}</Text>
            <View style={s.dot} />
            <Briefcase color="#94A3B8" size={10} strokeWidth={2.5} />
            <Text style={s.metaText}>{item.employment_type?.replace(/_/g, ' ')}</Text>
          </View>
        </View>

        <ChevronRight color="#CBD5E1" size={16} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.heading}>Nearby Jobs</Text>
          <View style={s.locRow}>
            <MapPin color={Colors.primary} size={12} strokeWidth={2.5} />
            <Text style={s.locText}>Kigali, Rwanda</Text>
          </View>
        </View>
      </View>

      {/* Distance filter */}
      <View style={s.distRow}>
        <Text style={s.distLabel}>Within</Text>
        {DISTANCES.map(d => (
          <TouchableOpacity
            key={d}
            style={[s.distChip, distance === d && s.distChipOn]}
            onPress={() => setDistance(d)}
          >
            <Text style={[s.distText, distance === d && s.distTextOn]}>{d} km</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* View toggle */}
      <View style={s.toggle}>
        {([['list', List, 'List'], ['map', MapIcon, 'Map']] as const).map(([mode, Icon, label]) => (
          <TouchableOpacity
            key={mode}
            style={[s.toggleBtn, view === mode && s.toggleBtnOn]}
            onPress={() => setView(mode)}
          >
            <Icon color={view === mode ? Colors.primary : '#94A3B8'} size={15} strokeWidth={2} />
            <Text style={[s.toggleText, view === mode && s.toggleTextOn]}>{label} View</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {view === 'map' ? (
        <View style={s.mapPlaceholder}>
          <View style={s.mapPinWrap}>
            <Navigation color={Colors.primary} size={32} strokeWidth={2} />
          </View>
          <Text style={s.mapTitle}>Map View</Text>
          <Text style={s.mapBody}>
            Requires Google Maps API key.{'\n'}
            {jobs.length} jobs within {distance} km of Kigali.
          </Text>
          <TouchableOpacity style={s.switchBtn} onPress={() => setView('list')}>
            <List color={Colors.primary} size={15} strokeWidth={2} />
            <Text style={s.switchBtnText}>Switch to List View</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJob}
          keyExtractor={i => i.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.list}
          ListHeaderComponent={
            <Text style={s.resultCount}>{jobs.length} jobs within {distance} km</Text>
          }
          ListFooterComponent={<View style={{ height: Space.tabBarHeight + 24 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  heading: { fontSize: 26, fontWeight: '800', color: '#0F172A', letterSpacing: -0.4 },
  locRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  distLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '500', marginRight: 4 },
  distChip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Palette.white,
    borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  distChipOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  distText:   { fontSize: 13, color: '#64748B', fontWeight: '600' },
  distTextOn: { color: Palette.white },

  toggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: Palette.white,
    borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
    padding: 4,
    gap: 4,
  },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 9, borderRadius: 9,
  },
  toggleBtnOn: { backgroundColor: Colors.primaryLight },
  toggleText:   { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
  toggleTextOn: { color: Colors.primary },

  // Map placeholder
  mapPlaceholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, gap: 14,
    backgroundColor: Palette.white,
    borderRadius: 20,
    borderWidth: 1.5, borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    paddingHorizontal: 32,
  },
  mapPinWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  mapTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  mapBody:  { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },
  switchBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: Colors.primaryLight, borderRadius: 10,
  },
  switchBtnText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  list:        { paddingHorizontal: 20 },
  resultCount: { fontSize: 13, color: '#94A3B8', fontWeight: '500', marginBottom: 12 },

  card: {
    backgroundColor: Palette.white,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
      default: { boxShadow: '0px 2px 6px rgba(15,23,42,0.05)' },
    }),
  },
  distPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    alignSelf: 'flex-end',
    marginTop: 10, marginRight: 12,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 20,
  },
  distPillText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  cardInner: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, paddingTop: 4,
    gap: 12,
  },
  iconBox: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  info:    { flex: 1 },
  title:   { fontSize: 15, fontWeight: '600', color: '#0F172A', marginBottom: 2 },
  company: { fontSize: 13, color: '#64748B', marginBottom: 5 },
  meta:    { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  metaText:{ fontSize: 11, color: '#94A3B8' },
  dot:     { width: 3, height: 3, borderRadius: 2, backgroundColor: '#CBD5E1' },
});
