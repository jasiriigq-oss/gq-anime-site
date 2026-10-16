import 'server-only'
import { getPayloadLocal } from '@/lib/payload'
import type { Media } from '@/payload-types'
import type { GameSounds } from '@/lib/game/types'

function urlOf(m: unknown): string | null {
  if (!m) return null
  if (typeof m === 'string') return m
  if (typeof m === 'object' && 'url' in m) return ((m as Media).url as string) ?? null
  return null
}

/** Reads the admin-managed feedback sounds (game-sounds global). */
export async function getGameSounds(): Promise<GameSounds> {
  try {
    const payload = await getPayloadLocal()
    const s = await payload.findGlobal({ slug: 'game-sounds' })
    return {
      enabled: s?.enabled ?? true,
      volume: typeof s?.volume === 'number' ? s.volume : 0.7,
      correct: urlOf(s?.correctSound),
      incorrect: urlOf(s?.incorrectSound),
      timeout: urlOf(s?.timeoutSound),
    }
  } catch {
    return { enabled: false, volume: 0.7, correct: null, incorrect: null, timeout: null }
  }
}
