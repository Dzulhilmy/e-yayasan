import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, status, note } = body
    if (!id || !status) return NextResponse.json({ error: 'missing id or status' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // check admin via supabase user profile or admin cookie
    let allowed = false
    if (user && user.id) {
      const { data: profile } = await supabase.from('profiles').select('is_admin, meta').eq('user_id', user.id).single()
      const isAdmin = (profile && (profile.is_admin === true || (profile.meta && profile.meta.is_admin === true)))
      if (isAdmin) allowed = true
    }

    if (!allowed) {
      const { parseCookies, verifyAdminToken } = await import('@/lib/adminAuth')
      const cookieHeader = req.headers.get('cookie') || ''
      const cookies = parseCookies(cookieHeader)
      const token = cookies['admin_token']
      if (token && verifyAdminToken(token)) {
        allowed = true
      }
    }

    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const updates: any = { status }
    const now = new Date().toISOString()
    if (status === 'disemak' || status === 'reviewed') updates.reviewed_at = now
    if (status === 'diluluskan' || status === 'approved') updates.approved_at = now
    if (note) updates.admin_note = note

    const { data, error } = await supabase.from('applications').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 })
  }
}
