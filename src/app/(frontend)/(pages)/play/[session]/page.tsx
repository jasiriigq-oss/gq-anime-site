'use server'
import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'
import config from '@/payload.config'
import { RouteProps } from '@/m0ves/lib/RouteProps'
import { getSessionAndPlayers, getSessionById, getSessionPlayerById } from '@/app/game-operations'
import { Quiz, Media, GameSession } from '@/payload-types'
import { GameRoomComponent } from '@/components/GameRoomComponent'
import { GameStoreProvider } from '@/components/game-state'

export default async function PlaySessionPage(
  props: RouteProps<{ session: string; player?: string }>,
) {
  const headers = await getHeaders()
  // const payloadConfig = await config
  // const payload = await getPayload({ config: payloadConfig })
  // const { user } = await payload.auth({ headers })
  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`
  const { mode, playerId } = await props.searchParams
  const sessionId = parseInt(await (await props.params).session)

  const sessionAndPlayers = await getSessionAndPlayers(sessionId)

  const session = sessionAndPlayers.data?.session
  const sessionPlayers = sessionAndPlayers.data?.players

  const quiz = session?.quiz as Quiz

  const cover = quiz?.cover as Media | undefined

  const sessionPlayer = sessionPlayers?.find(
    (p) => p.id == parseInt((playerId as string | null) ?? '-1'),
  )

  return (
    <GameStoreProvider
      session={session}
      sessionPlayer={sessionPlayer}
      mode={mode as any}
      serverAddress={process.env.GAME_SERVER_URL ?? ''}
      sessionPlayers={sessionPlayers ?? []}
    >
      {session && <GameRoomComponent />}
    </GameStoreProvider>
  )
}
