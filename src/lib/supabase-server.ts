import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Service-role client for server-side authoritative game writes and reads that
// anonymous clients must not perform (e.g. the answer key). Never import this
// in a client component.
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SECRET_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Supabase service credentials are missing. Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env',
    )
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
