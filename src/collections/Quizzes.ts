import type { CollectionConfig, Field } from 'payload'

const AnswerFields: Field[] = [
  {
    name: 'text',
    label: 'Answer Text',
    type: 'text',
    required: true,
  },
  {
    name: 'isCorrect',
    label: 'Correct',
    type: 'checkbox',
    defaultValue: false,
  },
  {
    name: 'image',
    label: 'Answer Image (optional)',
    type: 'upload',
    relationTo: 'media',
  },
]

const QuestionFields: Field[] = [
  {
    name: 'questionText',
    label: 'Question Text',
    type: 'textarea',
    required: true,
  },
  {
    name: 'questionType',
    label: 'Question Type',
    type: 'select',
    defaultValue: 'text',
    options: [
      { label: 'Text', value: 'text' },
      { label: 'Image', value: 'image' },
      { label: 'Video', value: 'video' },
      { label: 'Audio', value: 'audio' },
    ],
  },
  {
    name: 'image',
    label: 'Question Image',
    type: 'upload',
    relationTo: 'media',
  },
  {
    name: 'video',
    label: 'Question Video',
    type: 'upload',
    relationTo: 'media',
  },
  {
    name: 'audio',
    label: 'Question Audio / Sound',
    type: 'upload',
    relationTo: 'media',
  },
  {
    name: 'timeLimitSeconds',
    label: 'Time Limit (seconds, 0 = none)',
    type: 'number',
    min: 0,
    max: 300,
    defaultValue: 15,
  },
  {
    name: 'points',
    label: 'Potential Points',
    type: 'number',
    min: 0,
    defaultValue: 10,
  },
  {
    name: 'hintText',
    label: 'Hint Text (optional)',
    type: 'text',
  },
  {
    name: 'answers',
    label: 'Answers',
    type: 'array',
    minRows: 2,
    maxRows: 6,
    required: true,
    fields: AnswerFields,
  },
]

export const Quizzes: CollectionConfig = {
  slug: 'quizzes',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'series', 'difficulty', 'published', 'author'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'URL-friendly id, e.g. `jujutsu-kaisen-cursed-energy-test`.',
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Description (markdown)',
    },
    {
      name: 'series',
      label: 'Anime Series',
      type: 'text',
      admin: {
        description: 'e.g. "Jujutsu Kaisen", "One Piece", "Naruto".',
      },
    },
    {
      name: 'category',
      label: 'Quiz Type',
      type: 'select',
      defaultValue: 'trivia',
      options: [
        { label: 'Lore', value: 'lore' },
        { label: 'Personality', value: 'personality' },
        { label: 'Trivia', value: 'trivia' },
        { label: 'Quick Challenge', value: 'quick-challenge' },
      ],
    },
    {
      name: 'difficulty',
      label: 'Difficulty (1–5)',
      type: 'number',
      min: 1,
      max: 5,
      defaultValue: 3,
    },
    {
      name: 'expectedTimeMinutes',
      label: 'Estimated Time (minutes)',
      type: 'number',
      min: 1,
      defaultValue: 10,
    },
    {
      name: 'settings',
      label: 'Settings',
      type: 'group',
      fields: [
        {
          name: 'multiplayerEnabled',
          label: 'Multi-Player Enabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'soloPlayEnabled',
          label: 'Solo-Play Enabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'challengeMode',
          label: 'Challenge Mode',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'questions',
      label: 'Questions',
      type: 'array',
      minRows: 1,
      required: true,
      fields: QuestionFields,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Only published quizzes appear in public search.',
      },
    },
    {
      name: 'likes',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'playCount',
      label: 'Play Count',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
