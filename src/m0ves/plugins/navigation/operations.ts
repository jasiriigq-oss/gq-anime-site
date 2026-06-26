import { unstable_cache, refresh } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { headers as getHeaders } from 'next/headers.js'

const NAV_CACHE_KEY = 'navigation'
const NAV_CACHE_TAG = 'navigation'
const NAVIGATION_CACHE_TIMEOUT = process.env.MODE === 'production' ? 1000 : false

export const getNavigationData = async () => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const cache = await unstable_cache(
    async () => {
      const result = await payload.findGlobal({
        slug: 'navigation',
        depth: 10,
      })
      return result
    },
    [NAV_CACHE_KEY],
    {
      tags: [NAV_CACHE_TAG],
      revalidate: NAVIGATION_CACHE_TIMEOUT,
    },
  )
  const navigation = await cache()
  return navigation
}
