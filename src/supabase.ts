import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ''

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Prevents saving session tokens to localStorage/cookies
    autoRefreshToken: false, // Stops background token refresh attempts
    detectSessionInUrl: false, // Ignores auth tokens embedded in the URL hashes
  },
})
