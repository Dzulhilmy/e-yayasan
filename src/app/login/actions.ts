'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = (formData.get('full_name') as string) || null

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {},
    },
  })

  // If signUp returned a user immediately (no email confirmation required), create profile
  try {
    const userId = (data as any)?.user?.id
    if (userId) {
      await supabase.from('profiles').upsert([{ user_id: userId, email, full_name }], { onConflict: 'user_id' })
    }
  } catch (e) {
    // ignore profile insertion errors here
    console.error('profile upsert error', e)
  }

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Check your email to confirm your account')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

// Google OAuth sign-in removed: application uses email/password signup only.

