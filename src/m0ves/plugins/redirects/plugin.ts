import { buildConfig, CollectionSlug } from 'payload'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { CollectionConfig, Config, Plugin } from 'payload'

export const INCLUDE_REDIRECTS_NAME = 'include-redirects-doc'

import { redirectsPlugin } from '@payloadcms/plugin-redirects'

/**
 * Plugin that adds
 * @param inConfig
 * @returns
 */
export const RedirectsPlugin: Plugin = async (inConfig: Config): Promise<Config> => {
  const collections = (inConfig.collections as CollectionConfig[])
    .filter((c) => {
      return c.fields.some((f) => (f as any)?.name === INCLUDE_REDIRECTS_NAME)
    })
    .map((c) => c.slug as CollectionSlug)

  return redirectsPlugin({
    collections,
  })(inConfig)
}
