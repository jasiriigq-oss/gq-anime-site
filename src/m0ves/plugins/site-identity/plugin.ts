import type { Config, GlobalAfterChangeHook, GlobalConfig, Plugin } from 'payload'
import { revalidateTag } from 'next/cache'

export const revalidateSiteIdentity: GlobalAfterChangeHook = async () => {
  revalidateTag('site-identity', 'max')
}

export const SiteIdentityGlobal: GlobalConfig = {
  slug: 'site-identity',
  label: 'Site Identity',
  hooks: {
    afterChange: [revalidateSiteIdentity],
  },
  fields: [
    {
      name: 'site-name',
      type: 'text',
      label: 'Site Name',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      label: 'External Links',
      type: 'tabs',
      tabs: [
        {
          name: 'Social Media Links',

          fields: [
            {
              name: 'facebook',
              type: 'text',
              label: 'Facebook',
            },
            {
              name: 'twitter',
              type: 'text',
              label: 'Twitter',
            },
            {
              name: 'instagram',
              type: 'text',
              label: 'Instagram',
            },
            {
              name: 'youtube',
              type: 'text',
              label: 'Youtube',
            },
            {
              name: 'linkedin',
              type: 'text',
              label: 'Linkedin',
            },
            {
              name: 'github',
              type: 'text',
              label: 'Github',
            },
            {
              name: 'pinterest',
              type: 'text',
              label: 'Pinterest',
            },
            {
              name: 'reddit',
              type: 'text',
              label: 'Reddit',
            },
            {
              name: 'twitch',
              type: 'text',
              label: 'Twitch',
            },
            {
              name: 'discord',
              type: 'text',
              label: 'Discord',
            },
            {
              name: 'snapchat',
              type: 'text',
              label: 'Snapchat',
            },
            {
              name: 'tiktok',
              type: 'text',
              label: 'TikTok',
            },
            {
              name: 'vimeo',
              type: 'text',
              label: 'Vimeo',
            },
          ],
        },
      ],
    },
  ],
}

export const SiteIdentityPlugin: Plugin = (inConfig: Config): Config => {
  const outConfig: Config = {
    ...inConfig,
    globals: [...(inConfig.globals ?? []), SiteIdentityGlobal],
  }
  return outConfig
}
