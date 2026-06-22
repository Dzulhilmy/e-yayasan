import { NextResponse } from 'next/server'
import fetch from 'node-fetch'
import { comparePassword, signAdminToken, TOKEN_NAME } from '@/lib/adminAuth'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body
    if (!email || !password) return NextResponse.json({ error: 'missing' }, { status: 400 })

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE
    if (!SUPABASE_URL || !SERVICE_ROLE) return NextResponse.json({ error: 'server misconfigured' }, { status: 500 })

    // fetch profile by email using service_role
    const url = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/profiles?select=*&email=eq.${encodeURIComponent(email)}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${SERVICE_ROLE}`, apikey: SERVICE_ROLE } })
    if (!res.ok) return NextResponse.json({ error: 'not found' }, { status: 404 })
    const rows = await res.json()
    const profile = Array.isArray(rows) && rows.length > 0 ? rows[0] : null
    if (!profile || !profile.password_hash) return NextResponse.json({ error: 'invalid credentials' }, { status: 401 })

    const ok = comparePassword(password, profile.password_hash)
    if (!ok) return NextResponse.json({ error: 'invalid credentials' }, { status: 401 })

    const token = signAdminToken({ user_id: profile.user_id, email: profile.email })

    const resp = NextResponse.json({ ok: true })
    // set httpOnly cookie
    resp.headers.set('Set-Cookie', `${TOKEN_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7*24*60*60}`)
    return resp
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 })
  }
}
