import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const user_id = url.searchParams.get('user_id')
    if (!user_id) return NextResponse.json({ error: 'missing user_id' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // ensure user is admin via supabase or admin cookie
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

    const { data, error } = await supabase
      .from('documents')
      .select('id, name, file_url, file_size, mime_type, type, is_verified, uploaded_at')
      .eq('user_id', user_id)
      .order('uploaded_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 })
  }
}
