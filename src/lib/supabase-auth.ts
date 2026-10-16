import 'server-only'
import { supabaseAdmin } from '@/lib/supabase-server'

export type EnsureAuthResult =
  | { ok: true; id: string; created: boolean }
  | { ok: false; error: string }

/** Find an existing Supabase Auth user id by email (paginated scan). */
export async function findSupabaseUserByEmail(email: string): Promise<string | null> {
  const admin = supabaseAdmin()
  const target = email.trim().toLowerCase()
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error || !data) return null
    const hit = data.users.find((u) => (u.email ?? '').toLowerCase() === target)
    if (hit) return hit.id
    if (data.users.length < 200) break
  }
  return null
}

/**
 * Create (or find) the Supabase Auth user matching an email.
 * - With `password`, the account is immediately usable for Supabase Auth login.
 * - Without `password` (e.g. backfilling users whose Payload password is hashed
 *   and therefore unrecoverable), the account is created email-confirmed but
 *   passwordless — the user must set one via a reset flow before using it.
 * Idempotent: an already-registered email is looked up and returned.
 */
export async function ensureSupabaseAuthUser(input: {
  email: string
  password?: string
  username?: string
}): Promise<EnsureAuthResult> {
  const admin = supabaseAdmin()
  const { data, error } = await admin.auth.admin.createUser({
    email: input.email.trim(),
    ...(input.password ? { password: input.password } : {}),
    email_confirm: true,
    user_metadata: input.username ? { username: input.username } : {},
  })

  if (!error && data?.user) return { ok: true, id: data.user.id, created: true }

  // Already registered (or created concurrently) — link the existing account.
  const existing = await findSupabaseUserByEmail(input.email)
  if (existing) return { ok: true, id: existing, created: false }

  return { ok: false, error: error?.message ?? 'Failed to create Supabase Auth user' }
}
