import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function signInWithGoogle() {
  const width = 500
  const height = 600
  const left = window.screenX + (window.outerWidth - width) / 2
  const top = window.screenY + (window.outerHeight - height) / 2

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}`,
      skipBrowserRedirect: true,
    },
  })
  if (error) throw error

  if (data?.url) {
    const popup = window.open(
      data.url,
      'google-oauth-popup',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`
    )
    if (popup) {
      popup.focus()
    } else {
      // Fallback if browser popup blocker prevents opening popup
      window.location.href = data.url
    }
  }
  return data
}

export async function signInWithEmail(email: string, pass: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  })
  if (error) throw error
  return data
}

export async function signUpWithEmail(email: string, pass: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
