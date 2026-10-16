import type { CollectionConfig } from 'payload'

// A persistent record of a hosted game. The live game state (players, answers,
// chat, round) is owned by Supabase Realtime; this record links a quiz + host to
// the Supabase room so hosts can list/rejoin their sessions.
export const GameSessions: CollectionConfig = {
  slug: 'game-session',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'state', 'quiz', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
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
      admin: {
        description: 'The host(s) who can control this game.',
      },
    },
    {
      name: 'quiz',
      type: 'relationship',
      relationTo: 'quizzes',
      required: true,
    },
    {
      name: 'state',
      type: 'select',
      defaultValue: 'setup',
      options: [
        { label: 'Setup / Lobby', value: 'setup' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Ended', value: 'ended' },
      ],
    },
    {
      name: 'roomCode',
      label: 'Supabase Room Code',
      type: 'text',
      unique: true,
      admin: {
        description: 'The 6-character join code used by Supabase Realtime.',
      },
    },
    {
      name: 'playerCount',
      type: 'number',
      min: 1,
      max: 100,
      defaultValue: 2,
    },
    {
      name: 'round',
      type: 'number',
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'startTime',
      type: 'date',
    },
    {
      name: 'endTime',
      type: 'date',
    },
  ],
}
