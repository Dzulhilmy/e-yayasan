import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { id, file_path } = body

    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })

    const supabase = await createClient()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 })
    if (!user?.id) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

    // delete storage object if path provided
    if (file_path) {
      try {
        const { error: storageErr } = await supabase.storage.from('vault').remove([file_path])
        if (storageErr) {
          // log but continue to remove DB row
          console.error('storage remove error', storageErr)
        }
      } catch (err) {
        console.error('storage remove exception', err)
      }
    }

    const { data, error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 })
  }
}
