import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, JobSeeker, Employer, ServiceProvider } from '@/types/database';
import { queryOne } from '@/lib/db';
import {
  signUp as authSignUp,
  signIn as authSignIn,
  signOut as authSignOut,
  resetPassword as authResetPassword,
  getCurrentUser,
  getStoredSession,
  Session,
} from '@/lib/auth';

interface AuthState {
  user: User | null;
  jobSeeker: JobSeeker | null;
  employer: Employer | null;
  serviceProvider: ServiceProvider | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: (user: User | null) => void;
  setJobSeeker: (jobSeeker: JobSeeker | null) => void;
  setEmployer: (employer: Employer | null) => void;
  setServiceProvider: (serviceProvider: ServiceProvider | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;

  signUp: (email: string, password: string, role: 'job_seeker' | 'employer' | 'service_provider') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; user: User | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;

  fetchJobSeekerProfile: () => Promise<void>;
  fetchEmployerProfile: () => Promise<void>;
  fetchServiceProviderProfile: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      jobSeeker: null,
      employer: null,
      serviceProvider: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setJobSeeker: (jobSeeker) => set({ jobSeeker }),
      setEmployer: (employer) => set({ employer }),
      setServiceProvider: (serviceProvider) => set({ serviceProvider }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),

      signUp: async (email, password, role) => {
        const { user, session, error } = await authSignUp(email, password, role);
        if (error) return { error: { message: error } };
        if (user && session) {
          set({ user, session, isAuthenticated: true });
          if (role === 'job_seeker') await get().fetchJobSeekerProfile();
          else if (role === 'employer') await get().fetchEmployerProfile();
          else if (role === 'service_provider') await get().fetchServiceProviderProfile();
        }
        return { error: null };
      },

      signIn: async (email, password) => {
        console.log('🔵 authStore.signIn called with:', email);
        try {
          const { user, session, error } = await authSignIn(email, password);
          console.log('🔵 authSignIn result:', { user: user?.id, role: user?.role, error });
          
          if (error) return { error: { message: error }, user: null };
          if (user && session) {
            console.log('🔵 Setting user in store, role:', user.role);
            set({ user, session, isAuthenticated: true });
            
            // Fetch role-specific profile
            if (user.role === 'job_seeker') {
              console.log('🔵 Fetching job seeker profile...');
              await get().fetchJobSeekerProfile();
            } else if (user.role === 'employer') {
              console.log('🔵 Fetching employer profile...');
              await get().fetchEmployerProfile();
            } else if (user.role === 'service_provider') {
              console.log('🔵 Fetching service provider profile...');
              await get().fetchServiceProviderProfile();
            }
            console.log('🟢 Profile fetch complete');
            // admin role: no extra profile table needed
          }
          return { error: null, user: user ?? null };
        } catch (err: any) {
          console.error('🔴 authStore.signIn exception:', err);
          return { error: { message: err.message || 'Sign in failed' }, user: null };
        }
      },

      signOut: async () => {
        await authSignOut();
        set({
          user: null,
          jobSeeker: null,
          employer: null,
          serviceProvider: null,
          session: null,
          isAuthenticated: false,
        });
      },

      resetPassword: async (email) => {
        const { error } = await authResetPassword(email);
        return { error: error ? { message: error } : null };
      },

      fetchJobSeekerProfile: async () => {
        const { user } = get();
        if (!user) return;
        try {
          const data = await queryOne<JobSeeker>`
            SELECT js.*,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', jss.id,
                    'job_seeker_id', jss.job_seeker_id,
                    'skill_id', jss.skill_id,
                    'proficiency_level', jss.proficiency_level,
                    'years_of_experience', jss.years_of_experience,
                    'skill', json_build_object('id', s.id, 'name', s.name, 'category', s.category)
                  )
                ) FILTER (WHERE jss.id IS NOT NULL),
                '[]'
              ) AS skills
            FROM job_seekers js
            LEFT JOIN job_seeker_skills jss ON jss.job_seeker_id = js.id
            LEFT JOIN skills s ON s.id = jss.skill_id
            WHERE js.user_id = ${user.id}
            GROUP BY js.id
          `;
          if (data) set({ jobSeeker: data });
        } catch (err) {
          console.error('fetchJobSeekerProfile error:', err);
        }
      },

      fetchEmployerProfile: async () => {
        const { user } = get();
        if (!user) return;
        try {
          const data = await queryOne<Employer>`
            SELECT * FROM employers WHERE user_id = ${user.id}
          `;
          if (data) set({ employer: data });
        } catch (err) {
          console.error('fetchEmployerProfile error:', err);
        }
      },

      fetchServiceProviderProfile: async () => {
        const { user } = get();
        if (!user) return;
        try {
          const data = await queryOne<ServiceProvider>`
            SELECT * FROM service_providers WHERE user_id = ${user.id}
          `;
          if (data) set({ serviceProvider: data });
        } catch (err) {
          console.error('fetchServiceProviderProfile error:', err);
        }
      },

      refreshUser: async () => {
        try {
          const session = await getStoredSession();
          if (!session) {
            set({ isLoading: false, isAuthenticated: false });
            return;
          }

          const user = await getCurrentUser();
          if (user) {
            set({ user, session, isAuthenticated: true });
            if (user.role === 'job_seeker') {
              await get().fetchJobSeekerProfile();
            } else if (user.role === 'employer') {
              await get().fetchEmployerProfile();
            } else if (user.role === 'service_provider') {
              await get().fetchServiceProviderProfile();
            }
          } else {
            set({ isAuthenticated: false, user: null, session: null });
          }
        } catch (err) {
          console.error('refreshUser error:', err);
          set({ isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);
