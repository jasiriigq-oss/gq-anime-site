import type { CollectionConfig } from 'payload'

export const GameSessions: CollectionConfig = {
  slug: 'game-session',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'owners',
      type: 'array',
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
        },
      ],
      defaultValue: [],
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'playerCount',
      type: 'number',
      max: 4,
    },
    {
      name: 'round',
      type: 'number',
      min: 0,
    },
    {
      name: 'state',
      type: 'select',
      options: [
        {
          label: 'Setup',
          value: 'setup',
        },
        {
          label: 'In Progress',
          value: 'in-progress',
        },
        {
          label: 'Ended',
          value: 'ended',
        },
      ],
    },
    {
      name: 'startTime',
      type: 'date',
    },
    {
      name: 'endTime',
      type: 'date',
    },
    {
      name: 'quiz',
      type: 'relationship',
      relationTo: 'quizzes',
      required: true,
    },

    {
      name: 'players',
      type: 'json',
      defaultValue: [],
    },
  ],
}
