import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { s3Storage } from '@payloadcms/storage-s3'
import { postgresAdapter } from '@payloadcms/db-postgres'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Quizzes } from './collections/Quizzes'
import { PagesPlugin } from './m0ves/plugins/pages/plugin'
import { SiteIdentityPlugin } from './m0ves/plugins/site-identity/plugin'
import { SeoPlugin } from './m0ves/plugins/seo/plugin'
import { NestedDOCPlugin } from './m0ves/plugins/nested-doc/plugin'
import { SearchPlugin } from './m0ves/plugins/search/plugin'
import { StripePlugin } from './m0ves/plugins/stripe/plugin'
import { NavigationPlugin } from './m0ves/plugins/navigation/plugin'
import { Questions } from './collections/Questions'
import { GameSessions } from './collections/GameSession'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  plugins: [
    NavigationPlugin,
    PagesPlugin,
    StripePlugin,
    SiteIdentityPlugin,
    // Need to go last
    SeoPlugin,
    NestedDOCPlugin,
    SearchPlugin,
    // ImportExportPlugin,
    //RedirectsPlugin,
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        forcePathStyle: true, // Important for using Supabase
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION,
        endpoint: process.env.S3_ENDPOINT,
      },
    }),
  ],
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Quizzes, Questions, GameSessions],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
})
