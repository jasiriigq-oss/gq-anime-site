'use client'
import React, { useState, useEffect, useActionState, useRef } from 'react'
import { getSessionAndPlayersAction } from '@/app/game-actions'
export const RealTimeFeedPath = '/play/sse'
import QRCode from 'react-qr-code'
import {
  createPlayerLink,
  DbChange,
  GAME_SESSION_MESSAGE,
  GameServerMessage,
  getPlayerColorFromIndex,
  INFO_MESSAGE,
  PLAYER_SESSION_MESSAGE,
} from '@/app/game-lib'
import { ContentWell } from './ContentWell'
import { AddPlayerToSessionForm } from './AddPlayerToSessionForm'

import { GameSession, GameSessionPlayer } from '@/payload-types'
import { JoinCard } from './JoinCard'
import { useSearchParams } from 'next/navigation'
import { SessionAndPlayersData } from '@/app/game-operations'
export interface RealTimeFeedProps extends React.PropsWithChildren {
  game_server_url: string
  mode: 'admin' | 'player' | 'spectator'
  sessionId: number
}
export const RealTimeFeed: React.FC<RealTimeFeedProps> = ({
  game_server_url,
  mode,
  sessionId,
}: RealTimeFeedProps) => {
  const params = useSearchParams()
  const currentPlayerId = parseInt(params.get('player') || '-1')
  const [gameSessionData, setGameSessionData] = useState<GameSession | null>(null)
  const [playersData, setPlayersData] = useState<Record<number, GameSessionPlayer>>({})

  const paramsObj = {
    mode,
    session: `${sessionId}`,
  } as Record<string, string>

  if (currentPlayerId != -1) {
    paramsObj['player'] = `${currentPlayerId}`
  }
  const searchParams = new URLSearchParams(paramsObj)

  useEffect(() => {
    // 1. Establish connection to your SSE endpoint
    const eventSource = new EventSource(
      game_server_url + RealTimeFeedPath + `?${searchParams.toString()}`,
    )
    eventSource.addEventListener('close', () => {
      console.log('Stream finished. Closing connection safely.')
      eventSource.close()
    })
    // 2. Listen for the default "message" event
    eventSource.onmessage = (event) => {
      const parsed = JSON.parse(event.data) as GameServerMessage<any>

      switch (parsed?.type) {
        case INFO_MESSAGE:
          const info_message = parsed as GameServerMessage<SessionAndPlayersData>
          setGameSessionData(info_message.data.session)
          setPlayersData(
            info_message.data.players.reduce(
              (p, c) => {
                p[c.id] = c
                return p
              },
              {} as Record<number, GameSessionPlayer>,
            ),
          )

          break
        case GAME_SESSION_MESSAGE:
          const session_message = parsed as GameServerMessage<DbChange<GameSession>>
          setGameSessionData(session_message.data.new)
          // These are supabasePayloads
          // with a new, and old
          break
        case PLAYER_SESSION_MESSAGE:
          const player_message = parsed as GameServerMessage<DbChange<GameSessionPlayer>>
          playersData[player_message.data.new.id] = player_message.data.new
          setPlayersData({ ...playersData })
          break
        default:
          break
      }
    }

    // 3. Handle errors and connection drops
    eventSource.onerror = (error) => {
      console.error('SSE Error:', error)
      // The browser automatically tries to reconnect by default
    }

    // 4. Cleanup: Close connection when component unmounts
    return () => {
      eventSource.close()
    }
  }, [])

  const playerSessions = Object.keys(playersData).map((k) => playersData[k as any])
  const currentPlayer = playersData?.[currentPlayerId]

  return (
    <div>
      {/* <h3>Live Updates</h3> */}
      {/* {data.map((item, index) => (
        <p key={index}>{item.text || item}</p>
      ))} */}
      {/* <div>{JSON.stringify(gameSessionData, null, 4)}</div> */}
      {mode == 'admin' && (
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-2xl font-bold">Players</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {playerSessions.map((playerSession) => {
              return (
                <ContentWell key={playerSession.id} className="w-fit place-self-center">
                  <div className="max-w-sm mx-auto">
                    <JoinCard playerSession={playerSession} />
                  </div>
                </ContentWell>
              )
            })}
          </div>
        </div>
      )}

      {mode == 'player' && currentPlayer && !currentPlayer.ready && (
        <div>
          <AddPlayerToSessionForm player={currentPlayer} />
        </div>
      )}
    </div>
  )
}

export default RealTimeFeed
