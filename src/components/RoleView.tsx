import { GameState, GameStoreContext } from './game-state'
import { useContext } from 'react'

export interface RoleViewProps extends React.PropsWithChildren {
  forModeRole: 'admin' | 'spectator' | 'player'
}
export const RoleView: React.FC<RoleViewProps> = ({ children, forModeRole }: RoleViewProps) => {
  const ctx = useContext(GameStoreContext)
  const { mode } = ctx as GameState

  return <>{forModeRole == mode && children}</>
}
