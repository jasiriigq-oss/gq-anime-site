'use client'

import { useContext } from 'react'
import { ContentWell } from './ContentWell'
import { JoinCard } from './JoinCard'
import { GameContainer } from './GameContainer'
import { GameState, GameStoreContext } from './game-state'
import { RoleView } from './RoleView'

export interface GameRoomComponentProps extends React.PropsWithChildren {}
const GameRoomComponent: React.FC<GameRoomComponentProps> = ({}: GameRoomComponentProps) => {
  'use client'
  const ctx = useContext(GameStoreContext)

  const { isConnecting, roomError, mode, allPlayers, sessionPlayers } = ctx as GameState

  return (
    <div className="border border-primary">
      {isConnecting && <div className="text-center">Connecting</div>}
      {roomError && <div className="text-center">{roomError.message}</div>}
      <GameContainer></GameContainer>
      <RoleView forModeRole="admin">
        <div className="collapse bg-base-100 border border-base-300 max-w-2xl mx-auto my-5">
          <input type="checkbox" defaultChecked />
          <div className="collapse-title font-semibold text-2xl">Players Links</div>
          <div className="collapse-content">
            <div className="my-4">
              <h2 className="text-center text-2xl font-bold mb-5"></h2>
              <div className="flex flex-wrap gap-4 justify-center">
                {sessionPlayers.map((playerSession, i) => {
                  return (
                    <div className="max-w-sm mx-auto" key={i}>
                      <JoinCard key={playerSession.id} playerSession={playerSession} />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </RoleView>
    </div>
  )
}
export default GameRoomComponent
