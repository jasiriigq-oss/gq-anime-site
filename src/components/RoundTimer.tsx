'use client'
import { useRoomState } from '@colyseus/react'
import { Room } from '@colyseus/sdk'
import { type GameRoom } from 'game-server/src/rooms/GameRoom'
import { type GameRoomState } from 'game-server/src/rooms/schema/GameRoomState'
import { useEffect, useState } from 'react'

export interface RoundTimerProps extends React.PropsWithChildren {
  room?: Room<GameRoom, GameRoomState>
}
export const RoundTimer: React.FC<RoundTimerProps> = ({ room }: RoundTimerProps) => {
  const round = useRoomState(room, (r) => r.round)
  const roundStarted = useRoomState(room, (r) => r.roundStarted)
  const roundSecondsLeft = useRoomState(room, (r) => r.roundSecondsLeft)

  useEffect(() => {}, [round, roundSecondsLeft, roundStarted])
  return (
    <div className="flex justify-center my-2">
      <div className="flex justify-center items-center rounded-full bg-blue-500 h-20 text-white aspect-square text-4xl font-bold">
        <div>{roundSecondsLeft}</div>
      </div>
    </div>
  )
}
