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
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, displayName: string, role: UserRole) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  setUserRole: (role: UserRole) => Promise<void>;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Email allowlist — comma-separated env var; empty = allow all (dev only)
function parseAllowlist(value: string | undefined): Set<string> {
  const raw = (value ?? '').trim();
  if (!raw) return new Set();
  return new Set(raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean));
}
const allowedEmails = parseAllowlist(import.meta.env.VITE_ALLOWED_EMAILS);

function isEmailAllowed(email: string): boolean {
  if (allowedEmails.size === 0) return true; // No allowlist = allow all (dev)
  return allowedEmails.has(email.toLowerCase());
}

// Map Supabase user to our User type
function mapSupabaseUser(supabaseUser: SupabaseUser, profile: Profile | null): User {
  return {
    uid: supabaseUser.id,
    email: supabaseUser.email || '',
    displayName: profile?.display_name || supabaseUser.user_metadata?.display_name || supabaseUser.email?.split('@')[0] || 'User',
    role: (profile?.role as UserRole) || 'tenant',
    photoURL: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

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
    // Set up Supabase auth listener
    const { data: { subscription } } = onAuthStateChange(async (event: string, session: Session | null) => {
      if (session?.user) {
        // Enforce email allowlist
        const email = session.user.email || '';
        if (!isEmailAllowed(email)) {
          console.warn('Access denied for:', email);
          await signOut();
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        let userProfile = await fetchProfile(session.user.id);

        // If no profile exists (new user), create one
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
        const email = session.user.email || '';
        if (!isEmailAllowed(email)) {
          await signOut();
          setLoading(false);
          return;
        }
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
    if (!error) {
      setShowLoginModal(false);
    }
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

  // Log out
  const logout = async () => {
    setLoading(true);
    await signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  // Update user role
  const setUserRole = async (role: UserRole) => {
    if (!user) return;

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

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithEmail,
        signUpWithEmail,
        logout,
        setUserRole,
        showLoginModal,
        setShowLoginModal,
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
