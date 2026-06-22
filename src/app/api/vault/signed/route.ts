import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, file_path, expires = 900 } = body

    if (!id && !file_path) return NextResponse.json({ error: 'missing id or file_path' }, { status: 400 })

    const supabase = await createClient()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 })
    if (!user?.id) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

    let path = file_path
    if (!path) {
      // look up by id and ensure ownership
      const { data: doc, error: docErr } = await supabase
        .from('documents')
        .select('file_url')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (docErr) return NextResponse.json({ error: docErr.message }, { status: 404 })
      path = (doc as any).file_url
    } else {
      // if path provided, verify it belongs to the user
      const { data: rows, error: rowsErr } = await supabase
        .from('documents')
        .select('id')
        .eq('file_url', path)
        .eq('user_id', user.id)

      if (rowsErr || !rows || rows.length === 0) return NextResponse.json({ error: 'not found or unauthorized' }, { status: 404 })
    }

    const { data, error } = await supabase.storage.from('vault').createSignedUrl(path as string, expires)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // support several possible property names returned by client
    const url = (data as any)?.signedUrl || (data as any)?.signedURL || (data as any)?.signed_url || (data as any)?.signedurl
    if (!url) return NextResponse.json({ error: 'no url returned' }, { status: 500 })

    return NextResponse.json({ url })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 })
  }
}
