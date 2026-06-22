import { NextResponse } from 'next/server'
import { TOKEN_NAME } from '@/lib/adminAuth'

export async function POST() {
  const resp = NextResponse.json({ ok: true })
  resp.headers.set('Set-Cookie', `${TOKEN_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
  return resp
}
