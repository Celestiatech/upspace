'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/browser';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    metadata?: { name?: string; username?: string }
  ) => Promise<{ error?: string; requiresVerification?: boolean }>;
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>;
  signInDemoUser: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loginStore = useAppStore((state) => state.login);
  const logoutStore = useAppStore((state) => state.logout);

  const syncUserToStore = (u: User | null) => {
    if (!u) {
      // Don't auto-clear Zustand if user is logged in as a demo user
      return;
    }
    loginStore({
      id: u.id,
      email: u.email || 'citizen@upspace.live',
      name: (u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'UpSpace Citizen') as string,
      username: (u.user_metadata?.username || u.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'citizen') as string,
      avatarUrl: (u.user_metadata?.avatar_url || u.user_metadata?.picture || undefined) as string | undefined,
      provider: (u.app_metadata?.provider || 'google') as 'google' | 'email' | 'otp',
    });
  };

  useEffect(() => {
    try {
      const supabase = createClient();

      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          syncUserToStore(session.user);
        }
        setLoading(false);
      });

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          syncUserToStore(session.user);
        }
        setLoading(false);
        router.refresh();
      });

      return () => {
        listener.subscription.unsubscribe();
      };
    } catch (e) {
      console.warn('Supabase client initialization skipped/failed:', e);
      setLoading(false);
    }
  }, [router]);

  const signInWithGoogle = async () => {
    try {
      const res = await fetch('/api/auth/signin', { method: 'GET' });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e: any) {
      console.error('Google sign in error:', e);
      throw e;
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        syncUserToStore(data.user);
      }
      return {};
    } catch (e: any) {
      return { error: e?.message || 'Failed to sign in. Please try again.' };
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    metadata?: { name?: string; username?: string }
  ): Promise<{ error?: string; requiresVerification?: boolean }> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: metadata?.name?.trim() || email.split('@')[0],
            username: metadata?.username?.trim() || email.split('@')[0].toLowerCase(),
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        syncUserToStore(data.user);
        // If Supabase requires email verification and session is null
        if (!data.session) {
          return { requiresVerification: true };
        }
      }
      return {};
    } catch (e: any) {
      return { error: e?.message || 'Failed to create account. Please try again.' };
    }
  };

  const signInWithMagicLink = async (email: string): Promise<{ error?: string }> => {
    try {
      const supabase = createClient();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
      });

      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (e: any) {
      return { error: e?.message || 'Failed to send magic link.' };
    }
  };

  const signInDemoUser = () => {
    const demoId = `US-${Math.floor(10000 + Math.random() * 90000)}`;
    loginStore({
      id: demoId,
      email: 'citizen@upspace.live',
      name: 'Skyline Citizen',
      username: 'skyline_vip',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      provider: 'otp',
    });
  };

  const signOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign out error:', e);
    }
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch {}
    setUser(null);
    setSession(null);
    logoutStore();
    router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInWithMagicLink,
        signInDemoUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

