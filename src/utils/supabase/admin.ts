// src/utils/supabase/admin.ts
//
// Service-role client — has full admin privileges (bypasses RLS, can
// reset other users' passwords, delete auth users, etc).
//
// NEVER import this into any client component or expose it to the
// browser. Only use inside server-only files: API routes (route.ts)
// or Server Actions (actions.ts).
//
// Requires SUPABASE_SERVICE_ROLE_KEY in your .env — this is the
// "service_role" secret from Supabase dashboard → Settings → API.
// It must NOT be prefixed with NEXT_PUBLIC_, or it will be bundled
// into client-side JS and leak to every visitor.

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export function createAdminClient() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error(
      'Admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-only, no NEXT_PUBLIC_ prefix).'
    )
  }

  return createSupabaseClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}