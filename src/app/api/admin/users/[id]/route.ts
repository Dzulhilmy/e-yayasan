// src/app/api/admin/users/[id]/route.ts
// PATCH  -> update a user's profile fields and/or status
// DELETE -> permanently delete a user (auth.users + profiles, cascades)

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })

  const { id } = await params
  const body = await req.json()
  const { full_name, nric, phone, address_line, postcode, city, state, status } = body

  const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() }
  if (full_name !== undefined) updatePayload.full_name = full_name
  if (nric !== undefined) updatePayload.nric = nric
  if (phone !== undefined) updatePayload.phone = phone
  if (address_line !== undefined) updatePayload.address_line = address_line
  if (postcode !== undefined) updatePayload.postcode = postcode
  if (city !== undefined) updatePayload.city = city
  if (state !== undefined) updatePayload.state = state
  if (status !== undefined) updatePayload.meta = { status }

  const { data, error } = await auth.supabase
    .from('profiles')
    .update(updatePayload)
    .eq('user_id', id)
    .select()
    .single()

  if (error) {
    console.error('PATCH /api/admin/users/[id] failed', error)
    return NextResponse.json({ error: 'Gagal mengemas kini pengguna.' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })

  const { id } = await params
  const admin = createAdminClient()

  // Deleting the auth user cascades to public.profiles via the
  // ON DELETE CASCADE foreign key already defined in your schema.
  const { error } = await admin.auth.admin.deleteUser(id)

  if (error) {
    console.error('DELETE /api/admin/users/[id] failed', error)
    return NextResponse.json({ error: 'Gagal memadam pengguna.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}