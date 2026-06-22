import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(req: Request) {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

	const { data: profile, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
	if (error) {
		// If no profile found, return null; otherwise surface server error
		return NextResponse.json({ profile: null })
	}
	return NextResponse.json({ profile })
}
