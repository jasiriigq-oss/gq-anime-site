import { useContext, useMemo } from 'react'
import { GameState, GameStoreContext } from './game-state'
import 'react-h5-audio-player/lib/styles.css'
import AudioPlayer from 'react-h5-audio-player'
import { Media } from '@/payload-types'
export interface QuestionDisplayProps extends React.PropsWithChildren {}
export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({}: QuestionDisplayProps) => {
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
    sessionPlayers,
    playersList,
  } = ctx as GameState

  const hintAudio = (currentQuestion?.hintSound as Media)?.url ?? undefined

  return (
    <>
      {roundStarted && (
        <div>
          <div className="text-center text-white font-black text-3xl">{currentQuestion?.name}</div>
          {currentQuestion?.questionType == 'audio' && hintAudio && (
            <AudioPlayer
              autoPlay
              src={hintAudio}
              onPlay={(e) => console.log('onPlay')}
              // other props here
            />
          )}
        </div>
      )}
    </>
  )
}
