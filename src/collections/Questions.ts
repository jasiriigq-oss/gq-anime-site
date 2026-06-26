import type { CollectionConfig } from 'payload'

export const Questions: CollectionConfig = {
  slug: 'questions',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'questionType',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Image',
          value: 'image',
        },
        {
          label: 'Video',
          value: 'video',
        },
        {
          label: 'Audio',
          value: 'audio',
        },
      ],
    },
    {
      name: 'questionText', // in ms
      type: 'text',
      required: true,
    },
    {
      name: 'timeLimit', // use 0 for no time limit
      type: 'number',
      required: true,
    },
    {
      name: 'hintText',
      type: 'text',
    },
    {
      name: 'hintImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'hintVideo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'hintSound',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'answer',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'text',
          label: 'Question Text',
          type: 'text',
          required: true,
        },
        {
          name: 'image',
          label: 'Image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'video',
          label: 'Video',
          type: 'upload',
          relationTo: 'media',
          required: false,
        },
        {
          name: 'audio',
          label: 'Audio',
          type: 'upload',
          relationTo: 'media',
          required: false,
        },
        {
          name: 'isCorrect',
          label: 'Is Correct',
          type: 'checkbox',
          required: true,
        },
      ],
    },
  ],
}
