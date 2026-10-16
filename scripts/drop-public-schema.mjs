// Drops every application table / view / enum in the Supabase `public` schema so
// Payload can create its schema from scratch. Destructive — run intentionally.
import fs from 'fs'
import pg from 'pg'
const { Client } = pg

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

const client = new Client({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
await client.connect()

const before = await client.query(`select tablename from pg_tables where schemaname='public' order by tablename`)
console.log(`public tables before: ${before.rows.length}`)
console.log(before.rows.map((r) => r.tablename).join(', '))

await client.query(`
do $$
declare r record;
begin
  for r in select table_name from information_schema.views where table_schema='public' loop
    execute 'drop view if exists public.' || quote_ident(r.table_name) || ' cascade';
  end loop;
  for r in select tablename from pg_tables where schemaname='public' loop
    execute 'drop table if exists public.' || quote_ident(r.tablename) || ' cascade';
  end loop;
  for r in select t.typname from pg_type t join pg_namespace n on n.oid=t.typnamespace
           where n.nspname='public' and t.typtype='e' loop
    execute 'drop type if exists public.' || quote_ident(r.typname) || ' cascade';
  end loop;
end $$;
`)

const after = await client.query(`select tablename from pg_tables where schemaname='public'`)
const views = await client.query(`select table_name from information_schema.views where table_schema='public'`)
const enums = await client.query(
  `select t.typname from pg_type t join pg_namespace n on n.oid=t.typnamespace where n.nspname='public' and t.typtype='e'`,
)
console.log(`public tables after:  ${after.rows.length}`)
console.log(`public views after:   ${views.rows.length}`)
console.log(`public enums after:   ${enums.rows.length}`)
await client.end()
