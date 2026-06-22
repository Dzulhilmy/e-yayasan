import { NextResponse } from 'next/server'
import fetch from 'node-fetch'
import { hashPassword } from '@/lib/adminAuth'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, full_name } = body
    if (!email || !password) return NextResponse.json({ error: 'missing' }, { status: 400 })

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE
    if (!SUPABASE_URL || !SERVICE_ROLE) return NextResponse.json({ error: 'server misconfigured' }, { status: 500 })

    const pwdHash = hashPassword(password)

    // upsert profile via PostgREST
    const url = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/profiles`
    const bodyObj = { email, full_name: full_name || null, password_hash: pwdHash, is_admin: true }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE}`,
        apikey: SERVICE_ROLE,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(bodyObj),
    })

    const text = await res.text()
    if (!res.ok) return NextResponse.json({ error: text }, { status: 500 })
    return NextResponse.json({ ok: true, data: JSON.parse(text) })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 })
  }
}
