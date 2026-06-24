import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { JobDetailView } from '@/components/jobs/JobDetailView';
import { G } from '@/constants/theme';

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView style={G.screenWhite} edges={['top']}>
      <JobDetailView jobId={id as string} role="job_seeker" />
    </SafeAreaView>
  );
}
