import { useContext } from 'react'
import { GameStoreContext, GameState } from './game-state'
import { ro } from 'zod/v4/locales'

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
    playersList,
    questionsLeft,

    tick,
  } = ctx as GameState
  function _startGameHandle() {
    room?.send('startGame')
  }

  function _startRoundHandle() {
    room?.send('startRound')
  }
  function _nextRoundHandle() {
    room?.send('nextRound')
  }
  function _endGameHandle() {
    room?.send('endGame')
  }

  function _debugResetHandle() {
    room?.send('debugReset')
  }

  const joinedPlayerCount = playersList?.filter((p) => p.ready).length ?? 0

  return (
    <div
      className="flex justify-center p-2 bg-gray-950"
      data-rounds-left={questionsLeft}
      data-rounds={round}
      data-current-question={currentQuestion?.name}
    >
      {!gameStarted && (
        <button
          title="Start Game"
          onClick={(e) => _startGameHandle()}
          type="button"
          className="btn btn-active disabled:cursor-wait"
          disabled={joinedPlayerCount == 0}
        >
          Start Game
        </button>
      )}
      {gameStarted && !roundStarted && (
        <button
          title="Start Game"
          onClick={(e) => _startRoundHandle()}
          type="button"
          className="btn btn-active"
        >
          Start Round {(round ?? 0) + 1}
        </button>
      )}
      {gameStarted && roundEnded && (
        <button
          title="Start Next Round"
          onClick={(e) => _nextRoundHandle()}
          type="button"
          className="btn btn-active"
        >
          Next Round
        </button>
      )}
      {gameStarted && (
        <button
          title="Start Next Round"
          onClick={(e) => _debugResetHandle()}
          type="button"
          className="btn btn-error"
        >
          Reset
        </button>
      )}
      <div></div>
    </div>
  )
}
