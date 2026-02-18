import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase, signIn, signUp, signOut, onAuthStateChange } from '../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { Tables } from '../lib/database.types';

export type UserRole = 'owner' | 'tenant' | 'pm' | null;

type Profile = Tables<'profiles'>;

interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  isDemo?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, displayName: string, role: UserRole) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  setUserRole: (role: UserRole) => Promise<void>;
  // Demo mode functions (for testing without real auth)
  loginAsDemo: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo mode storage key
const DEMO_USER_KEY = 'demoUser';

// Helper to load demo user from storage
function loadDemoUser(): User | null {
  const stored = localStorage.getItem(DEMO_USER_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as User;
    } catch {
      localStorage.removeItem(DEMO_USER_KEY);
    }
  }
  return null;
}

// Map Supabase user to our User type
function mapSupabaseUser(supabaseUser: SupabaseUser, profile: Profile | null): User {
  return {
    uid: supabaseUser.id,
    email: supabaseUser.email || '',
    displayName: profile?.display_name || supabaseUser.user_metadata?.display_name || supabaseUser.email?.split('@')[0] || 'User',
    role: (profile?.role as UserRole) || 'tenant',
    photoURL: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url,
    isDemo: false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile from Supabase
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  };

  // Create profile for new user
  const createProfile = async (
    userId: string,
    email: string,
    displayName: string,
    role: UserRole,
    avatarUrl?: string
  ): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        display_name: displayName,
        role: role || 'tenant',
        avatar_url: avatarUrl,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }
    return data;
  };

  // Handle auth state changes
  useEffect(() => {
    // Check for demo user first
    const demoUser = loadDemoUser();
    if (demoUser) {
      setUser(demoUser);
      setLoading(false);
      return;
    }

    // Set up Supabase auth listener
    const { data: { subscription } } = onAuthStateChange(async (event: string, session: Session | null) => {
      if (session?.user) {
        let userProfile = await fetchProfile(session.user.id);

        // If no profile exists (new OAuth user), create one
        if (!userProfile && event === 'SIGNED_IN') {
          userProfile = await createProfile(
            session.user.id,
            session.user.email || '',
            session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            'tenant',
            session.user.user_metadata?.avatar_url
          );
        }

        setProfile(userProfile);
        setUser(mapSupabaseUser(session.user, userProfile));
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    // Check current session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
        setUser(mapSupabaseUser(session.user, userProfile));
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email/password
  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    return { error: error ? new Error(error.message) : null };
  };

  // Sign up with email/password
  const signUpWithEmail = async (email: string, password: string, displayName: string, role: UserRole) => {
    setLoading(true);
    const { data, error } = await signUp(email, password, { displayName, role: role || 'tenant' });

    if (!error && data.user) {
      // Create profile for new user
      await createProfile(data.user.id, email, displayName, role);
    }

    setLoading(false);
    return { error: error ? new Error(error.message) : null };
  };

  // Sign in with Google OAuth
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/Shanie/auth/callback`,
      },
    });
    return { error: error ? new Error(error.message) : null };
  };

  // Log out
  const logout = async () => {
    setLoading(true);

    // Clear demo user if exists
    localStorage.removeItem(DEMO_USER_KEY);

    // Sign out from Supabase
    await signOut();

    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  // Update user role
  const setUserRole = async (role: UserRole) => {
    if (!user) return;

    if (user.isDemo) {
      // Demo mode - just update local state
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(updatedUser));
      return;
    }

    // Update in Supabase
    const { error } = await supabase
      .from('profiles')
      .update({ role: role || 'tenant' })
      .eq('id', user.uid);

    if (!error) {
      setUser({ ...user, role });
      if (profile) {
        setProfile({ ...profile, role: role || 'tenant' });
      }
    }
  };

  // Demo mode login (for testing without real auth)
  const loginAsDemo = (role: UserRole) => {
    const demoNames: Record<string, string> = {
      owner: 'Demo Owner',
      pm: 'Demo PM',
      tenant: 'Demo Tenant',
    };

    const demoEmails: Record<string, string> = {
      owner: 'owner@demo.local',
      pm: 'pm@demo.local',
      tenant: 'tenant@demo.local',
    };

    const demoUser: User = {
      uid: `demo-${role}`,
      email: role ? demoEmails[role] : 'demo@demo.local',
      displayName: role ? demoNames[role] : 'Demo User',
      role,
      isDemo: true,
    };

    setUser(demoUser);
    setProfile(null);
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logout,
        setUserRole,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
