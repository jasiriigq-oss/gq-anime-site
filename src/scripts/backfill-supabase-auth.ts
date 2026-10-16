/**
 * Backfills Supabase Auth users for existing Payload users that aren't linked yet
 * (e.g. move.app.2k@gmail.com), and stores the auth id on the Payload user.
 *
 * NOTE: Payload stores passwords as salt+hash, so an existing user's password is
 * NOT recoverable and cannot be copied to Supabase Auth. These backfilled accounts
 * are created email-confirmed but passwordless — the user must set a password via
 * a Supabase reset flow before they can sign in with Supabase Auth.
 *
 * Run:  bun src/scripts/backfill-supabase-auth.ts
 */
import { getPayload } from 'payload'
import config from '@/payload.config'
import { ensureSupabaseAuthUser } from '@/lib/supabase-auth'

const payload = await getPayload({ config: await config })

const { docs } = await payload.find({ collection: 'users', limit: 1000, depth: 0 })
console.log(`payload users: ${docs.length}\n`)

let created = 0
let linked = 0
let skipped = 0
let failed = 0

for (const u of docs) {
  if (u.supabaseUserId) {
    console.log(`• skip   ${u.email} (already linked -> ${u.supabaseUserId})`)
    skipped++
    continue
  }

  const res = await ensureSupabaseAuthUser({ email: u.email, username: u.username })
  if (!res.ok) {
    console.log(`✗ FAIL   ${u.email}: ${res.error}`)
    failed++
    continue
  }

  await payload.update({
    collection: 'users',
    id: u.id,
    data: { supabaseUserId: res.id },
  })

  if (res.created) {
    created++
    console.log(`✓ create ${u.email} -> supabase auth ${res.id} (no password set)`)
  } else {
    linked++
    console.log(`✓ link   ${u.email} -> existing supabase auth ${res.id}`)
  }
}

console.log(`\nDONE created=${created} linked=${linked} skipped=${skipped} failed=${failed}`)
process.exit(failed > 0 ? 1 : 0)
