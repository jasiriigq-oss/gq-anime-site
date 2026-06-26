import { revalidateTag } from 'next/cache'
import {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  Config,
  Plugin,
} from 'payload'
import { defaultBreakPoints } from '../common/fields/PreviewBreakPoints'
import { getCommonPageFields } from '../common/fields/PageFields'
import { Page } from '@/payload-types'

export const revalidatePageCache: CollectionAfterChangeHook<Page> = async ({
  doc,
  previousDoc,
  operation,
}) => {
  try {
    // Always revalidate the general pages tag
    revalidateTag(PagesCollection.slug, 'max')

    // Revalidate specific page cache if it has a slug
    if (doc.slug) {
      const slugArray = doc.slug === 'home' ? [] : [doc.slug]
      const pageTag = getPageCacheKeyBySlug(slugArray)
      revalidateTag(pageTag, 'max')
    }

    // If slug changed, also revalidate the old slug
    if (operation === 'update' && previousDoc?.slug && previousDoc.slug !== doc.slug) {
      const oldSlugArray = previousDoc.slug === '' ? [] : [previousDoc.slug]
      const oldPageTag = getPageCacheKeyBySlug(oldSlugArray)
      revalidateTag(oldPageTag, 'max')
    }

    console.log(`✅ Revalidated page cache for: ${doc.slug}`)
  } catch (error) {
    console.error('❌ Error revalidating page cache:', error)
  }
}

export const revalidatePageCacheDelete: CollectionAfterDeleteHook<Page> = async ({ doc }) => {
  const slug = doc.slug
  if (slug) {
    revalidateTag(getPageCacheKeyBySlug([slug]), 'max')
  }
}

export const PagesCollection: CollectionConfig = {
  slug: 'page',
  versions: true,
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  access: {
    read: () => true,
  },
  fields: [
    ...getCommonPageFields({
      include_seo: true,
      include_nested_doc: true,
      include_search: true,
      include_redirects: true,
    }),
  ],
  hooks: {
    afterChange: [revalidatePageCache],
    afterDelete: [revalidatePageCacheDelete],
  },
  admin: {
    useAsTitle: 'title',
    livePreview: {
      url: ({ data, req }) => {
        const protocol = req.host.indexOf('localhost') !== -1 ? 'http' : 'https'
        const slug = data.slug == '/' ? '' : data.slug
        const path = `${protocol}://${req.host}/${slug}`
        return path
      },

      breakpoints: defaultBreakPoints,
    },
  },
}

const getPageCacheKeyBySlug = (slug?: string[]) => {
  const slugStr = slug && slug.length > 0 ? slug.join('-') : 'home'
  return `page-${slugStr}`
}

export const PagesPlugin: Plugin = (inConfig: Config): Config => {
  const outConfig: Config = {
    ...inConfig,
    collections: [...(inConfig.collections ?? []), PagesCollection],
  }
  return outConfig
}
