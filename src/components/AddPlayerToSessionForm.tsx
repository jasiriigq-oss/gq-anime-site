'use client'

import { GameSessionPlayer } from '@/payload-types'
import { ImageSelect } from './ImageSelect'
import { SubmitEventHandler, useActionState, useContext, useEffect, useState } from 'react'
import { playerIconOptions } from '@/app/game-lib'
import { GameStoreContext, GameState } from './game-state'

export interface AddPlayerToSessionFormProps extends React.PropsWithChildren {}
export const AddPlayerToSessionForm: React.FC<
  AddPlayerToSessionFormProps
> = ({}: AddPlayerToSessionFormProps) => {
  const [selectedPlayerIconIndex, setSelectedPlayerIconIndex] = useState(0)

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

  const _handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    const formdata = new FormData(e.target)
    const name = formdata.get('name')?.toString() ?? '(unset)'
    const picture = formdata.get('picture')?.toString() ?? '(unset)'
    room?.send('setPlayerReady', { name, picture })
  }
  useEffect(() => {}, [currentPlayer, currentPlayer?.ready, sessionPlayer])

  return (
    <div className={'w-fit mx-auto ' + (currentPlayer?.ready === true ? ' hidden' : '')}>
      <form onSubmit={_handleSubmit}>
        <input
          type="hidden"
          name="image"
          value={playerIconOptions[selectedPlayerIconIndex].image}
        />
        <fieldset className="fieldset bg-base-100 border-primary-content rounded-box w-xs border-2 p-4">
          <div className="flex justify-center">
            <img
              className="rounded-full text-center"
              src={playerIconOptions[selectedPlayerIconIndex].image}
              alt="Player Icon"
            />
          </div>
          <div className="label font-bold">Select Player Icon</div>
          <ImageSelect onIndexSet={setSelectedPlayerIconIndex} itemName="picture" />

          <legend className="fieldset-legend text-2xl">Join Game</legend>
          <label className="label font-bold">Name</label>
          <input name="name" required type="text" className="input" placeholder="My Player Name" />
          <button className="btn" type="submit">
            Join Game
          </button>
        </fieldset>
      </form>
    </div>
  )
}
