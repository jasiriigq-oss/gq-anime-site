import type { GlobalConfig } from 'payload'

// Feedback sounds for answering questions. Upload audio files here and the game
// plays them on reveal — correct / incorrect / timeout.
export const GameSounds: GlobalConfig = {
  slug: 'game-sounds',
  admin: {
    group: 'Game',
    description: 'Sounds and feedback played during a game. Upload .mp3/.wav/.ogg files.',
  },
  fields: [
    {
      name: 'enabled',
      label: 'Enable feedback sounds',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'volume',
      label: 'Volume (0–1)',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: 0.7,
      admin: {
        step: 0.05,
      },
    },
    {
      name: 'correctSound',
      label: 'Correct answer sound',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'incorrectSound',
      label: 'Incorrect answer sound',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'timeoutSound',
      label: 'Time-out sound',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
