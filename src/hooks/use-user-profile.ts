'use client';

import { createClient } from '@/lib/client';
import { useEffect, useState } from 'react';
import { suppressAuthErrors } from '@/lib/suppress-auth-errors';

interface UserProfile {
  id: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Suppress auth errors in the console
    const restoreConsole = suppressAuthErrors();

    async function fetchUserProfile() {
      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        // Get user data from auth
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError) {
          // Silently handle auth errors
          setProfile(null);
          setIsLoading(false);
          return;
        }

        if (!userData.user) {
          setProfile(null);
          setIsLoading(false);
          return;
        }

        // Get profile data from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" which is expected if profile doesn't exist yet
          console.error('Error fetching profile:', profileError);
        }

        setProfile({
          id: userData.user.id,
          username: profileData?.username || userData.user.user_metadata?.username || null,
          email: userData.user.email || null,
          avatar_url: profileData?.avatar_url || userData.user.user_metadata?.avatar_url || null,
        });
      } catch (err) {
        console.error('Error in useUserProfile:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserProfile();

    // Restore console.error when component unmounts
    return () => restoreConsole();
  }, []);

  return { profile, isLoading, error };
}
