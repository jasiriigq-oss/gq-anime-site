import { buildConfig } from 'payload'
import { seoPlugin } from '@payloadcms/plugin-seo'
import {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  Config,
  Plugin,
} from 'payload'

export const INCLUDE_SEO_FIELD_NAME = 'include-seo'

/**
 * Plugin that adds
 * @param inConfig
 * @returns
 */
export const SeoPlugin: Plugin = (inConfig: Config): Config => {
  const collections = (inConfig.collections as CollectionConfig[])
    .filter((c) => {
      return c.fields.some((f) => (f as any)?.name === INCLUDE_SEO_FIELD_NAME)
    })
    .map((c) => c.slug)

  return seoPlugin({
    collections,
    uploadsCollection: 'media',
    generateTitle: ({ doc }) => `Website.com — ${doc.title}`,
    generateDescription: ({ doc }) => doc.excerpt,
  })(inConfig)
}
