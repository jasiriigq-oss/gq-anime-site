import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'
import config from '@/payload.config'
import { RouteProps } from '@/m0ves/lib/RouteProps'
import RealTimeFeed from '@/components/RealTimeFeed'
import { getSessionById } from '@/app/game-operations'
import { Quiz, Media, GameSession } from '@/payload-types'

export default async function PlaySessionPage(
  props: RouteProps<{ session: string; player?: string }>,
) {
  const headers = await getHeaders()
  // const payloadConfig = await config
  // const payload = await getPayload({ config: payloadConfig })
  // const { user } = await payload.auth({ headers })
  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`
  const { mode, player } = await props.searchParams
  const sessionId = parseInt(await (await props.params).session)

  const sessionResponse = await getSessionById(sessionId)
  // console.log({ session, mode })
  const session = sessionResponse?.data as GameSession
  const quiz = session?.quiz as Quiz

  const cover = quiz?.cover as Media | undefined

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="hero bg-base-200 min-h-screen">
          <div className="hero-content flex-col lg:flex-row">
            <img
              title="active quiz"
              src={cover?.url ?? ''}
              className="max-w-sm rounded-lg shadow-2xl"
            />
            <div>
              <h1 className="text-5xl font-bold">Quiz: {quiz.name}</h1>
              <p className="py-6">{quiz.description}</p>
              {session.state == 'setup' && <button className="btn btn-primary">Start</button>}
            </div>
          </div>
        </div>
      </div>
      <RealTimeFeed
        game_server_url={process.env.SERVER_URL ?? ''}
        sessionId={sessionId}
        mode={(mode as 'admin' | 'player' | 'spectator' | null) ?? 'spectator'}
      />
    </>
  )
}
