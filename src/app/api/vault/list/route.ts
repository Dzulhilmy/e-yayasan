import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 })
    if (!user?.id) return NextResponse.json({ data: [] })

    const { data, error } = await supabase
      .from('documents')
      .select('id, name, file_url, file_size, mime_type, type, is_verified, uploaded_at')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 })
  }
}
