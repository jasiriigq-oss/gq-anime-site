import 'server-only'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import config from '@/payload.config'
import type { User } from '@/payload-types'

let payloadPromise: ReturnType<typeof getPayload> | null = null

export async function getPayloadLocal() {
  if (!payloadPromise) {
    payloadPromise = getPayload({ config: await config })
  }
  return payloadPromise
}

export async function getCurrentUser(): Promise<User | null> {
  const payload = await getPayloadLocal()
  const { user } = await payload.auth({ headers: await headers() })
  return (user as User | null) ?? null
}
