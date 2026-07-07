'use client'
import { Question } from '@/payload-types'
import { useRoomState } from '@colyseus/react'
import { Room } from '@colyseus/sdk'
import { GameRoom } from 'game-server/src/rooms/GameRoom'
import { GameRoomState } from 'game-server/src/rooms/schema/GameRoomState'
import { useState } from 'react'
import { FaStar } from 'react-icons/fa'

export interface AnswerOptionsProps extends React.PropsWithChildren {
  question?: Question
  room?: Room<GameRoom, GameRoomState>
}
export const AnswerOptions: React.FC<AnswerOptionsProps> = ({
  question,
  room,
}: AnswerOptionsProps) => {
  const [selectAnswerIndex, setSelectAnswerIndex] = useState<number | null>(null)
  const roundEnded = useRoomState(room, (r) => r.roundEnded)

  return (
    <div className="grid grid-cols-2 gap-3">
      {(question?.answers ?? []).map((qa, i) => {
        return (
          <button
            title={`Answer - ${qa.text}`}
            disabled={roundEnded === true}
            onClick={() => setSelectAnswerIndex(i)}
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
