import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ isAdmin: false })

    const { data: profile, error } = await supabase.from('profiles').select('is_admin, meta').eq('user_id', user.id).single()
    if (error) return NextResponse.json({ isAdmin: false })

    const isAdmin = (profile && (profile.is_admin === true || (profile.meta && profile.meta.is_admin === true)))
    return NextResponse.json({ isAdmin: !!isAdmin })
  } catch (err) {
    return NextResponse.json({ isAdmin: false })
  }
}
