import type { CollectionConfig } from 'payload'

// Static content pages (Terms, Privacy, About, Submit a Quiz…). Content is a
// markdown-capable richText field.
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Route path, e.g. `/terms`, `/privacy`.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Content (markdown)',
      required: true,
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
