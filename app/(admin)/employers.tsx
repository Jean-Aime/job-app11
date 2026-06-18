import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building2, CheckCircle, XCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Employer } from '@/types/database';
import { FilterChip } from '@/components/ui/FilterChip';
import { JobCardSkeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import {
  Colors, Typography, Spacing, Radius, Space, G, VerificationConfig, Palette,
} from '@/constants/theme';

const FILTERS = [
  { value: 'all',      label: 'All' },
  { value: 'pending',  label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function AdminEmployersScreen() {
  const [employers,  setEmployers]  = useState<Employer[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter,     setFilter]     = useState('all');

  const fetchEmployers = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('employers').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('verification_status', filter);
    const { data } = await q;
    if (data) setEmployers(data);
    setLoading(false);
    setRefreshing(false);
  }, [filter]);

  useEffect(() => { fetchEmployers(); }, [fetchEmployers]);

  const updateStatus = (id: string, status: 'approved' | 'rejected') => {
    Alert.alert(
      `${status === 'approved' ? 'Approve' : 'Reject'} Employer`,
      `Are you sure you want to ${status} this employer?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: status === 'approved' ? 'Approve' : 'Reject',
          style: status === 'approved' ? 'default' : 'destructive',
          onPress: async () => {
            await supabase.from('employers')
              .update({ verification_status: status, is_verified: status === 'approved' })
              .eq('id', id);
            fetchEmployers();
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Employer }) => {
    const vcKey = item.verification_status || 'pending';
    const vc    = VerificationConfig[vcKey] || VerificationConfig.pending;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.logo}>
            {item.company_logo_url
              ? <Image source={{ uri: item.company_logo_url }} style={styles.logoImg} />
              : <Building2 color={Colors.textMuted} size={22} strokeWidth={1.8} />}
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{item.company_name}</Text>
            <Text style={styles.industry}>{item.industry || 'No industry listed'}</Text>
            <Badge label={vc.label} color={vc.color} bg={vc.bg} dot size="sm" />
          </View>
        </View>

        {(vcKey === 'pending' || vcKey === 'rejected') && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.successLight }]}
              onPress={() => updateStatus(item.id, 'approved')}
            >
              <CheckCircle color={Colors.success} size={15} strokeWidth={2.5} />
              <Text style={[styles.actionText, { color: Colors.success }]}>Approve</Text>
            </TouchableOpacity>
            {vcKey === 'pending' && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Colors.errorLight }]}
                onPress={() => updateStatus(item.id, 'rejected')}
              >
                <XCircle color={Colors.error} size={15} strokeWidth={2.5} />
                <Text style={[styles.actionText, { color: Colors.error }]}>Reject</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Employers</Text>
        {!loading && (
          <Text style={styles.count}>{employers.length} compan{employers.length !== 1 ? 'ies' : 'y'}</Text>
        )}
      </View>

      <View style={styles.filterWrap}>
        <FlatList
          data={FILTERS} horizontal showsHorizontalScrollIndicator={false}
          keyExtractor={i => i.value} contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <FilterChip label={item.label} active={filter === item.value}
              onPress={() => setFilter(item.value)} color={Colors.admin} />
          )}
        />
      </View>

      <FlatList
        data={employers} renderItem={renderItem} keyExtractor={i => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchEmployers(); }} tintColor={Colors.admin} />}
        ListHeaderComponent={loading ? <View>{[1,2,3].map(k => <JobCardSkeleton key={k} />)}</View> : null}
        ListEmptyComponent={!loading ? (
          <EmptyState
            icon={<Building2 color={Colors.textMuted} size={40} strokeWidth={1.5} />}
            title="No employers found"
          />
        ) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { ...G.screen },
  header:     { paddingHorizontal: Space.pagePadding, paddingTop: Space.pageTop, paddingBottom: Spacing[3] },
  heading:    { ...Typography.h2, color: Colors.textPrimary },
  count:      { ...Typography.bodySm, color: Colors.textSecondary, marginTop: Spacing[0.5] },
  filterWrap: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterList: { paddingHorizontal: Space.pagePadding, paddingVertical: Spacing[3], gap: Spacing[2] },
  list:       { padding: Space.pagePadding, paddingTop: Spacing[3], paddingBottom: Space.listBottom },

  card:    { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, marginBottom: Space.cardGap, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[3], padding: Space.cardPadding },
  logo:    { width: 48, height: 48, borderRadius: Radius.md, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logoImg: { width: 48, height: 48 },
  info:    { flex: 1, gap: Spacing[1] },
  name:    { ...Typography.h5, color: Colors.textPrimary },
  industry:{ ...Typography.bodySm, color: Colors.textSecondary },

  actions:    { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.divider },
  actionBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[1.5], paddingVertical: Spacing[3] },
  actionText: { ...Typography.label, fontWeight: '600' },
});
