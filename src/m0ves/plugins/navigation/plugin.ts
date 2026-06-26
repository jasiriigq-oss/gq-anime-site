import { revalidateTag } from 'next/cache'
import type { CollectionConfig, Config, GlobalAfterChangeHook, Plugin } from 'payload'
import type { GlobalConfig } from 'payload'

export const revalidateNavigation: GlobalAfterChangeHook = async () => {
  revalidateTag('site-navigation', 'max')
}

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  admin: {},
  hooks: {
    afterChange: [revalidateNavigation],
  },
  fields: [
    {
      name: 'links',
      label: 'Links',
      type: 'array',
      fields: [
        {
          name: 'link',
          type: 'relationship',
          relationTo: 'navigation-link',
        },
      ],
    },
  ],
}

export const NavigationLinks: CollectionConfig = {
  slug: 'navigation-link',
  labels: {
    singular: 'Navigation Link',
    plural: 'Navigation Links',
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
    },
    {
      name: 'url',
      label: 'Url',
      type: 'text',
    },
    {
      name: 'new-tab',
      label: 'Open in new Tab',
      type: 'checkbox',
    },
    {
      name: 'children',
      label: 'Children',
      type: 'array',
      fields: [
        {
          name: 'Child Link',
          type: 'relationship',
          relationTo: 'navigation-link',
        },
      ],
    },
  ],
}

export const NavigationPlugin: Plugin = (inConfig: Config): Config => {
  const outConfig: Config = {
    ...inConfig,
    collections: [...(inConfig.collections ?? []), NavigationLinks],
    globals: [...(inConfig.globals ?? []), Navigation],
  }
  return outConfig
}
