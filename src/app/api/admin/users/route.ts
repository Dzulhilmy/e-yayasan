// src/app/api/admin/users/route.ts
// GET  -> list all profiles (for the Segmen Pengguna table)
// POST -> create a new user (auth.users + profiles row)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, status: 401 }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, meta')
    .eq('user_id', user.id)
    .maybeSingle()

  const isAdmin = profile?.is_admin === true || (profile?.meta as any)?.is_admin === true
  if (!isAdmin) return { ok: false as const, status: 403 }

  return { ok: true as const, supabase }
}

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })

  const { data, error } = await auth.supabase
    .from('profiles')
    .select('user_id, email, full_name, nric, phone, address_line, postcode, city, state, is_admin, meta, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('GET /api/admin/users failed', error)
    return NextResponse.json({ error: 'Gagal memuatkan pengguna.' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })

  const body = await req.json()
  const { email, full_name, nric, phone, address_line, postcode, city, state, password } = body

  if (!email || !password || !full_name) {
    return NextResponse.json({ error: 'Emel, nama penuh, dan kata laluan diperlukan.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // 1. Create the auth user via the Admin API (this handles password
  //    hashing, identity rows, etc — no need to do it manually like the
  //    raw SQL seed does).
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  })

  if (createError || !created?.user) {
    console.error('createUser failed', createError)
    return NextResponse.json({ error: createError?.message ?? 'Gagal mencipta pengguna.' }, { status: 400 })
  }

  // 2. Insert the matching profile row
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .insert({
      user_id: created.user.id,
      email,
      full_name,
      nric: nric ?? null,
      phone: phone ?? null,
      address_line: address_line ?? null,
      postcode: postcode ?? null,
      city: city ?? null,
      state: state ?? null,
      is_admin: false,
      meta: { status: 'verified' },
    })
    .select()
    .single()

  if (profileError) {
    console.error('profile insert failed', profileError)
    // Roll back the auth user so we don't end up with an orphaned account
    await admin.auth.admin.deleteUser(created.user.id)
    return NextResponse.json({ error: 'Gagal menyimpan profil pengguna.' }, { status: 500 })
  }

  return NextResponse.json({ data: profile }, { status: 201 })
}