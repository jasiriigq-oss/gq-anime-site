'use client'

import { Client, Callbacks } from '@colyseus/sdk'
import { useRoom, useRoomState } from '@colyseus/react'
import { useEffect, useMemo, useState } from 'react'
import { type GameRoom } from 'game-server/src/rooms/GameRoom'
import { AddPlayerToSessionForm } from './AddPlayerToSessionForm'
import { type Player } from 'game-server/src/rooms/schema/GameRoomState'
import { GameSession, GameSessionPlayer } from '@/payload-types'
import { Nullable } from '@/m0ves/lib/Nullable'
import { ContentWell } from './ContentWell'
import { JoinCard } from './JoinCard'
import { RoundTimer } from './RoundTimer'
import { GameContainer } from './GameContainer'

export interface GameRoomComponentProps extends React.PropsWithChildren {
  serverAddress: string
  player: Nullable<GameSessionPlayer>
  players: GameSessionPlayer[]
  session: GameSession
  mode: 'admin' | 'player' | 'spectator'
}
export const GameRoomComponent: React.FC<GameRoomComponentProps> = ({
  serverAddress,
  session,
  mode,
  player,
  players,
}: GameRoomComponentProps) => {
  'use client'
  const client = useMemo(() => new Client(serverAddress), [serverAddress])
  const [currentPlayer, setCurrentPlayer] = useState<Nullable<Player>>(null)
  const [otherPlayers, setOtherPlayers] = useState<Record<number, Player>>({})
  const [round, setRound] = useState<number>(session.round ?? 0)
  const { room, error, isConnecting } = useRoom(() => {
    const state = client.joinOrCreate<GameRoom>(`game_room`, {
      session,
      player,
      mode,
    })
    return state
  })
  const allPlayers = useRoomState(room, (s) => {
    'use client'
    return s.players
  })?.toJSON as Record<string, Player> | undefined

  room?.onMessage('round-start', (message) => {})
  room?.onMessage('round-end', (message) => {})

  useEffect(() => {
    const callbacks = room ? Callbacks.get(room) : null
    callbacks?.onAdd('players', (sp, sessionId) => {
      if (sp.sessionId == player?.id) {
        setCurrentPlayer(sp)
        callbacks?.onChange(sp, () => {
          console.log('current player updated', { sp })
          setCurrentPlayer(sp)
        })
      } else {
        otherPlayers[sp.sessionId] = sp
        setOtherPlayers(otherPlayers)
      }
    })
    callbacks?.onRemove('players', (player, sessionId) => {
      if (player.sessionId === currentPlayer?.sessionId) {
        setCurrentPlayer(null)
      }
      try {
        const newOtherPlayers = { ...otherPlayers }
        delete newOtherPlayers[player.sessionId]
        setOtherPlayers(newOtherPlayers)
      } catch (e) {}
    })
    const roundListener = callbacks?.listen('round', (c, p) => {
      setRound(c)
    })
    return () => {
      roundListener?.call(null)
    }
  }, [room, currentPlayer?.name, Object.keys(allPlayers ?? {}).length])

  return (
    <div className="border border-primary">
      {isConnecting && <div className="text-center">Connecting</div>}
      {error && <div className="text-center">{error.message}</div>}
      {mode == 'admin' && (
        <>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center text-2xl font-bold">Players</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {players.map((playerSession) => {
                return (
                  <ContentWell key={playerSession.id} className="w-fit place-self-center">
                    <div className="max-w-sm mx-auto">
                      <JoinCard
                        player={otherPlayers?.[playerSession.id]}
                        playerSession={playerSession}
                      />
                    </div>
                  </ContentWell>
                )
              })}
            </div>
          </div>
        </>
      )}
      {mode == 'spectator' && <></>}

      <GameContainer
        room={room}
        session={session}
        mode={mode}
        sessionPlayer={player}
        currentPlayer={currentPlayer}
        allPlayers={allPlayers}
      ></GameContainer>
    </div>
  )
}
