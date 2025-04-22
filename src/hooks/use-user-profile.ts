'use client';

import { createClient } from '@/lib/client';
import { useEffect, useState } from 'react';
import { suppressAuthErrors } from '@/lib/suppress-auth-errors';

export interface UserProfile {
  id: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin' | null;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const restoreConsole = suppressAuthErrors();

    async function fetchUserProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) {
            throw profileError;
          }

          if (profile) {
            setProfile(profile as UserProfile);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserProfile();
    return () => restoreConsole();
  }, []);

  return { profile, isLoading, error };
}



