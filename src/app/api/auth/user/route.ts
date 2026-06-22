import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    // If there's a logged-in user, try to load their profile row from the `profiles` table
    let profile = null
    if (user?.id) {
      const { data: p, error: pErr } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, phone, nric')
        .eq('user_id', user.id)
        .single()

      if (!pErr && p) {
        profile = {
          ...p,
          id: p.user_id,
          ic_number: p.nric,
        }
      }
      else console.debug('profiles fetch error', pErr?.message)
    }

    return NextResponse.json({ user, profile })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 })
  }
}
