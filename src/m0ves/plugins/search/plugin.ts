import { searchPlugin } from '@payloadcms/plugin-search'

import { buildConfig, CollectionSlug } from 'payload'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { CollectionConfig, Config, Plugin } from 'payload'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'

import { importExportPlugin } from '@payloadcms/plugin-import-export'
export const INCLUDE_SEARCH_NAME = 'include-in-search'
export const EXCERPT_FIELD_SEARCH_NAME = 'search-excerpt'

/**
 * Plugin that adds
 * @param inConfig
 * @returns
 */
export const SearchPlugin: Plugin = async (inConfig: Config): Promise<Config> => {
  const collections = (inConfig.collections as CollectionConfig[])
    .filter((c) => {
      return c.fields.some((f) => (f as any)?.name === INCLUDE_SEARCH_NAME)
    })
    .map((c) => c.slug as CollectionSlug)

  return searchPlugin({
    collections,
    beforeSync: ({ originalDoc, searchDoc }) => ({
      ...searchDoc,
      // - Modify your docs in any way here, this can be async
      // - You also need to add the `excerpt` field in the `searchOverrides` config
      excerpt: originalDoc?.[EXCERPT_FIELD_SEARCH_NAME] || 'This is a fallback excerpt',
    }),
    searchOverrides: {
      fields: ({ defaultFields }) => [
        ...defaultFields,
        {
          name: EXCERPT_FIELD_SEARCH_NAME,
          type: 'textarea',
          admin: {
            position: 'sidebar',
          },
        },
      ],
    },
  })(inConfig)
}
