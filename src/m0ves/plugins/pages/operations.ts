import { Page } from '@/payload-types'

import { headers as getHeaders } from 'next/headers.js'
import { getPayload, PaginatedDocs } from 'payload'
import config from '@/payload.config'
import { PagesCollection } from './plugin'

export async function getPageBySlug(slug: string) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  return (await payload.find({
    collection: PagesCollection.slug as any,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        {
          published: {
            equals: true,
          },
        },
      ],
    },
  })) as PaginatedDocs<Page>
}

export async function getSubPages(slug: string) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  return await payload.find({
    collection: PagesCollection.slug as any,
    where: {
      and: [
        // Contains
        {
          slug: {
            contains: slug,
          },
        },
        // not the same page
        {
          slug: {
            not_equals: slug,
          },
        },
        // Or the home page
        {
          slug: {
            not_equals: '/',
          },
        },
      ],
    },
  })
}
