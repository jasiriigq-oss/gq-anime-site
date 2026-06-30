import { submitAnswerAction } from '@/app/game-actions'
import { getAnswerText } from '@/app/game-lib'
import { useActionState } from 'react'

export interface GameSessionAnswerButtonProps extends React.PropsWithChildren {
  sessionId: number
  playerId: number
  answerIndex: number
}
export const GameSessionAnswerButton: React.FC<GameSessionAnswerButtonProps> = ({
  sessionId,
  playerId,
  answerIndex,
}: GameSessionAnswerButtonProps) => {
  const [state, action, isPending] = useActionState(submitAnswerAction, null)
  const answerText = getAnswerText(answerIndex)
  return (
    <>
      <form action={action}>
        <input name="sessionId" type="hidden" value={sessionId} />
        <input name="playerId" type="hidden" value={playerId} />
        <input name="answerIndex" type="hidden" value={answerIndex} />
        <button aria-label={`${answerText}`} type="submit">
          {answerText}
        </button>
      </form>
    </>
  )
}
