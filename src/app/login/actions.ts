'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

/**
 * Handles Logging in with NRIC and Password
 *
 * ROOT CAUSE (confirmed via diagnostic logging): the FormData was never
 * the problem — it always arrived correctly. The `.from('profiles').select(...)`
 * query was being silently filtered to zero rows by Row Level Security,
 * because the existing SELECT policy only allows a row to be read by an
 * already-authenticated matching user (`auth.uid() = user_id`). At the
 * point this lookup runs, the request is still anonymous — so RLS blocked
 * it for every NRIC, every time, regardless of whether the data existed.
 *
 * Fix: this now calls a SECURITY DEFINER Postgres function
 * (`get_email_by_nric`) via .rpc(), which runs with elevated privileges
 * internally but only ever returns the 3 columns needed (email, is_admin,
 * meta) for a single matched row — it does not grant anon broad table
 * access. See diagnose_rls_nric.sql for the function definition + grant.
 */
export async function login(formData: FormData) {
  const supabase = await createClient()

  const nricRaw = (formData.get('nric') as string)?.trim()
  const password = formData.get('password') as string
  const nric = nricRaw?.replace(/[-\s]/g, '')

  if (!nric || !password) {
    return redirect('/login?error=' + encodeURIComponent('Sila isi maklumat Kad Pengenalan dan Kata Laluan.'))
  }

  if (!/^\d{12}$/.test(nric)) {
    return redirect('/login?error=' + encodeURIComponent('Format No. Kad Pengenalan tidak sah. Sila semak semula.'))
  }

  // Step 1: Resolve NRIC -> email via SECURITY DEFINER function (bypasses
  // the RLS policy that was blocking anonymous lookups).
  const { data: rows, error: profileError } = await supabase
    .rpc('get_email_by_nric', { p_nric: nric })

  if (profileError) {
    console.error('login: profile lookup failed', profileError)
    return redirect('/login?error=' + encodeURIComponent('Ralat sistem. Sila cuba sebentar lagi.'))
  }

  const profile = rows?.[0]

  if (!profile?.email) {
    return redirect('/login?error=' + encodeURIComponent('No. Kad Pengenalan tidak dijumpai dalam sistem.'))
  }

  // Step 2: Sign in using the resolved email
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password,
  })

  if (authError) {
    return redirect('/login?error=' + encodeURIComponent('Kata laluan tidak sah. Sila cuba semula.'))
  }

  // Step 3: Redirect based on admin privileges
  const isAdmin = profile?.is_admin === true || profile?.meta?.is_admin === true
  revalidatePath('/', 'layout')
  return redirect(isAdmin ? '/admin/dashboard' : '/dashboard')
}

/**
 * Handles standard Email Signup if needed elsewhere
 */
export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = (formData.get('full_name') as string) || null

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return redirect('/login?error=' + encodeURIComponent(error.message))
  }

  try {
    const userId = data?.user?.id
    if (userId) {
      await supabase.from('profiles').upsert([{ user_id: userId, email, full_name }], { onConflict: 'user_id' })
    }
  } catch (e) {
    console.error('profile upsert error', e)
  }

  revalidatePath('/', 'layout')
  return redirect('/login?message=' + encodeURIComponent('Sila semak emel anda untuk mengesahkan akaun.'))
}

/**
 * Handles Sign Out
 */
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  return redirect('/')
}