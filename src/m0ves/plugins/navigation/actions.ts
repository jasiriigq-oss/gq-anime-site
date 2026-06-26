'use server'

import { StandardSiteResponse } from '@/m0ves/lib/StandardSiteResponse'
import { Navigation } from '@/payload-types'
import { getNavigationData } from './operations'
import { Nullable } from '@/m0ves/lib/Nullable'

export async function getNavigationAction(): Promise<StandardSiteResponse<Nullable<Navigation>>> {
  const navigation = await getNavigationData()
  const messages: string[] = []
  const success = navigation != null && navigation != undefined
  let hint_http = success ? 200 : 500
  return {
    data: navigation,
    domain: 'Navigation',
    success,
    error: !success,
    messages,
    hint_http,
  }
}
