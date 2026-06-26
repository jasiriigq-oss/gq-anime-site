import { buildConfig, CollectionSlug } from 'payload'
import { seoPlugin } from '@payloadcms/plugin-seo'
import {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  Config,
  Plugin,
} from 'payload'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'

import { importExportPlugin } from '@payloadcms/plugin-import-export'
export const INCLUDE_NESTED_DOC_NAME = 'include-nested-doc'

/**
 * Plugin that adds
 * @param inConfig
 * @returns
 */
export const NestedDOCPlugin: Plugin = async (inConfig: Config): Promise<Config> => {
  const collections = (inConfig.collections as CollectionConfig[])
    .filter((c) => {
      return c.fields.some((f) => (f as any)?.name === INCLUDE_NESTED_DOC_NAME)
    })
    .map((c) => c.slug as CollectionSlug)
  console.log('Nested DOC Collections', collections)

  return nestedDocsPlugin({
    collections,
    generateLabel: (_, doc) => String(doc.title),
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${String(doc.slug)}`, ''),
  })(inConfig)
}
