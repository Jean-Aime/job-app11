import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Shield, Star } from 'lucide-react-native';
import { sql } from '@/lib/db';
import { useAuthStore } from '@/stores/authStore';
import { Palette } from '@/constants/theme';

interface VerificationLevel {
  level: number;
  title: string;
  description: string;
  requirements: string[];
  benefits: string[];
  completed: boolean;
}

export default function VerificationScreen() {
  const { serviceProvider } = useAuthStore();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [badges, setBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const levels: VerificationLevel[] = [
    {
      level: 1,
      title: 'Basic Verified',
      description: 'Phone, email, and ID verification',
      requirements: ['Valid phone number', 'Verified email address', 'National ID photo', 'Selfie with ID'],
      benefits: ['Create profile', 'Accept service requests', 'Basic badge'],
      completed: currentLevel >= 1
    },
    {
      level: 2,
      title: 'Skill Verified',
      description: 'Professional certificates and skills',
      requirements: ['Level 1 completed', 'Upload skill certificates', 'Add work portfolio', 'Skill assessment'],
      benefits: ['Higher visibility', 'Premium job matches', 'Skill badge'],
      completed: currentLevel >= 2
    },
    {
      level: 3,
      title: 'Background Checked',
      description: 'Police clearance and references',
      requirements: ['Level 2 completed', 'Police clearance certificate', '2+ professional references', 'Character certificate'],
      benefits: ['Top search ranking', 'Premium customers', 'Trust badge'],
      completed: currentLevel >= 3
    },
    {
      level: 4,
      title: 'Top Professional',
      description: 'Auto-awarded for excellence',
      requirements: ['4.8+ star rating', '100+ completed jobs', 'No complaints', 'Fast response time'],
      benefits: ['Featured in search', 'Priority support', 'Elite badge'],
      completed: currentLevel >= 4
    }
  ];

  useEffect(() => {
    loadVerificationStatus();
  }, []);

  const loadVerificationStatus = async () => {
    if (!serviceProvider?.id) return;

    try {
      const provider = await sql`
        SELECT verification_level, is_verified 
        FROM service_providers 
        WHERE id = ${serviceProvider.id}
      `;

      const providerBadges = await sql`
        SELECT badge_type 
        FROM provider_badges 
        WHERE service_provider_id = ${serviceProvider.id}
      `;

      setCurrentLevel(provider[0]?.verification_level || 1);
      setBadges(providerBadges.map((b: any) => b.badge_type));
    } catch (error) {
      console.error('Error loading verification:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestUpgrade = async (level: number) => {
    if (level === currentLevel + 1) {
      router.push(`/(service-provider)/verification/level-${level}`);
    } else if (level > currentLevel + 1) {
      Alert.alert('Complete Previous Level', 'Please complete the previous verification level first.');
    } else {
      Alert.alert('Already Verified', 'You have already completed this verification level.');
    }
  };

  const renderLevelCard = (levelData: VerificationLevel) => {
    const isLocked = levelData.level > currentLevel + 1;
    const isCurrent = levelData.level === currentLevel + 1;
    
    return (
      <TouchableOpacity
        key={levelData.level}
        onPress={() => requestUpgrade(levelData.level)}
        disabled={isLocked || levelData.completed}
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          borderWidth: 2,
          borderColor: levelData.completed ? Palette.green600 : isCurrent ? Palette.green500 : '#E5E7EB',
          opacity: isLocked ? 0.5 : 1
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: levelData.completed ? Palette.green100 : Palette.gray100,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {levelData.completed ? (
                <CheckCircle2 size={28} color={Palette.green600} />
              ) : (
                <Shield size={28} color={isCurrent ? Palette.green600 : Palette.gray400} />
              )}
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: Palette.gray900 }}>
                {levelData.title}
              </Text>
              <Text style={{ fontSize: 14, color: Palette.gray600, marginTop: 2 }}>
                Level {levelData.level}
              </Text>
            </View>
          </View>
          
          {levelData.completed && (
            <View style={{ backgroundColor: Palette.green100, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
              <Text style={{ color: Palette.green700, fontSize: 12, fontWeight: '600' }}>✓ Verified</Text>
            </View>
          )}
        </View>

        <Text style={{ fontSize: 14, color: Palette.gray700, marginBottom: 16 }}>
          {levelData.description}
        </Text>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: Palette.gray900, marginBottom: 8 }}>
            Requirements:
          </Text>
          {levelData.requirements.map((req, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Circle size={6} color={Palette.gray400} fill={Palette.gray400} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 13, color: Palette.gray600 }}>{req}</Text>
            </View>
          ))}
        </View>

        <View>
          <Text style={{ fontSize: 14, fontWeight: '600', color: Palette.gray900, marginBottom: 8 }}>
            Benefits:
          </Text>
          {levelData.benefits.map((benefit, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Star size={12} color={Palette.green600} fill={Palette.green600} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 13, color: Palette.gray700 }}>{benefit}</Text>
            </View>
          ))}
        </View>

        {isCurrent && !levelData.completed && (
          <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Palette.gray200 }}>
            <View style={{ backgroundColor: Palette.green600, paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Start Verification →</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Palette.gray50 }}>
      <View style={{ backgroundColor: Palette.green600, paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8 }}>Verification</Text>
        <Text style={{ fontSize: 16, color: '#fff', opacity: 0.9 }}>Build trust with verified credentials</Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: Palette.gray900, marginBottom: 12 }}>Your Status</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 24, fontWeight: '800', color: Palette.green600 }}>Level {currentLevel}</Text>
              <Text style={{ fontSize: 14, color: Palette.gray600, marginTop: 4 }}>{levels[currentLevel - 1]?.title}</Text>
            </View>
            <View style={{ backgroundColor: Palette.green100, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Palette.green700 }}>{badges.length} Badge{badges.length !== 1 ? 's' : ''}</Text>
            </View>
          </View>
        </View>

        {levels.map(renderLevelCard)}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
