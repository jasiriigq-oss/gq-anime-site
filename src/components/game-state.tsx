'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Callbacks, Client, type Room } from '@colyseus/sdk'
import { Nullable } from '@/m0ves/lib/Nullable'
import { GameSessionPlayer, GameSession, Quiz, Question } from '@/payload-types'
import { useRoom, useRoomState } from '@colyseus/react'
import { GameRoomState, Player } from 'game-server/src/rooms/schema/GameRoomState'
import { GameRoom } from 'game-server/src/rooms/GameRoom'

export interface GameState {
  serverAddress: string
  sessionPlayer: Nullable<GameSessionPlayer>
  sessionPlayers: GameSessionPlayer[]
  session?: GameSession
  mode: 'admin' | 'player' | 'spectator'
  currentPlayer?: Player
  allPlayers?: Record<string, Player>
  playersList?: Player[]
  round?: number
  room?: Room<GameRoom, GameRoomState>
  roundStarted?: boolean
  roundEnded?: boolean
  roundSecondsLeft?: number
  roomError?: Error
  isConnecting?: boolean
  client?: Client
  quiz?: Quiz
  questions?: Question[]
  currentQuestion?: Question
  gameStarted?: boolean
  tick?: number
  questionsLeft?: number
}
export const createGameStore = (props: GameState) => {
  return props
}

export const GameStoreContext = createContext<GameState | undefined>(undefined)

const GameStoreProvider = ({
  children,
  serverAddress,
  session,
  mode,
  sessionPlayer,
  sessionPlayers,
}: { children: React.ReactNode } & GameState) => {
  'use client'
  const client = useMemo(() => new Client(serverAddress), [serverAddress])
  const [allPlayers, setAllPlayers] = useState<Record<number, Player>>({})
  const { room, error, isConnecting } = useRoom(() => {
    const state = client.joinOrCreate<GameRoom>(`game_room`, {
      session,
      player: sessionPlayer,
      mode,
    })
    return state
  })
  const round = useRoomState(room, (r) => r.round)
  const roundStarted = useRoomState(room, (r) => r.roundStarted)
  const roundEnded = useRoomState(room, (r) => r.roundEnded)
  const roundSecondsLeft = useRoomState(room, (r) => r.roundSecondsLeft)
  const gameStarted = useRoomState(room, (r) => r.started)
  const tick = useRoomState(room, (r) => r.tick)
  const quiz = session?.quiz as Quiz
  const questions = quiz.questions?.map((q) => q.question as Question)
  const questionsLeft = (questions?.length ?? 0) - (round ?? 0) - 1
  const currentQuestion = questions?.[round ?? 0] as Question

  room?.onMessage('round-start', (message) => {})
  room?.onMessage('round-end', (message) => {})

  const currentPlayer = allPlayers[sessionPlayer?.id ?? -100]

  const playersList = Object.values(allPlayers)

  useEffect(() => {
    const callbacks = room ? Callbacks.get(room) : null
    callbacks?.onAdd('players', (sp, sessionId) => {
      allPlayers[sp.sessionId] = sp
      setAllPlayers(allPlayers)
      // Listen for changes on nested properties
      callbacks.listen(sp, 'ready', (ready, prevReady) => {
        allPlayers[sp.sessionId] = sp
        console.log({ sp }, 'is ready')
        setAllPlayers(allPlayers)
      })
      callbacks.listen(sp, 'eliminated', (eliminated, prevEliminated) => {
        console.log({ sp }, 'Eliminated:', eliminated)
      })
      callbacks.listen(sp, 'name', (name, prevName) => {})
      callbacks.listen(sp, 'picture', (picture, prevPicture) => {})
    })
    callbacks?.onRemove('players', (player, sessionId) => {
      try {
        delete allPlayers[player.sessionId]
        setAllPlayers(allPlayers)
      } catch (e) {}
    })

    return () => {}
  }, [room, round, roundStarted, roundEnded, currentPlayer, allPlayers])

  const store = createGameStore({
    mode,
    sessionPlayer,
    sessionPlayers,
    serverAddress,
    session,
    round,
    roundSecondsLeft,
    roundStarted,
    roundEnded,
    room,
    currentPlayer,
    isConnecting,
    roomError: error,
    client,
    quiz,
    questions,
    currentQuestion,
    gameStarted,
    allPlayers,
    playersList,
    tick,
    questionsLeft,
  })
  return <GameStoreContext.Provider value={store}>{children}</GameStoreContext.Provider>
}

export default GameStoreProvider
