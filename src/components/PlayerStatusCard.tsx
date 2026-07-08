import { GameSessionPlayer } from '@/payload-types'
import { useRoomState } from '@colyseus/react'
import { type GameRoom } from 'game-server/src/rooms/GameRoom'
import { Player } from 'game-server/src/rooms/schema/GameRoomState'
import { useContext } from 'react'
import { GameStoreContext, GameState } from './game-state'

export interface PlayerStatusCardProps extends React.PropsWithChildren {
  player?: Player
  sessionPlayer?: GameSessionPlayer
}
export const PlayerStatusCard: React.FC<PlayerStatusCardProps> = ({
  sessionPlayer,
}: PlayerStatusCardProps) => {
  const ctx = useContext(GameStoreContext)

  const { playersList } = ctx as GameState
  const player = playersList?.find((p) => p.sessionId == sessionPlayer?.id)
  return (
    <div className="text-white border-2 border-white">
      {player?.score}
      {player?.name}
      {player?.picture}
      {player?.ready}
      {player?.index}
    </div>
  )
}
