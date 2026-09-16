import { GameSessionPlayer } from '@/payload-types'
import { useRoomState } from '@colyseus/react'
import { Player } from 'game-server/src/rooms/schema/GameRoomState'
import { useContext } from 'react'
import { GameStoreContext, GameState } from './game-state'
import { getPlayerColorFromIndex } from '@/app/game-lib'

export interface PlayerStatusCardProps extends React.PropsWithChildren {
  player?: Player
  sessionPlayer?: GameSessionPlayer
}
export const PlayerStatusCard: React.FC<PlayerStatusCardProps> = ({
  sessionPlayer,
}: PlayerStatusCardProps) => {
  const ctx = useContext(GameStoreContext)

  const { playersList, gameStarted } = ctx as GameState
  const player = playersList?.find((p) => p.sessionId == sessionPlayer?.id)

  const color = getPlayerColorFromIndex(sessionPlayer?.index ?? 0)

  if (gameStarted && !player?.ready) return <></>

  return (
    <div
      data-index={player?.index}
      style={{
        borderColor: color.hex,
      }}
      className="text-white border-2 w-fit flex gap-2 p-2 items-center rounded-2xl bg-neutral-900 relative"
    >
      {player?.eliminated && (
        <div className="absolute origin-center top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.9)] backdrop:blur-2xl rounded-2xl flex justify-center items-center">
          <div className="relative -rotate-30 font-bold">Eliminated!</div>
        </div>
      )}
      {player?.ready && (
        <>
          <img
            className="rounded-full aspect-square h-15"
            width={60}
            height={60}
            src={player?.picture && player?.picture.length > 0 ? player.picture : ''}
            alt={`${sessionPlayer?.index} sessionPlayer?.index`}
          />
          <div>
            <div className="font-bold">{player?.name}</div>
            <div>Score: {player?.score}</div>
            {player?.ready && !gameStarted && (
              <div className="badge badge-success text-xs">Ready</div>
            )}
          </div>
        </>
      )}

      {!player?.ready && (
        <>
          <div>{color.name} Joining...</div>
        </>
      )}
    </div>
  )
}
