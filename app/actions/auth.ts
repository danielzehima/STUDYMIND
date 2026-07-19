'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthFormState = { error?: string } | undefined

export async function login(
  _state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Email ou mot de passe incorrect.' }
  }

  redirect('/dashboard')
}

export async function signup(
  _state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  if (password.length < 8) {
    return { error: 'Le mot de passe doit contenir au moins 8 caractères.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    console.error('[signup]', error)
    return {
      error: "Impossible de créer le compte. Cet email est peut-être déjà utilisé.",
    }
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
