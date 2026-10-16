import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-server'
import { GameClient } from '@/components/game/GameClient'
import { getGameSounds } from '@/lib/game/sounds'
import type { GameRole } from '@/lib/game/types'

export const dynamic = 'force-dynamic'

export default async function PlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { code } = await params
  const sp = await searchParams
  const mode = (sp.mode === 'admin' || sp.mode === 'spectator' ? sp.mode : 'player') as GameRole
  const playerId = (sp.player as string) ?? null
  const cleanCode = String(code).trim().toUpperCase()

  let roomId: string | null = null
  let error: string | null = null
  try {
    const { data } = await supabaseAdmin()
      .from('game_room')
      .select('id, code')
      .eq('code', cleanCode)
      .maybeSingle()
    roomId = data?.id ?? null
    if (!roomId) error = 'Game not found.'
  } catch {
    error =
      'The game backend (Supabase) is not configured. Apply supabase/schema.sql and set SUPABASE_URL / SUPABASE_SECRET_KEY in .env.'
  }

  if (error || !roomId) {
    return (
      <div className="p-16 text-center">
        <p className="text-lg text-white/70">{error}</p>
        <Link href="/join" className="btn-brand mt-6">
          Join a Game
        </Link>
      </div>
    )
  }

  const sounds = await getGameSounds()
  return (
    <GameClient
      code={cleanCode}
      roomId={roomId}
      mode={mode}
      playerId={playerId}
      sounds={sounds}
    />
  )
}
