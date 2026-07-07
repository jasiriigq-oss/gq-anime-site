'use client'

import { Callbacks, type Room } from '@colyseus/sdk'
import { type GameRoom } from 'game-server/src/rooms/GameRoom'
import { Player, type GameRoomState } from 'game-server/src/rooms/schema/GameRoomState'
import { RoundTimer } from './RoundTimer'
import { GameSession, GameSessionPlayer, Question, Quiz } from '@/payload-types'
import { useState } from 'react'
import { useRoomState } from '@colyseus/react'
import { AnswerOptions } from './AnswerOptions'
import { AddPlayerToSessionForm } from './AddPlayerToSessionForm'
import { Nullable } from '@/m0ves/lib/Nullable'

export interface GameContainerProps extends React.PropsWithChildren {
  room?: Room<GameRoom, GameRoomState>
  session: GameSession
  mode: 'admin' | 'spectator' | 'player'
  currentPlayer: Nullable<Player>
  sessionPlayer: Nullable<GameSessionPlayer>
  allPlayers: Nullable<Record<string, Player>>
}
export const GameContainer: React.FC<GameContainerProps> = ({
  room,
  children,
  session,
  mode,
  currentPlayer,
  allPlayers,
  sessionPlayer,
}: GameContainerProps) => {
  const quiz = session.quiz as Quiz
  const questions = quiz.questions?.map((q) => q.question)
  const gameStarted = useRoomState(room, (r) => r.started)
  const roundStarted = useRoomState(room, (r) => r.roundStarted)

  const round = useRoomState(room, (r) => r.round) ?? 0
  const currentQuestion = questions?.[round ?? 0] as Question

  function _startGameHandle() {
    room?.send('startGame')
  }

  function _startRoundHandle() {
    room?.send('startRound')
  }

  return (
    <div className="w-screen h-screen bg-black relative p-4">
      <div>
        <div className="text-center text-white font-black text-2xl">{quiz.name}</div>
        {roundStarted && (
          <div className="text-center text-white font-black text-3xl">{currentQuestion.name}</div>
        )}
        {mode == 'admin' && !gameStarted && (
          <div className="flex justify-center my-2">
            <button
              title="Start Game"
              onClick={(e) => _startGameHandle()}
              type="button"
              className="btn btn-active"
            >
              Start Game
            </button>
          </div>
        )}
        {mode == 'admin' && gameStarted && !roundStarted && (
          <div className="flex justify-center my-2">
            <button
              title="Start Game"
              onClick={(e) => _startRoundHandle()}
              type="button"
              className="btn btn-active"
            >
              Start Round {round + 1}
            </button>
          </div>
        )}

        {roundStarted && <RoundTimer room={room} />}
        {roundStarted && <AnswerOptions room={room} question={currentQuestion} />}
      </div>

      {mode == 'player' &&
        currentPlayer &&
        !currentPlayer.ready &&
        currentPlayer &&
        sessionPlayer && (
          <AddPlayerToSessionForm room={room} player={sessionPlayer} sessionId={session.id} />
        )}
    </div>
  )
}
