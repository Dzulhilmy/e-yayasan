import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/lib/mailer'

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

    const STATUS_MAP: Record<string, string> = {
      reviewed: 'disemak',
      approved: 'diluluskan',
      rejected: 'ditolak',
    }
    const normalizedStatus = (status || '').toString().trim().toLowerCase()
    const finalStatus = STATUS_MAP[normalizedStatus] ?? normalizedStatus
    const allowedStatuses = ['disemak', 'ditolak', 'diluluskan', 'submitted']
    if (!allowedStatuses.includes(finalStatus)) {
      return NextResponse.json({ error: 'invalid status' }, { status: 400 })
    }

    const updates: any = { status: finalStatus }

    const { data, error } = await supabase.from('applications').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const updatedApp = data as any
    let recipientEmail = updatedApp?.data?.email
    if (!recipientEmail && updatedApp?.user_id) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email')
        .eq('user_id', updatedApp.user_id)
        .single()
      recipientEmail = profileData?.email
    }

    if (recipientEmail) {
      try {
        await sendEmail({
          to: recipientEmail,
          subject: `Kemas kini permohonan anda: ${status}`,
          text: `Permohonan anda dengan nombor rujukan ${updatedApp.reference_number ?? '—'} telah dikemas kini kepada status ${status}. ${note ?? ''}`,
          html: `<p>Assalamualaikum / Salam Sejahtera,</p><p>Status permohonan anda telah dikemas kini kepada <strong>${status}</strong>.</p><p><strong>Nombor rujukan:</strong> ${updatedApp.reference_number ?? '—'}</p><p>${note ? `Nota admin: ${note}` : 'Tiada nota tambahan.'}</p>`,
        })
      } catch (emailError) {
        console.error('Email notification failed on admin update:', emailError)
      }
    }

    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 })
  }
}
