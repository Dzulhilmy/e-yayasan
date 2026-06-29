import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let allowed = false
    if (user && user.id) {
      const { data: profile } = await supabase.from('profiles').select('is_admin, meta').eq('user_id', user.id).single()
      const isAdmin = profile && (profile.is_admin === true || (profile.meta && profile.meta.is_admin === true))
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

    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const bulk = url.searchParams.get('bulk') === 'true'

    if (bulk) {
      const { error } = await supabase.from('applications').delete().in('status', ['ditolak', 'rejected'])
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const { data, error } = await supabase.from('applications').delete().eq('id', id).single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 })
  }
}
