import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, JobSeeker, Employer } from '@/types/database';
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
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: (user: User | null) => void;
  setJobSeeker: (jobSeeker: JobSeeker | null) => void;
  setEmployer: (employer: Employer | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;

  signUp: (email: string, password: string, role: 'job_seeker' | 'employer') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;

  fetchJobSeekerProfile: () => Promise<void>;
  fetchEmployerProfile: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      jobSeeker: null,
      employer: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setJobSeeker: (jobSeeker) => set({ jobSeeker }),
      setEmployer: (employer) => set({ employer }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),

      signUp: async (email, password, role) => {
        const { user, session, error } = await authSignUp(email, password, role);
        if (error) return { error: { message: error } };
        if (user && session) {
          set({ user, session, isAuthenticated: true });
          if (role === 'job_seeker') await get().fetchJobSeekerProfile();
          else await get().fetchEmployerProfile();
        }
        return { error: null };
      },

      signIn: async (email, password) => {
        const { user, session, error } = await authSignIn(email, password);
        if (error) return { error: { message: error } };
        if (user && session) {
          set({ user, session, isAuthenticated: true });
          if (user.role === 'job_seeker') await get().fetchJobSeekerProfile();
          else if (user.role === 'employer') await get().fetchEmployerProfile();
        }
        return { error: null };
      },

      signOut: async () => {
        await authSignOut();
        set({ user: null, jobSeeker: null, employer: null, session: null, isAuthenticated: false });
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
            if (user.role === 'job_seeker') await get().fetchJobSeekerProfile();
            else if (user.role === 'employer') await get().fetchEmployerProfile();
          } else {
            set({ isAuthenticated: false });
          }
        } catch (err) {
          console.error('refreshUser error:', err);
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
