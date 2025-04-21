import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = await request.cookies.get(name);
          return cookie?.value;
        },
        async set(name: string, value: string, options: Record<string, unknown>) {
          await request.cookies.set(name, value);
          supabaseResponse = NextResponse.next({
            request,
          })
          await supabaseResponse.cookies.set(name, value, options);
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async remove(name: string, options: Record<string, unknown>) {
          await request.cookies.delete(name);
          // NextResponse.cookies.delete() doesn't accept options in Next.js 15
          await supabaseResponse.cookies.delete(name);
        },
      },
    }
  )

  await supabase.auth.getUser()

  return supabaseResponse
}

