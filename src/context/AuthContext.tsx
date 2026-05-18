import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type ItTrack = 'general' | 'web_dev' | 'networking' | 'data';

export interface Profile {
  id: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  year_level: '1st' | '2nd' | '3rd' | '4th' | 'graduate' | null;
  it_track: ItTrack | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, itTrack?: ItTrack) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId?: string | null) => {
    if (!userId) {
      setProfile(null);
      return { error: null };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      setProfile(null);
      return { error: getErrorMessage(error, 'Unable to load profile.') };
    }

    setProfile(data as Profile);
    return { error: null };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (error) {
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      const currentSession = data?.session ?? null;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user?.id) {
        await fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    };

    void loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession?.user?.id) {
        void fetchProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setIsLoading(false);
      return { error: getErrorMessage(error, 'Unable to sign in.') };
    }

    setSession(data?.session ?? null);
    setUser(data?.user ?? null);
    if (data?.user?.id) {
      await fetchProfile(data.user.id);
    }
    setIsLoading(false);
    return { error: null };
  }, [fetchProfile]);

  const signUp = useCallback(async (email: string, password: string, itTrack?: ItTrack) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setIsLoading(false);
      return { error: getErrorMessage(error, 'Unable to sign up.') };
    }

    if (data?.user?.id) {
      if (itTrack) {
        const updateResult = await supabase
          .from('profiles')
          .update({ it_track: itTrack })
          .eq('id', data.user.id)
          .select('*')
          .single();

        if (updateResult.error) {
          setIsLoading(false);
          return { error: getErrorMessage(updateResult.error, 'Unable to update profile.') };
        }

        setProfile(updateResult.data as Profile);
      } else {
        await fetchProfile(data.user.id);
      }
    }

    setSession(data?.session ?? null);
    setUser(data?.user ?? null);
    setIsLoading(false);
    return { error: null };
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setIsLoading(false);
      return { error: getErrorMessage(error, 'Unable to sign out.') };
    }
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsLoading(false);
    return { error: null };
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user?.id) {
      return { error: 'No authenticated user.' };
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates })
      .eq('id', user.id)
      .select('*')
      .single();

    if (error) {
      setIsLoading(false);
      return { error: getErrorMessage(error, 'Unable to update profile.') };
    }

    setProfile(data as Profile);
    setIsLoading(false);
    return { error: null };
  }, [user]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      profile,
      isLoading,
      signIn,
      signUp,
      signOut,
      updateProfile
    }),
    [user, session, profile, isLoading, signIn, signUp, signOut, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
