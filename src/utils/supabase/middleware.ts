import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/programs', '/feed', '/api/test-supabase', '/api/auth/user']
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function getSupabaseEnv() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // Don't throw here to avoid crashing middleware in environments
    // where env vars are not available (e.g., during static analysis).
    // Middleware will continue without checking session in that case.
    // eslint-disable-next-line no-console
    console.error(
      'Supabase middleware missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
    return null
  }

  return { SUPABASE_URL, SUPABASE_ANON_KEY }
}

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => route === pathname || (route !== '/' && pathname.startsWith(`${route}/`))
  )
}

export async function updateSession(request: NextRequest) {
  const env = getSupabaseEnv()
  const response = NextResponse.next({ request })

  // If env is missing, avoid creating a Supabase client in middleware
  // and return the response so the app doesn't crash with an overlay.
  if (!env) {
    return response
  }

  const { SUPABASE_URL, SUPABASE_ANON_KEY } = env

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !isPublicRoute(request.nextUrl.pathname)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
