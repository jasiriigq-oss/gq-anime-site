/**
 * One-off migration: import the legacy Supabase content and the local SQLite
 * (Turso-style) content into the freshly created Supabase Postgres schema.
 *
 * Sources:
 *   backup/supabase-old/*.json   (the POC's Payload-on-Postgres data)
 *   backup/local-sqlite/*.json   (this site's previous SQLite data)
 *
 * Run:  bun src/scripts/transfer-data.ts
 */
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import pg from 'pg'
import { getPayload } from 'payload'
import config from '@/payload.config'

const read = (p: string) => JSON.parse(fs.readFileSync(path.resolve('backup', p), 'utf8'))
const SB_URL = process.env.SUPABASE_URL || ''
const SB_KEY = process.env.SUPABASE_SECRET_KEY || ''

const { Client } = pg
// Supabase's pooler cert chain is not trusted by Node by default; TLS is still
// used, verification is relaxed for this pooler connection only.
const sql = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

async function download(bucket: string, objectPath: string): Promise<Buffer> {
  const res = await fetch(`${SB_URL}/storage/v1/object/${bucket}/${encodeURI(objectPath)}`, {
    headers: { Authorization: `Bearer ${SB_KEY}`, apikey: SB_KEY },
  })
  if (!res.ok) throw new Error(`storage GET ${objectPath} -> ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)

await sql.connect()
const payload = await getPayload({ config: await config })
console.log('connected; starting transfer\n')

// ---------------------------------------------------------------- MEDIA
const mediaMap: Record<string, number> = {}
for (const m of read('supabase-old/media.json')) {
  const existing = await payload.find({ collection: 'media', where: { filename: { equals: m.filename } }, limit: 1 })
  if (existing.docs[0]) {
    mediaMap[String(m.id)] = existing.docs[0].id
    console.log(`media ${m.filename} already present -> ${existing.docs[0].id}`)
    continue
  }
  const bytes = await download('gqe-anime', `media/${m.filename}`)
  const doc = await payload.create({
    collection: 'media',
    data: { alt: m.alt },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    file: { data: bytes, mimetype: m.mime_type, name: m.filename, size: bytes.length } as any,
  })
  mediaMap[String(m.id)] = doc.id
  console.log(`media ${m.alt} (${m.filename}) -> id ${doc.id}  url ${doc.url}`)
}

// ---------------------------------------------------------------- USERS
async function ensureUser(opts: {
  email: string
  username: string
  role: 'admin' | 'user'
  points?: number
  salt?: string | null
  hash?: string | null
}) {
  const found = await payload.find({ collection: 'users', where: { email: { equals: opts.email } }, limit: 1 })
  const doc =
    found.docs[0] ??
    (await payload.create({
      collection: 'users',
      data: {
        email: opts.email,
        username: opts.username,
        role: opts.role,
        points: opts.points ?? 0,
        password: crypto.randomUUID(),
      },
    }))
  if (opts.salt && opts.hash) {
    // Preserve the original password by restoring its salt + hash.
    await sql.query('update users set salt=$1, hash=$2 where id=$3', [opts.salt, opts.hash, doc.id])
  }
  console.log(`user ${opts.email} (${opts.username}) -> id ${doc.id}`)
  return doc
}

const oldUsers = read('supabase-old/users.json')
const localUsers = read('local-sqlite/users.json')

const oldAdmin = await ensureUser({
  email: oldUsers[0].email,
  username: 'MoveAdmin',
  role: 'admin',
  salt: oldUsers[0].salt,
  hash: oldUsers[0].hash,
})
const localAdmin = await ensureUser({
  email: localUsers[0].email,
  username: localUsers[0].username,
  role: 'admin',
  points: localUsers[0].points ?? 0,
  salt: localUsers[0].salt,
  hash: localUsers[0].hash,
})

// ---------------------------------------------------------------- QUIZZES
async function ensureQuiz(slug: string, data: Record<string, unknown>) {
  const found = await payload.find({ collection: 'quizzes', where: { slug: { equals: slug } }, limit: 1 })
  if (found.docs[0]) {
    console.log(`quiz ${slug} already present -> id ${found.docs[0].id}`)
    return found.docs[0]
  }
  const doc = await payload.create({ collection: 'quizzes', data: { ...data, slug } as never })
  console.log(`quiz "${data.name}" -> id ${doc.id} slug ${doc.slug} (${(data.questions as unknown[]).length} questions)`)
  return doc
}

// --- legacy Naruto quiz (from the old Postgres shape: separate questions + answers)
const oldQuiz = read('supabase-old/quizzes.json')[0]
const oldQuestions = read('supabase-old/questions.json')
const oldAnswers = read('supabase-old/questions_answers.json')
const oldLinks = read('supabase-old/quizzes_questions.json')
const narutoLinkedIds = oldLinks
  .filter((l: { _parent_id: number }) => l._parent_id === oldQuiz.id)
  .sort((a: { _order: number }, b: { _order: number }) => a._order - b._order)
  .map((l: { question_id: number }) => l.question_id)

const narutoQuestions = narutoLinkedIds.map((qid: number) => {
  const q = oldQuestions.find((x: { id: number }) => x.id === qid)
  return {
    questionText: q.question_text,
    questionType: q.question_type,
    image: q.hint_image_id ? mediaMap[String(q.hint_image_id)] : undefined,
    audio: q.hint_sound_id ? mediaMap[String(q.hint_sound_id)] : undefined,
    video: q.hint_video_id ? mediaMap[String(q.hint_video_id)] : undefined,
    hintText: q.hint_text ?? undefined,
    timeLimitSeconds: Number(q.time_limit) || 15,
    points: 10,
    answers: oldAnswers
      .filter((a: { _parent_id: number }) => a._parent_id === qid)
      .sort((a: { _order: number }, b: { _order: number }) => a._order - b._order)
      .map((a: { text: string; is_correct: boolean; image_id: number | null }) => ({
        text: a.text,
        isCorrect: Boolean(a.is_correct),
        image: a.image_id ? mediaMap[String(a.image_id)] : undefined,
      })),
  }
})

await ensureQuiz(slugify(oldQuiz.name), {
  name: oldQuiz.name,
  cover: oldQuiz.cover_id ? mediaMap[String(oldQuiz.cover_id)] : undefined,
  series: 'Naruto',
  category: 'trivia',
  difficulty: 3,
  expectedTimeMinutes: 5,
  published: true,
  likes: 0,
  author: oldAdmin.id,
  questions: narutoQuestions,
})

// --- current Jujutsu Kaisen quiz (from the local SQLite shape: nested arrays)
const lq = read('local-sqlite/quizzes.json')[0]
const lqs = read('local-sqlite/quizzes_questions.json')
const las = read('local-sqlite/quizzes_questions_answers.json')

const jjkQuestions = lqs
  .filter((q: { _parent_id: number }) => q._parent_id === lq.id)
  .sort((a: { _order: number }, b: { _order: number }) => a._order - b._order)
  .map((q: { id: string; question_text: string; question_type: string; time_limit_seconds: number; points: number; hint_text: string | null }) => ({
    questionText: q.question_text,
    questionType: q.question_type,
    timeLimitSeconds: q.time_limit_seconds ?? 15,
    points: q.points ?? 10,
    hintText: q.hint_text ?? undefined,
    answers: las
      .filter((a: { _parent_id: string }) => a._parent_id === q.id)
      .sort((a: { _order: number }, b: { _order: number }) => a._order - b._order)
      .map((a: { text: string; is_correct: number }) => ({ text: a.text, isCorrect: Boolean(a.is_correct) })),
  }))

const jjk = await ensureQuiz(lq.slug, {
  name: lq.name,
  series: lq.series ?? undefined,
  category: lq.category,
  difficulty: lq.difficulty ?? 3,
  expectedTimeMinutes: lq.expected_time_minutes ?? 10,
  description: lq.description ? JSON.parse(lq.description) : undefined,
  settings: {
    multiplayerEnabled: Boolean(lq.settings_multiplayer_enabled),
    soloPlayEnabled: Boolean(lq.settings_solo_play_enabled),
    challengeMode: Boolean(lq.settings_challenge_mode),
  },
  published: Boolean(lq.published),
  likes: lq.likes ?? 0,
  playCount: lq.play_count ?? 0,
  author: localAdmin.id,
  questions: jjkQuestions,
})

// ---------------------------------------------------------------- SETTINGS
const ident = read('supabase-old/site_identity.json')[0]
await payload.updateGlobal({
  slug: 'site-settings',
  data: {
    siteName: ident?.site_name ?? 'GQE anime',
    tagline: 'Ultimate Anime Quizzes. Test your knowledge on every series, character, and genre.',
    logo: ident?.logo_id ? mediaMap[String(ident.logo_id)] : undefined,
  },
})
console.log(`site-settings updated (siteName="${ident?.site_name}")`)

// ---------------------------------------------------------------- GAME SESSIONS
const narutoQuiz = await payload.find({ collection: 'quizzes', where: { slug: { equals: slugify(oldQuiz.name) } }, limit: 1 })
const narutoId = narutoQuiz.docs[0]?.id
for (const gs of read('supabase-old/game_session.json')) {
  const exists = await payload.find({ collection: 'game-session', where: { name: { equals: gs.name } }, limit: 1 })
  if (exists.docs[0]) {
    console.log(`session "${gs.name}" already present`)
    continue
  }
  if (!narutoId) break
  const doc = await payload.create({
    collection: 'game-session',
    data: {
      name: gs.name,
      quiz: narutoId,
      state: gs.state ?? 'setup',
      playerCount: Number(gs.player_count) || 2,
      owners: [{ user: oldAdmin.id }],
    },
  })
  console.log(`session "${gs.name}" -> id ${doc.id}`)
}

// ---------------------------------------------------------------- SUMMARY
const counts = await Promise.all([
  payload.count({ collection: 'users' }),
  payload.count({ collection: 'media' }),
  payload.count({ collection: 'quizzes' }),
  payload.count({ collection: 'game-session' }),
])
console.log(`\nDONE. users=${counts[0].totalDocs} media=${counts[1].totalDocs} quizzes=${counts[2].totalDocs} game-session=${counts[3].totalDocs}`)
await sql.end()
process.exit(0)
