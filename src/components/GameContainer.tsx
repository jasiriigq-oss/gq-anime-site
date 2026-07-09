'use client'

import { RoundTimer } from './RoundTimer'
import { useContext } from 'react'
import { AnswerOptions } from './AnswerOptions'
import { AddPlayerToSessionForm } from './AddPlayerToSessionForm'
import { GameState, GameStoreContext } from './game-state'
import { RoleView } from './RoleView'
import { AdminGameBar } from './AdminGameBar'
import { PlayerStatusCard } from './PlayerStatusCard'

export interface GameContainerProps extends React.PropsWithChildren {}
export const GameContainer: React.FC<GameContainerProps> = ({}: GameContainerProps) => {
  const ctx = useContext(GameStoreContext)

  const {
    round,
    roundEnded,
    currentQuestion,
    roundStarted,
    gameStarted,
    quiz,
    room,
    mode,
    currentPlayer,
    sessionPlayer,
    session,
    sessionPlayers,
    playersList,
  } = ctx as GameState

  return (
    <div className="min-h-75 bg-black relative pb-5">
      <div className="flex flex-col lg:flex-row">
        <div id="stage" className="flex flex-col justify-center flex-1">
          <div className="text-center text-white font-black text-2xl">{quiz?.name}</div>
          {roundStarted && (
            <div className="text-center text-white font-black text-3xl">
              {currentQuestion?.name}
            </div>
          )}
          {roundStarted && <RoundTimer />}
          {roundStarted && <AnswerOptions question={currentQuestion} />}
          <RoleView forModeRole="admin">
            <AdminGameBar></AdminGameBar>
          </RoleView>
        </div>
        <div id="players" className="p-2">
          {sessionPlayers.map((sp) => {
            return (
              <div key={sp.id}>
                <PlayerStatusCard sessionPlayer={sp}></PlayerStatusCard>
              </div>
            )
          })}
        </div>
      </div>
      <RoleView forModeRole="player">
        <AddPlayerToSessionForm />
      </RoleView>
    </div>
  )
}
