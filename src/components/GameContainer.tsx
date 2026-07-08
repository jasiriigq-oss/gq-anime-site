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
    <div className="w-screen h-screen bg-black relative p-4">
      <div>
        <div id="stage">
          <div className="text-center text-white font-black text-2xl">{quiz?.name}</div>
          {roundStarted && (
            <div className="text-center text-white font-black text-3xl">
              {currentQuestion?.name}
            </div>
          )}
        </div>
        <div id="players">
          {sessionPlayers.map((sp) => {
            return (
              <div key={sp.id}>
                <PlayerStatusCard sessionPlayer={sp}></PlayerStatusCard>
              </div>
            )
          })}
        </div>
        {roundStarted && <RoundTimer />}
        {roundStarted && <AnswerOptions question={currentQuestion} />}
      </div>
      <RoleView forModeRole="player">
        <AddPlayerToSessionForm />
      </RoleView>
      <RoleView forModeRole="admin">
        <AdminGameBar></AdminGameBar>
      </RoleView>
    </div>
  )
}
