import type { CollectionConfig } from 'payload'

export const GameSessions: CollectionConfig = {
  slug: 'game-session',
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
      name: 'players_info_json',
      type: 'json',
      defaultValue: {
        players: [],
      },
    },
  ],
}

export interface GameSession_Answer {
  value: string
}

export interface GameSession_Player {
  id: string
  name: string
  player_picture: number
  answers: GameSession_Answer[]
  score: number
  eliminated: boolean
}

export interface GameSession_PlayerInfo_JSON {
  players: GameSession_Player[]
}

export function createNewGameSessionPlayer(player: Partial<GameSession_Player>) {
  return {
    id: '',
    name: '(unset)',
    player_picture: 1,
    answers: [],
    score: 0,
    eliminated: false,
    ...player,
  } as GameSession_Player
}
