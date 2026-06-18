import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell, Briefcase, CheckCircle, XCircle, Users,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types/database';
import { useAuthStore } from '@/stores/authStore';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Colors, Typography, Spacing, Radius, Space, G, Palette,
} from '@/constants/theme';
import { formatTimeAgo } from '@/utils/formatters';

const iconMap: Record<string, any> = {
  new_application:      Briefcase,
  application_accepted: CheckCircle,
  application_rejected: XCircle,
  job_matched:          Users,
  default:              Bell,
};

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);

  useEffect(() => { if (user) fetchNotifications(); }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('notifications').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setNotifications(data);
    setLoading(false);
    setRefreshing(false);
  };

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unread = notifications.filter(n => !n.is_read).length;

  const renderItem = ({ item }: { item: Notification }) => {
    const Icon = iconMap[item.type] || iconMap.default;
    return (
      <TouchableOpacity
        style={[styles.card, !item.is_read && styles.cardUnread]}
        onPress={() => markRead(item.id)}
        activeOpacity={0.85}
      >
        <View style={[styles.iconWrap, !item.is_read && { backgroundColor: Colors.employerLight }]}>
          <Icon color={item.is_read ? Colors.textMuted : Colors.employer} size={20} strokeWidth={2} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, !item.is_read && styles.titleUnread]}>{item.title}</Text>
          {item.message && <Text style={styles.message} numberOfLines={2}>{item.message}</Text>}
          <Text style={styles.time}>{formatTimeAgo(item.created_at)}</Text>
        </View>
        {!item.is_read && <View style={styles.dot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Notifications</Text>
          <Text style={styles.sub}>{unread > 0 ? `${unread} unread` : 'All caught up'}</Text>
        </View>
        {unread > 0 && (
          <TouchableOpacity onPress={markAllRead} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={i => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} tintColor={Colors.employer} />}
        ListEmptyComponent={!loading ? (
          <EmptyState
            icon={<Bell color={Colors.textMuted} size={40} strokeWidth={1.5} />}
            title="No notifications"
            description="You'll be notified about new applications and updates"
          />
        ) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { ...G.screen },

  header: { ...G.rowBetween, paddingHorizontal: Space.pagePadding, paddingTop: Space.pageTop, paddingBottom: Spacing[4] },
  heading: { ...Typography.h2, color: Colors.textPrimary },
  sub:     { ...Typography.bodySm, color: Colors.textSecondary, marginTop: Spacing[0.5] },
  markAll: { ...Typography.label, color: Colors.employer, fontWeight: '600' },

  list: { padding: Space.pagePadding, paddingTop: Spacing[2], paddingBottom: Space.listBottom },

  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Space.cardPadding,
    marginBottom: Space.cardGap,
    borderWidth: 1, borderColor: Colors.border,
    gap: Spacing[3],
  },
  cardUnread: { backgroundColor: Colors.employerLight + '33', borderColor: Colors.employerMid },

  iconWrap: {
    ...G.iconMd,
    backgroundColor: Colors.bg,
    flexShrink: 0,
  },
  content:      { flex: 1 },
  title:        { ...Typography.h5, color: Colors.textPrimary, marginBottom: 3 },
  titleUnread:  { fontWeight: '700' },
  message:      { ...Typography.bodySm, color: Colors.textSecondary, lineHeight: 20, marginBottom: 4 },
  time:         { ...Typography.caption, color: Colors.textMuted },
  dot:          { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.employer, marginTop: 4 },
});
