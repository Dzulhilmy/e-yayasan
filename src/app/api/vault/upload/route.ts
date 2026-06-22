import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { file_path, file_name, size, mime, doc_type } = body

    if (!file_path || !file_name) return NextResponse.json({ error: 'missing' }, { status: 400 })

    const supabase = await createClient()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 })
    if (!user?.id) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

    const { data, error } = await supabase.from('documents').insert([{
      user_id: user.id,
      name: file_name,
      file_url: file_path,
      file_size: size,
      mime_type: mime,
      type: doc_type,
      is_verified: false,
    }])

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 })
  }
}
