import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  upload: {
    // Supabase Storage S3-compat accepts a broad range of game assets.
    mimeTypes: [
      'image/*',
      'audio/*',
      'video/*',
      'application/octet-stream',
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}
