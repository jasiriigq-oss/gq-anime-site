'use client'
import { Question } from '@/payload-types'
import { useRoomState } from '@colyseus/react'
import { Room } from '@colyseus/sdk'
import { GameRoom } from 'game-server/src/rooms/GameRoom'
import { GameRoomState } from 'game-server/src/rooms/schema/GameRoomState'
import { useContext, useState } from 'react'
import { FaStar } from 'react-icons/fa'
import { GameState, GameStoreContext } from './game-state'

export interface AnswerOptionsProps extends React.PropsWithChildren {
  question?: Question
}
export const AnswerOptions: React.FC<AnswerOptionsProps> = ({ question }: AnswerOptionsProps) => {
  const [selectAnswerIndex, setSelectAnswerIndex] = useState<number | null>(null)
  const ctx = useContext(GameStoreContext)

  const { roundEnded, room, mode } = ctx as GameState

  async function _handleSelectAnswer(index: number) {
    room?.send('submitAnswer', { answerIndex: index })
    setSelectAnswerIndex(index)
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {(question?.answers ?? []).map((qa, i) => {
        return (
          <button
            title={`Answer - ${qa.text}`}
            disabled={roundEnded === true || mode == 'admin'}
            onClick={() => _handleSelectAnswer(i)}
            key={qa.id}
            className={`${selectAnswerIndex == i ? 'bg-fuchsia-900' : ''} relative not-disabled:cursor-pointer transition-all border border-fuchsia-700 rounded-lg w-full min-h-40 hover:not-disabled:bg-fuchsia-500 flex justify-center items-center`}
          >
            <div className="font-bold text-white">{qa.text}</div>
            {roundEnded && qa.isCorrect && (
              <FaStar className="absolute fill-yellow-500 right-3 top-3 size-8" />
            )}
          </button>
        )
      })}
    </div>
  )
}
