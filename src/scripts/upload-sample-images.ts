/**
 * Uploads image assets for the sample quiz (Jujutsu Kaisen Cursed Energy Test):
 * a cover image (extracted from the design mockup) and uses it as the first
 * question's image too. Uploads go through Payload -> Supabase Storage (S3).
 *
 * Run:  bun src/scripts/upload-sample-images.ts
 */
import fs from 'fs'
import pg from 'pg'
import { getPayload } from 'payload'
import config from '@/payload.config'

const { Client } = pg
// Supabase pooler cert chain is not trusted by Node by default; TLS is still used.
const sql = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

const CROP =
  'C:/Users/ventr/AppData/Local/hermes/profiles/qge-anime-developer/cache/scratch/qge-seed/out/jjk-crop.png'

await sql.connect()
const payload = await getPayload({ config: await config })

const bytes = fs.readFileSync(CROP)
console.log(`source image: ${bytes.length} bytes`)

// 1) Upload the image through Payload (stores in Supabase Storage).
const existing = await payload.find({
  collection: 'media',
  where: { filename: { equals: 'jujutsu-kaisen-cover.png' } },
  limit: 1,
})
const media =
  existing.docs[0] ??
  (await payload.create({
    collection: 'media',
    data: { alt: 'Jujutsu Kaisen Cursed Energy Test — cover' },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    file: { data: bytes, mimetype: 'image/png', name: 'jujutsu-kaisen-cover.png', size: bytes.length } as any,
  }))
console.log(`media id=${media.id} filename=${media.filename} url=${media.url}`)

// 2) Attach it to the sample quiz.
const quiz = (
  await payload.find({
    collection: 'quizzes',
    where: { slug: { equals: 'jujutsu-kaisen-cursed-energy-test' } },
    limit: 1,
  })
).docs[0]
if (!quiz) throw new Error('sample quiz not found')

await sql.query('update quizzes set cover_id=$1, updated_at=now() where id=$2', [media.id, quiz.id])
// First question asks about Gojo's technique — it fits the image.
await sql.query(
  `update quizzes_questions set image_id=$1, question_type='image' where _parent_id=$2 and _order=1`,
  [media.id, quiz.id],
)

const after = await sql.query('select id, name, cover_id from quizzes where id=$1', [quiz.id])
const q = await sql.query('select _order, question_type, image_id from quizzes_questions where _parent_id=$1 order by _order', [quiz.id])
console.log('quiz now:', JSON.stringify(after.rows[0]))
console.log('questions:', JSON.stringify(q.rows))

await sql.end()
process.exit(0)
