'use client'
import { motion } from 'motion/react'
import { RoundTimer } from './RoundTimer'
import { useContext } from 'react'
import { AnswerOptions } from './AnswerOptions'
import { AddPlayerToSessionForm } from './AddPlayerToSessionForm'
import { GameState, GameStoreContext } from './game-state'
import { RoleView } from './RoleView'
import { AdminGameBar } from './AdminGameBar'
import { PlayerStatusCard } from './PlayerStatusCard'
import { Media } from '@/payload-types'
import { ViewTransition } from 'react'
import { QuestionDisplay } from './QuestionDisplay'

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
    <ViewTransition default="none" enter="slide-up" exit="slide-down">
      <div className="stack w-full">
        <div className="min-h-75 relative pb-15">
          <div className="flex flex-col">
            <div id="stage" className="flex flex-col justify-center flex-1">
              <div className="text-center text-white font-black text-2xl my-5">{quiz?.name}</div>
              {gameStarted && <div className="text-center">(Round {(round ?? 0) + 1})</div>}
              {!gameStarted && (
                <img
                  className="w-20 h-20 aspect-square rounded-lg object-center self-center"
                  width={80}
                  height={80}
                  src={(quiz?.cover as Media).url ?? ''}
                  alt={quiz?.name}
                />
              )}
              <RoundTimer />
              <QuestionDisplay />
              <AnswerOptions question={currentQuestion} />
            </div>
            <RoleView forModeRole="player">
              <AddPlayerToSessionForm />
            </RoleView>
            <div id="players" className=" max-w-2xl mx-auto p-2 gap-4 flex flex-wrap">
              {sessionPlayers.map((sp) => {
                return <PlayerStatusCard key={sp.id} sessionPlayer={sp}></PlayerStatusCard>
              })}
            </div>
          </div>
          <div className="absolute -bottom-1 w-full">
            <RoleView forModeRole="admin">
              <AdminGameBar></AdminGameBar>
            </RoleView>
          </div>
        </div>
        {gameStarted && (
          <motion.div
            className="w-full h-full bg-linear-to-b from-blue-800 to-indigo-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-full h-full inset-0 -z-10 bg-[linear-gradient(to_right,#3b82f633_1px,transparent_1px),linear-gradient(to_bottom,#3b82f633_1px,transparent_1px)] bg-[size:16px_16px]"></div>
          </motion.div>
        )}
      </div>
    </ViewTransition>
  )
}
