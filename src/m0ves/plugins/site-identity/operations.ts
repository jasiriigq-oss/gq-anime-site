import { unstable_cache } from 'next/cache'

import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import config from '@/payload.config'

const CACHE_VALIDATION_TIMEOUT = process.env.NODE_ENV === 'production' ? 1 : false

export const getSiteIdentityData = async () => {
  const cache = await unstable_cache(
    async () => {
      const payloadConfig = await config
      const payload = await getPayload({ config: payloadConfig })
      const result = await payload.findGlobal({
        slug: 'site-identity',
        depth: 10,
      })
      return result
    },
    ['site-identity'],
    {
      tags: ['site-identity'],
      revalidate: CACHE_VALIDATION_TIMEOUT,
    },
  )
  const siteIdentity = await cache()
  return siteIdentity
}
