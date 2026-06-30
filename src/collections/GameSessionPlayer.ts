import type { CollectionConfig } from 'payload'

export const GameSessionPlayers: CollectionConfig = {
  slug: 'game-session-player',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'session',
      type: 'relationship',
      relationTo: 'game-session',
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'picture',
      type: 'text',
      required: true,
    },
    {
      name: 'answers',
      type: 'json',
      required: true,
      defaultValue: [],
    },
    {
      name: 'score',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'eliminated',
      type: 'checkbox',
      required: true,
      defaultValue: false,
    },
    {
      name: 'index',
      type: 'number',
      required: true,
    },
    {
      name: 'ready',
      label: 'Is Ready',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
