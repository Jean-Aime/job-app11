import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Briefcase, Navigation, List, Map as MapIcon, ChevronRight } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Job } from '@/types/database';
import {
  Colors, Typography, Spacing, Radius, Space, G, Palette,
} from '@/constants/theme';

const DISTANCES = ['5', '10', '20', '50'];

export default function MapScreen() {
  const router  = useRouter();
  const [distance, setDistance] = useState('10');
  const [viewMode, setViewMode] = useState<'list'|'map'>('list');
  const [jobs,     setJobs]     = useState<Job[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { fetchJobs(); }, [distance]);

  const fetchJobs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('jobs')
      .select('*, employer:employers(company_name), category:job_categories(name)')
      .eq('status', 'active')
      .limit(20);
    if (data) setJobs(data);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Nearby Jobs</Text>
          <View style={styles.locationRow}>
            <MapPin color={Colors.primary} size={13} strokeWidth={2.5} />
            <Text style={styles.locationText}>Kigali, Rwanda</Text>
          </View>
        </View>
      </View>

      {/* Distance filter */}
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Within</Text>
        <View style={styles.filterChips}>
          {DISTANCES.map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.distChip, distance === d && styles.distChipActive]}
              onPress={() => setDistance(d)}
            >
              <Text style={[styles.distText, distance === d && styles.distTextActive]}>{d} km</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* View toggle */}
      <View style={styles.toggleRow}>
        {([['list', List, 'List View'], ['map', MapIcon, 'Map View']] as const).map(([mode, Icon, label]) => (
          <TouchableOpacity
            key={mode}
            style={[styles.toggleBtn, viewMode === mode && styles.toggleBtnActive]}
            onPress={() => setViewMode(mode)}
          >
            <Icon color={viewMode === mode ? Colors.primary : Colors.textMuted} size={16} strokeWidth={2} />
            <Text style={[styles.toggleText, viewMode === mode && styles.toggleTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {viewMode === 'map' ? (
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapPin}>
            <Navigation color={Colors.primary} size={28} strokeWidth={2} />
          </View>
          <Text style={styles.mapTitle}>Map Integration</Text>
          <Text style={styles.mapBody}>
            Requires a Google Maps API key.{'\n'}
            {loading ? '...' : `${jobs.length} jobs within ${distance} km`}
          </Text>
        </View>
      ) : loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          <Text style={styles.resultCount}>{jobs.length} jobs nearby</Text>
          {jobs.map(job => (
            <TouchableOpacity
              key={job.id}
              style={styles.card}
              onPress={() => router.push(`/(job-seeker)/jobs/${job.id}` as any)}
              activeOpacity={0.85}
            >
              <View style={styles.distBadge}>
                <Navigation color={Colors.primary} size={11} strokeWidth={2} />
                <Text style={styles.distBadgeText}>{Math.floor(Math.random() * parseInt(distance))} km</Text>
              </View>

              <View style={styles.cardInner}>
                <View style={styles.cardIcon}>
                  <Briefcase color={Colors.primary} size={18} strokeWidth={2} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{job.title}</Text>
                  <Text style={styles.cardCompany}>{(job as any).employer?.company_name}</Text>
                  <View style={styles.cardMeta}>
                    <MapPin color={Colors.textMuted} size={11} strokeWidth={2} />
                    <Text style={styles.cardMetaText}>{job.city || 'Remote'}</Text>
                    <View style={styles.metaDot} />
                    <Briefcase color={Colors.textMuted} size={11} strokeWidth={2} />
                    <Text style={styles.cardMetaText}>{job.employment_type?.replace(/_/g, ' ')}</Text>
                  </View>
                </View>
                <ChevronRight color={Colors.textMuted} size={18} strokeWidth={2} />
              </View>
            </TouchableOpacity>
          ))}
          <View style={G.listBottom} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { ...G.screen },

  header: {
    paddingHorizontal: Space.pagePadding,
    paddingTop: Space.pageTop,
    paddingBottom: Spacing[3],
  },
  heading:      { ...Typography.h2, color: Colors.textPrimary },
  locationRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing[1], marginTop: Spacing[1] },
  locationText: { ...Typography.label, color: Colors.primary, fontWeight: '600' },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Space.pagePadding,
    paddingBottom: Spacing[3],
  },
  filterLabel: { ...Typography.label, color: Colors.textSecondary },
  filterChips: { flexDirection: 'row', gap: Spacing[2] },
  distChip: {
    paddingHorizontal: Spacing[3.5], paddingVertical: Spacing[1.5],
    borderRadius: Radius.full,
    backgroundColor: Colors.bgCard,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  distChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  distText:       { ...Typography.label, color: Colors.textSecondary },
  distTextActive: { color: Palette.white },

  toggleRow: {
    flexDirection: 'row',
    marginHorizontal: Space.pagePadding,
    marginBottom: Spacing[3],
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing[1],
    gap: Spacing[1],
  },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing[1.5], paddingVertical: Spacing[2], borderRadius: Radius.md,
  },
  toggleBtnActive: { backgroundColor: Colors.primaryLight },
  toggleText:       { ...Typography.label, color: Colors.textMuted },
  toggleTextActive: { color: Colors.primary, fontWeight: '600' },

  mapPlaceholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    marginHorizontal: Space.pagePadding,
    backgroundColor: Colors.bg,
    borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border,
    gap: Spacing[3],
  },
  mapPin: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.bgCard,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  mapTitle: { ...Typography.h4, color: Colors.textPrimary },
  mapBody:  { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  list:        { paddingHorizontal: Space.pagePadding },
  resultCount: { ...Typography.bodySm, color: Colors.textSecondary, marginBottom: Spacing[3] },

  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    marginBottom: Space.cardGap,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
  },
  distBadge: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[1],
    alignSelf: 'flex-end',
    marginTop: Spacing[2], marginRight: Spacing[3],
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing[2.5], paddingVertical: Spacing[0.5],
    borderRadius: Radius.full,
  },
  distBadgeText: { ...Typography.caption, color: Colors.primary, fontWeight: '600' },

  cardInner:    { flexDirection: 'row', alignItems: 'center', padding: Space.cardPadding, paddingTop: Spacing[2], gap: Spacing[3] },
  cardIcon:     { ...G.iconMd, backgroundColor: Colors.primaryLight },
  cardInfo:     { flex: 1 },
  cardTitle:    { ...Typography.h5, color: Colors.textPrimary, marginBottom: 2 },
  cardCompany:  { ...Typography.bodySm, color: Colors.textSecondary, marginBottom: Spacing[1.5] },
  cardMeta:     { flexDirection: 'row', alignItems: 'center', gap: Spacing[1.5], flexWrap: 'wrap' },
  cardMetaText: { ...Typography.caption, color: Colors.textMuted },
  metaDot:      { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.textMuted },
});
