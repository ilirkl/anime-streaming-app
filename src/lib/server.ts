// src/lib/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            try {
              const cookieStore = await cookies()
              const cookie = await cookieStore.get(name)
              return cookie?.value
            } catch {
              // Silently handle cookie reading errors
              return ''
            }
          },
          async set(name: string, value: string, options: CookieOptions) {
            try {
              const cookieStore = await cookies()
              await cookieStore.set({
                name,
                value,
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
              })
            } catch {
              // Silently handle cookie setting errors
            }
          },
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          async remove(name: string, _options: CookieOptions) {
            try {
              const cookieStore = await cookies()
              await cookieStore.delete(name)
            } catch {
              // Silently handle cookie removal errors
            }
          }
        },
      }
    )
    return supabase
  } catch {
    // If there's an error creating the client, create a minimal client that won't throw errors
    // This ensures the app doesn't crash for non-authenticated users
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: () => '', set: () => {}, remove: () => {} } }
    )
  }
}

export async function getUser() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    // Silently return null for any auth errors - this is expected for non-logged in users
    if (error) {
      return null
    }
    return user
  } catch {
    // Silently return null for any unexpected errors
    return null
  }
}
