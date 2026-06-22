import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase.from('applications').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // Normalize returned rows for the frontend:
  // - ensure `ref` exists (use `reference_number` if present)
  // - ensure `steps` is an array
  const normalized = (data ?? []).map((row: any) => ({
    ...row,
    ref: row.ref ?? row.reference_number ?? null,
    steps: Array.isArray(row.steps) ? row.steps : (row.steps ? row.steps : []),
  }))

  return NextResponse.json({ data: normalized })
}
