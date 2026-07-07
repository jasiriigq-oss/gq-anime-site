'use server'
import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'
import config from '@/payload.config'
import { RouteProps } from '@/m0ves/lib/RouteProps'
import RealTimeFeed from '@/components/RealTimeFeed'
import { getSessionAndPlayers, getSessionById, getSessionPlayerById } from '@/app/game-operations'
import { Quiz, Media, GameSession } from '@/payload-types'
import { GameRoomComponent } from '@/components/GameRoomComponent'

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
  const players = sessionAndPlayers.data?.players

  const quiz = session?.quiz as Quiz

  const cover = quiz?.cover as Media | undefined

  const player = players?.find((p) => p.id == parseInt((playerId as string | null) ?? '-1'))

  return (
    <>
      {session && (
        <GameRoomComponent
          session={session}
          player={player}
          players={players ?? []}
          serverAddress={process.env.GAME_SERVER_URL ?? ''}
          mode={mode as any}
        />
      )}
    </>
  )
}
