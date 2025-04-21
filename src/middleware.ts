import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { slugify } from '@/lib/utils'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  let session = null;

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            res.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: Record<string, unknown>) {
            res.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.getSession()

    // Silently handle auth errors - just treat as not authenticated
    if (!error) {
      session = data.session;
    }

    // Fully protected routes (require authentication)
    const fullyProtectedPaths = ['/protected', '/profile', '/watchlist', '/user']
    const isFullyProtectedPath = fullyProtectedPaths.some(path =>
      request.nextUrl.pathname.startsWith(path)
    )

    // Semi-protected routes (accessible to all, but with limited functionality for non-users)
    const semiProtectedPaths = ['/watch']
    // We're not using this variable yet, but keeping it for future use
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isSemiProtectedPath = semiProtectedPaths.some(path =>
      request.nextUrl.pathname.startsWith(path)
    )

    // Auth routes pattern
    const authPaths = ['/login', '/register', '/auth']
    const isAuthPath = authPaths.some(path =>
      request.nextUrl.pathname.startsWith(path)
    )

    // Handle fully protected routes - redirect to login if not authenticated
    if (isFullyProtectedPath && !session) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // For semi-protected routes, we'll let the page component handle the authentication
    // This allows the page to show limited content to non-authenticated users

    // Handle auth routes - redirect to home if already authenticated
    if (isAuthPath && session) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Check if the URL is using the old anime detail route pattern
    const oldAnimePattern = /^\/anime\/([^\/]+)$/;
    const animeMatch = request.nextUrl.pathname.match(oldAnimePattern);

    if (animeMatch) {
      const [, animeId] = animeMatch;

      // Check if the animeId is already a slug (contains non-UUID characters)
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(animeId)) {
        // It's already a slug, no need to redirect
        return res;
      }

      try {
        // Get the anime details to get the title
        const { data: anime } = await supabase
          .from('animes')
          .select('title')
          .eq('id', animeId)
          .single();

        if (anime?.title) {
          // Create a slug from the title
          const slug = slugify(anime.title);

          // Redirect to the new URL pattern with the anime name
          return NextResponse.redirect(
            new URL(`/anime/${slug || animeId}`, request.url)
          );
        }
      } catch (err) {
        console.error('Error in middleware:', err);
      }
    }
  } catch (err) {
    console.error('Unexpected error in middleware:', err);
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
}
