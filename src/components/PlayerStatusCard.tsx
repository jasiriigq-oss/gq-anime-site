import { GameSessionPlayer } from '@/payload-types'
import { useRoomState } from '@colyseus/react'
import { type GameRoom } from 'game-server/src/rooms/GameRoom'
import { Player } from 'game-server/src/rooms/schema/GameRoomState'

export interface PlayerStatusPropsProps extends React.PropsWithChildren {
  room?: GameRoom
  playerSession?: GameSessionPlayer
  player?: Player
}
export const PlayerStatusProps: React.FC<PlayerStatusPropsProps> = ({
  room,
  player,
  playerSession,
}: PlayerStatusPropsProps) => {
  return <></>
}
