import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, JobSeeker, Employer } from '@/types/database';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  jobSeeker: JobSeeker | null;
  employer: Employer | null;
  session: any;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setJobSeeker: (jobSeeker: JobSeeker | null) => void;
  setEmployer: (employer: Employer | null) => void;
  setSession: (session: any) => void;
  setLoading: (loading: boolean) => void;

  // Auth methods
  signUp: (email: string, password: string, role: 'job_seeker' | 'employer') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;

  // Profile methods
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
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) return { error };

          if (data.user) {
            // Create user record in our users table
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email: data.user.email!,
                role,
                password_hash: '', // Supabase handles password
                is_verified: false,
                verification_status: 'pending',
              });

            if (insertError) {
              console.error('Error creating user record:', insertError);
              return { error: insertError };
            }

            // Create role-specific profile
            if (role === 'job_seeker') {
              await supabase.from('job_seekers').insert({
                user_id: data.user.id,
                full_name: '',
                years_of_experience: 0,
                availability: 'immediately',
                profile_completion_score: 0,
              });
            } else {
              await supabase.from('employers').insert({
                user_id: data.user.id,
                company_name: '',
                verification_status: 'pending',
                is_verified: false,
              });
            }

            set({
              user: {
                id: data.user.id,
                email: data.user.email!,
                role,
                phone: null,
                is_verified: false,
                verification_status: 'pending',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as User,
              session: data.session,
              isAuthenticated: true,
            });
          }

          return { error: null };
        } catch (err) {
          console.error('Sign up error:', err);
          return { error: err };
        }
      },

      signIn: async (email, password) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) return { error };

          if (data.user) {
            // Fetch user record from our users table
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (userError) return { error: userError };

            set({
              user: userData,
              session: data.session,
              isAuthenticated: true,
            });

            // Fetch role-specific profile
            if (userData.role === 'job_seeker') {
              await get().fetchJobSeekerProfile();
            } else if (userData.role === 'employer') {
              await get().fetchEmployerProfile();
            }
          }

          return { error: null };
        } catch (err) {
          console.error('Sign in error:', err);
          return { error: err };
        }
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          jobSeeker: null,
          employer: null,
          session: null,
          isAuthenticated: false,
        });
      },

      resetPassword: async (email) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email);
          return { error };
        } catch (err) {
          return { error: err };
        }
      },

      fetchJobSeekerProfile: async () => {
        const { user } = get();
        if (!user) return;

        const { data, error } = await supabase
          .from('job_seekers')
          .select(`
            *,
            skills:job_seeker_skills(
              *,
              skill:skills(*)
            )
          `)
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          set({ jobSeeker: data });
        }
      },

      fetchEmployerProfile: async () => {
        const { user } = get();
        if (!user) return;

        const { data, error } = await supabase
          .from('employers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          set({ employer: data });
        }
      },

      refreshUser: async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userData) {
            set({ user: userData, session, isAuthenticated: true });

            if (userData.role === 'job_seeker') {
              await get().fetchJobSeekerProfile();
            } else if (userData.role === 'employer') {
              await get().fetchEmployerProfile();
            }
          }
        }

        set({ isLoading: false });
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
