import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'username', 'role'],
  },
  auth: true,
  access: {
    // Anyone can read the public profile fields of a user (used for leaderboards).
    read: () => true,
  },
  fields: [
    {
      name: 'username',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      minLength: 3,
      maxLength: 24,
      admin: {
        description: 'Public display name shown on leaderboards and in-game.',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'user',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
      access: {
        // Only admins can change role.
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
    {
      name: 'points',
      label: 'Lifetime Points',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Accumulated points across all games (drives global rank).',
      },
    },
    {
      name: 'supabaseUserId',
      label: 'Supabase Auth User ID',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Linked Supabase Auth (auth.users) id — set on signup.',
      },
    },
  ],
}
