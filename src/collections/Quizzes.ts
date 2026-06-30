import type { CollectionConfig } from 'payload'

export const Quizzes: CollectionConfig = {
  slug: 'quizzes',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'cover',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'questions',
      type: 'array',
      fields: [
        {
          name: 'question',
          type: 'relationship',
          relationTo: 'questions',
          required: true,
        },
      ],
    },
  ],
}
