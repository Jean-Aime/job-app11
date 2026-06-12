import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Building2, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type Role = 'job_seeker' | 'employer';

export default function RoleSelectionScreen() {
  const router = useRouter();

  const handleRoleSelect = (role: Role) => {
    router.push({
      pathname: '/(auth)/register',
      params: { role },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Path</Text>
        <Text style={styles.subtitle}>
          Select how you want to use JobLink Africa
        </Text>
      </View>

      <View style={styles.rolesContainer}>
        {/* Job Seeker Card */}
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => handleRoleSelect('job_seeker')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#2563EB', '#3B82F6']}
            style={styles.roleCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.roleIconContainer}>
              <User color="#FFFFFF" size={32} />
            </View>
            <View style={styles.roleCardContent}>
              <Text style={styles.roleTitle}>Job Seeker</Text>
              <Text style={styles.roleDescription}>
                Find your dream job, showcase your skills, and connect with employers
              </Text>
              <View style={styles.roleFeatures}>
                <Text style={styles.roleFeatureItem}>Browse thousands of jobs</Text>
                <Text style={styles.roleFeatureItem}>Get matched automatically</Text>
                <Text style={styles.roleFeatureItem}>Track your applications</Text>
              </View>
            </View>
            <View style={styles.roleCardFooter}>
              <Text style={styles.roleSelectText}>Create Account</Text>
              <ArrowRight color="#FFFFFF" size={20} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Employer Card */}
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => handleRoleSelect('employer')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#059669', '#10B981']}
            style={styles.roleCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.roleIconContainer}>
              <Building2 color="#FFFFFF" size={32} />
            </View>
            <View style={styles.roleCardContent}>
              <Text style={styles.roleTitle}>Employer</Text>
              <Text style={styles.roleDescription}>
                Post jobs, find qualified candidates, and build your team
              </Text>
              <View style={styles.roleFeatures}>
                <Text style={styles.roleFeatureItem}>Post unlimited jobs</Text>
                <Text style={styles.roleFeatureItem}>Review applications</Text>
                <Text style={styles.roleFeatureItem}>Access talent matches</Text>
              </View>
            </View>
            <View style={styles.roleCardFooter}>
              <Text style={styles.roleSelectText}>Register Company</Text>
              <ArrowRight color="#FFFFFF" size={20} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.footerLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  rolesContainer: {
    flex: 1,
    gap: 16,
  },
  roleCard: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  roleCardGradient: {
    padding: 24,
  },
  roleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleCardContent: {
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 16,
  },
  roleFeatures: {
    gap: 6,
  },
  roleFeatureItem: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    paddingLeft: 8,
  },
  roleCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  roleSelectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  footerText: {
    fontSize: 15,
    color: '#64748B',
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },
});
