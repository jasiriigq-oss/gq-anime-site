// Lists the Supabase (Postgres) schema and key row counts.
// Usage: bun scripts/db-info.mjs
import fs from 'fs'
import pg from 'pg'

const env = Object.fromEntries(
  fs
    .readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]
    }),
)

// Supabase pooler cert chain is not trusted by Node by default; TLS is still used.
const c = new pg.Client({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
await c.connect()

const t = await c.query(`select tablename from pg_tables where schemaname='public' order by tablename`)
console.log(`tables (${t.rows.length}):`)
console.log('  ' + t.rows.map((r) => r.tablename).join(', '))

for (const tbl of ['users', 'media', 'quizzes', 'quizzes_questions', 'quizzes_questions_answers', 'game_session']) {
  try {
    const r = await c.query(`select count(*)::int n from ${tbl}`)
    console.log(`  ${tbl}: ${r.rows[0].n}`)
  } catch (e) {
    console.log(`  ${tbl}: ${e.message}`)
  }
}

const u = await c.query('select id,email,username,role from users order by id')
for (const r of u.rows) console.log('  user:', JSON.stringify(r))
const q = await c.query('select id,name,slug,cover_id from quizzes order by id')
for (const r of q.rows) console.log('  quiz:', JSON.stringify(r))

await c.end()
