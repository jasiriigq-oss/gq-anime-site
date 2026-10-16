import { createClient } from '@supabase/supabase-js'

// Browser client. Uses the anon/publishable key and is used ONLY for Realtime
// subscriptions and reads of the live game tables. All authoritative writes go
// through server actions (which use the service role).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ''

export const supabaseBrowser = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseKey)
}
