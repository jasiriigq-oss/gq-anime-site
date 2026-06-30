import { buildConfig, CollectionSlug } from 'payload'
import { seoPlugin } from '@payloadcms/plugin-seo'
import {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  Config,
  Plugin,
} from 'payload'

import { importExportPlugin } from '@payloadcms/plugin-import-export'
export const INCLUDE_IMPORT_EXPORT_NAME = 'include-import-export'

/**
 * Plugin that adds
 * @param inConfig
 * @returns
 */
export const ImportExportPlugin: Plugin = async (inConfig: Config): Promise<Config> => {
  const collections = (inConfig.collections as CollectionConfig[])
    .filter((c) => {
      return c.fields.some((f) => (f as any)?.name === INCLUDE_IMPORT_EXPORT_NAME)
    })
    .map((c) => ({ slug: c.slug as CollectionSlug }))

  //console.log('Import Export Collections', collections, inConfig.collections)
  return importExportPlugin({
    collections,
  })(inConfig)
}
