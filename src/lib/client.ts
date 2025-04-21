// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

// Define a function to create a Supabase client for client-side operations
export function createClient() {
  try {
    // Check if environment variables are defined
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // Silently handle missing environment variables
      return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
    }

    // Create and return the Supabase client using browser-specific function
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  } catch {
    // Silently handle errors and return a minimal client
    // This ensures the app doesn't crash for non-authenticated users
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  }
}