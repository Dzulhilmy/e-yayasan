import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { file_path, expires = 900 } = body
    if (!file_path) return NextResponse.json({ error: 'missing file_path' }, { status: 400 })

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

    const { data, error } = await supabase.storage.from('vault').createSignedUrl(file_path as string, expires)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const url = (data as any)?.signedUrl || (data as any)?.signedURL || (data as any)?.signed_url
    if (!url) return NextResponse.json({ error: 'no url returned' }, { status: 500 })
    return NextResponse.json({ url })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 })
  }
}
