'use client'
import { useRoomState } from '@colyseus/react'
import { Room } from '@colyseus/sdk'
import { type GameRoom } from 'game-server/src/rooms/GameRoom'
import { type GameRoomState } from 'game-server/src/rooms/schema/GameRoomState'
import { useContext, useEffect, useState } from 'react'
import { GameState, GameStoreContext } from './game-state'

export interface RoundTimerProps extends React.PropsWithChildren {}
export const RoundTimer: React.FC<RoundTimerProps> = ({}: RoundTimerProps) => {
  const ctx = useContext(GameStoreContext)
  const { round, roundStarted, roundSecondsLeft } = ctx as GameState

  useEffect(() => {}, [round, roundSecondsLeft, roundStarted])
  return (
    <div className="flex justify-center my-2">
      <div className="flex justify-center items-center rounded-full bg-blue-500 h-20 text-white aspect-square text-4xl font-bold">
        <div>{roundSecondsLeft}</div>
      </div>
    </div>
  )
}
