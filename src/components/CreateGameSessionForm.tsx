'use client'

import { getAvailableQuizzesAction, createGameSessionAction } from '@/app/game-actions'
import { useActionState, useEffect, useRef } from 'react'
import { ContentWell } from './ContentWell'
import { useGameStore } from './game-store'
export interface CreateGameSessionFormProps extends React.PropsWithChildren {
  refresh: () => void
}
export const CreateGameSessionForm: React.FC<CreateGameSessionFormProps> = ({
  refresh,
}: CreateGameSessionFormProps) => {
  const [availableQuizState, availableQuizAction, availableQuizIsPending] = useActionState(
    getAvailableQuizzesAction,
    null,
  )

  const [createGameSessionState, createAction, createGameSessionIsPending] = useActionState(
    createGameSessionAction,
    null,
  )

  const availableQuizForm = useRef<HTMLFormElement | null>(null)

  useEffect(() => {
    if (availableQuizForm.current && !createGameSessionIsPending) {
      availableQuizForm.current.requestSubmit()
    }
  }, [])

  return (
    <div className={` ${createGameSessionIsPending ? 'opacity-80' : ''} `}>
      <form
        name="server-action-get-quizzes"
        ref={availableQuizForm}
        action={availableQuizAction}
      ></form>
      <form action={createAction} onSubmit={() => refresh()}>
        <fieldset className="fieldset bg-base-100 border-primary-content rounded-box w-xs border-2 p-4">
          <legend className="fieldset-legend text-2xl">Create New Game</legend>
          <label className="label font-bold">Title</label>
          <input
            name="name"
            required
            type="text"
            className="input"
            placeholder="My Awesome Session"
          />
          <label className="label  font-bold"># of Players</label>
          <input
            name="playerCount"
            type="number"
            min={0}
            max={4}
            className="input"
            defaultValue={2}
            required
          />
          <label className="label font-bold">Quiz</label>
          <select
            name="quizId"
            required
            title="Select Quiz"
            defaultValue="(Quiz)"
            className="select"
          >
            <option disabled={true}>(Quiz)</option>
            {(availableQuizState?.result?.data || []).map((q) => {
              return (
                <option key={q.id} value={q.id}>
                  {q.name}
                </option>
              )
            })}
          </select>
        </fieldset>
        <div className="aura my-2">
          <button className="btn btn-neutral flex gap-2" disabled={createGameSessionIsPending}>
            <div>Create</div>
            {createGameSessionIsPending && (
              <div className="loading loading-spinner z-10 loading-lg"></div>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
