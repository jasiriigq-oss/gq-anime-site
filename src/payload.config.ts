import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { s3Storage } from '@payloadcms/storage-s3'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Quizzes } from './collections/Quizzes'
import { GameSessions } from './collections/GameSession'
import { Pages } from './collections/Pages'
import { SiteSettings } from './globals/SiteSettings'
import { GameSounds } from './globals/GameSounds'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Content lives in the Supabase Postgres database.
//   DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-1-<region>.pooler.supabase.com:6543/postgres
export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — GQE anime admin',
    },
  },
  collections: [Users, Media, Quizzes, GameSessions, Pages],
  globals: [SiteSettings, GameSounds],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      // The Supabase connection pooler presents a cert chain Node does not
      // trust out of the box ("self signed certificate in certificate chain"),
      // so verification is relaxed for the pooler connection.
      ssl: { rejectUnauthorized: false },
    },
    // Migrations are the only path to schema changes. Without this, running any
    // script that inits Payload with NODE_ENV unset auto-pushes the schema.
    push: false,
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        forcePathStyle: true, // required for Supabase Storage S3-compat endpoint
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION,
        endpoint: process.env.S3_ENDPOINT,
      },
    }),
  ],
})
