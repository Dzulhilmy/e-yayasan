// src/app/api/admin/users/[id]/reset-password/route.ts
//
// Admin-triggered password reset for a user who forgot their password.
// Two modes supported — pick whichever fits your support workflow:
//
//   mode: "set"  -> admin sets a specific new password directly
//                   (good for over-the-phone resets where staff reads
//                   a temporary password to the caller)
//
//   mode: "link" -> sends the user a password-reset email with a
//                   secure link (good for self-service, no temp
//                   password ever shown to staff)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, status: 401 }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, meta, email')
    .eq('user_id', user.id)
    .maybeSingle()

  const isAdmin = profile?.is_admin === true || (profile?.meta as any)?.is_admin === true
  if (!isAdmin) return { ok: false as const, status: 403 }

  return { ok: true as const, supabase }
}

function generateTempPassword(): string {
  // e.g. "Pk7$mQ2xR9"
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%'
  let out = ''
  for (let i = 0; i < 10; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const mode: 'set' | 'link' = body?.mode === 'link' ? 'link' : 'set'

  const admin = createAdminClient()

  if (mode === 'set') {
    const tempPassword = generateTempPassword()

    const { error } = await admin.auth.admin.updateUserById(id, {
      password: tempPassword,
    })

    if (error) {
      console.error('reset-password (set) failed', error)
      return NextResponse.json({ error: 'Gagal menetapkan kata laluan baharu.' }, { status: 500 })
    }

    // Returned ONCE to the admin UI so staff can read it to the user.
    // Never logged, never stored — only ever in this single response.
    return NextResponse.json({ success: true, mode: 'set', tempPassword })
  }

  // mode === 'link'
  const { data: profile } = await admin
    .from('profiles')
    .select('email')
    .eq('user_id', id)
    .maybeSingle()

  if (!profile?.email) {
    return NextResponse.json({ error: 'Emel pengguna tidak ditemui.' }, { status: 404 })
  }

  const { error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email: profile.email,
  })

  if (error) {
    console.error('reset-password (link) failed', error)
    return NextResponse.json({ error: 'Gagal menghantar pautan tetapan semula.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, mode: 'link', email: profile.email })
}