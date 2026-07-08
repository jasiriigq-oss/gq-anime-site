import { useContext } from 'react'
import { GameStoreContext, GameState } from './game-state'

export interface AdminGameBarProps extends React.PropsWithChildren {}
export const AdminGameBar: React.FC<AdminGameBarProps> = ({}: AdminGameBarProps) => {
  const ctx = useContext(GameStoreContext)

  const {
    round,
    roundEnded,
    currentQuestion,
    roundStarted,
    gameStarted,
    quiz,
    room,
    mode,
    currentPlayer,
    sessionPlayer,
    session,
  } = ctx as GameState
  function _startGameHandle() {
    room?.send('startGame')
  }

  function _startRoundHandle() {
    room?.send('startRound')
  }

  return (
    <>
      {!gameStarted && (
        <div className="flex justify-center my-2">
          <button
            title="Start Game"
            onClick={(e) => _startGameHandle()}
            type="button"
            className="btn btn-active"
          >
            Start Game
          </button>
        </div>
      )}
      {gameStarted && !roundStarted && (
        <div className="flex justify-center my-2">
          <button
            title="Start Game"
            onClick={(e) => _startRoundHandle()}
            type="button"
            className="btn btn-active"
          >
            Start Round {(round ?? 0) + 1}
          </button>
        </div>
      )}
    </>
  )
}
