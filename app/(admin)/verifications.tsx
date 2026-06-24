import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Clock, User } from 'lucide-react-native';
import { sql } from '@/lib/db';
import { useAuthStore } from '@/stores/authStore';
import { Palette } from '@/constants/theme';

interface VerificationRequest {
  id: string;
  provider_name: string;
  provider_email: string;
  provider_phone: string;
  requested_level: number;
  current_level: number;
  status: string;
  requested_at: string;
  documents_count: number;
  total_jobs_completed: number;
  average_rating: number;
}

export default function AdminVerificationScreen() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    try {
      const query = filter === 'pending' 
        ? sql`SELECT * FROM admin_verification_dashboard WHERE status = 'pending' OR status = 'under_review'`
        : sql`SELECT * FROM admin_verification_dashboard LIMIT 50`;
      
      const data = await query;
      setRequests(data as any);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      if (action === 'approve') {
        await sql`
          UPDATE verification_requests 
          SET status = 'approved', reviewed_at = NOW()
          WHERE id = ${requestId}
        `;
        Alert.alert('Approved', 'Verification request approved');
      } else {
        await sql`
          UPDATE verification_requests 
          SET status = 'rejected', reviewed_at = NOW(), rejection_reason = ${reason || 'Not meeting requirements'}
          WHERE id = ${requestId}
        `;
        Alert.alert('Rejected', 'Verification request rejected');
      }
      loadRequests();
    } catch (error) {
      Alert.alert('Error', 'Failed to process request');
    }
  };

  const renderRequest = (req: VerificationRequest) => (
    <View key={req.id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Palette.gray200 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: Palette.gray900 }}>{req.provider_name}</Text>
          <Text style={{ fontSize: 13, color: Palette.gray600, marginTop: 2 }}>{req.provider_email}</Text>
          <Text style={{ fontSize: 13, color: Palette.gray600 }}>{req.provider_phone}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ backgroundColor: Palette.purple100, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: Palette.purple700 }}>
              Level {req.current_level} → {req.requested_level}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
        <View style={{ flex: 1, backgroundColor: Palette.gray50, padding: 10, borderRadius: 8 }}>
          <Text style={{ fontSize: 11, color: Palette.gray600 }}>Jobs Done</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: Palette.gray900, marginTop: 2 }}>{req.total_jobs_completed}</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: Palette.gray50, padding: 10, borderRadius: 8 }}>
          <Text style={{ fontSize: 11, color: Palette.gray600 }}>Rating</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: Palette.gray900, marginTop: 2 }}>{req.average_rating.toFixed(1)} ⭐</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: Palette.gray50, padding: 10, borderRadius: 8 }}>
          <Text style={{ fontSize: 11, color: Palette.gray600 }}>Documents</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: Palette.gray900, marginTop: 2 }}>{req.documents_count}</Text>
        </View>
      </View>

      {req.status === 'pending' && (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => handleAction(req.id, 'reject')}
            style={{ flex: 1, backgroundColor: Palette.red50, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: Palette.red200 }}
          >
            <Text style={{ color: Palette.red700, fontWeight: '600', fontSize: 14 }}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleAction(req.id, 'approve')}
            style={{ flex: 1, backgroundColor: Palette.green600, paddingVertical: 10, borderRadius: 8, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}

      {req.status !== 'pending' && (
        <View style={{ paddingVertical: 8, alignItems: 'center' }}>
          <Text style={{ fontSize: 13, color: req.status === 'approved' ? Palette.green700 : Palette.gray600 }}>
            {req.status === 'approved' ? '✓ Approved' : `Status: ${req.status}`}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Palette.gray50 }}>
      <View style={{ backgroundColor: Palette.purple600, paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8 }}>Verifications</Text>
        <Text style={{ fontSize: 16, color: '#fff', opacity: 0.9 }}>Review provider verification requests</Text>
      </View>

      <View style={{ flexDirection: 'row', padding: 20, gap: 12 }}>
        <TouchableOpacity
          onPress={() => setFilter('pending')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor: filter === 'pending' ? Palette.purple600 : '#fff',
            borderWidth: 1,
            borderColor: filter === 'pending' ? Palette.purple600 : Palette.gray300
          }}
        >
          <Text style={{ fontWeight: '600', color: filter === 'pending' ? '#fff' : Palette.gray700 }}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter('all')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor: filter === 'all' ? Palette.purple600 : '#fff',
            borderWidth: 1,
            borderColor: filter === 'all' ? Palette.purple600 : Palette.gray300
          }}
        >
          <Text style={{ fontWeight: '600', color: filter === 'all' ? '#fff' : Palette.gray700 }}>All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Palette.purple600} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
          {requests.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Shield size={64} color={Palette.gray400} />
              <Text style={{ fontSize: 16, color: Palette.gray600, marginTop: 16 }}>No verification requests</Text>
            </View>
          ) : (
            requests.map(renderRequest)
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}
