import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    group: 'Site',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      defaultValue: 'GQE anime',
      required: true,
    },
    {
      name: 'tagline',
      type: 'text',
      defaultValue:
        'Ultimate Anime Quizzes. Test your knowledge on every series, character, and genre.',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'footerLinks',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
      defaultValue: [
        { label: 'Terms', url: '/terms' },
        { label: 'Privacy', url: '/privacy' },
        { label: 'Submit a Quiz', url: '/create' },
      ],
    },
  ],
}
