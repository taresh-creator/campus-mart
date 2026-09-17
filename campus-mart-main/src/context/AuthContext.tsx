import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { api } from '@/lib/api';
import type { Profile } from '@/types/supabase';

// Lightweight compatibility interface for Supabase User/Session
export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

export interface AuthSession {
  access_token: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const user: AuthUser | null = profile
    ? {
        id: profile.id,
        email: profile.email,
        user_metadata: { full_name: profile.full_name },
      }
    : null;

  const token = api.auth.getToken();
  const session: AuthSession | null =
    user && token
      ? {
          access_token: token,
          user,
        }
      : null;

  useEffect(() => {
    async function initAuth() {
      // Check stored user first for fast hydration
      const stored = api.auth.getStoredUser();
      if (stored) {
        setProfile(stored);
      }

      // Verify and refresh with backend
      const current = await api.auth.getMe();
      setProfile(current);
      setLoading(false);
    }

    initAuth();
  }, []);

  async function signUp(fullName: string, email: string, password: string) {
    const res = await api.auth.signUp(fullName, email, password);
    if (res.error) {
      return { error: res.error };
    }
    if (res.user) {
      setProfile(res.user);
    }
    return { error: null };
  }

  async function signIn(email: string, password: string) {
    const res = await api.auth.signIn(email, password);
    if (res.error) {
      return { error: res.error };
    }
    if (res.user) {
      setProfile(res.user);
    }
    return { error: null };
  }

  async function signOut() {
    api.auth.signOut();
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, session, profile, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
