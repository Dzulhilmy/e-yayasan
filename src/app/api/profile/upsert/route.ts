import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

	const body = await req.json()
	const { full_name, nric, phone, address_line, postcode, city, state } = body

	// Server-side validation
	const errors: string[] = []
	const trim = (s: any) => (typeof s === 'string' ? s.trim() : '')
	const cleanedName = trim(full_name)
	const cleanedNric = trim(nric)
	const cleanedPhone = trim(phone)
	const cleanedPostcode = trim(postcode)
	const cleanedAddress = trim(address_line)
	const cleanedCity = trim(city)
	const cleanedState = trim(state)

	// NRIC: allow 12 digits with optional dashes (YYMMDD-##-#### or 12 digits)
	const nricRegex = /^(?:\d{6}-?\d{2}-?\d{4}|\d{12})$/
	if (cleanedNric && !nricRegex.test(cleanedNric)) errors.push('Invalid NRIC format')

	// Postcode: Malaysian 5 digits
	if (cleanedPostcode && !/^\d{5}$/.test(cleanedPostcode)) errors.push('Invalid postcode')

	// Phone: allow numbers, spaces, +, - and must be 8-15 chars
	if (cleanedPhone && !/^[+\d][\d\s-]{7,14}$/.test(cleanedPhone)) errors.push('Invalid phone')

	if (errors.length > 0) {
		return NextResponse.json({ error: errors.join('; ') }, { status: 400 })
	}

	const { error } = await supabase.from('profiles').upsert({
		user_id: user.id,
		email: user.email,
		full_name: cleanedName,
		nric: cleanedNric,
		phone: cleanedPhone,
		address_line: cleanedAddress,
		postcode: cleanedPostcode,
		city: cleanedCity,
		state: cleanedState,
		updated_at: new Date().toISOString()
	}, { onConflict: 'user_id' })

	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ ok: true })
}

