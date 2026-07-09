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
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-2xl font-bold">Players</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {sessionPlayers.map((playerSession) => {
              return (
                <ContentWell key={playerSession.id} className="w-fit place-self-center">
                  <div className="max-w-sm mx-auto">
                    <JoinCard playerSession={playerSession} />
                  </div>
                </ContentWell>
              )
            })}
          </div>
        </div>
      </RoleView>
    </div>
  )
}
export default GameRoomComponent
