import { createClient } from '@supabase/supabase-js'

const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key]
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string
  }
  return ''
}

const supabaseUrl =
  getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL') || 'https://placeholder.supabase.co'

const supabaseServiceKey =
  getEnvVar('SUPABASE_SERVICE_ROLE_KEY') ||
  getEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY') ||
  getEnvVar('VITE_SUPABASE_KEY')

export const serviceRoleSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
