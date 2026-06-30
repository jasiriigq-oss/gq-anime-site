'use client'

import { GameSessionPlayer } from '@/payload-types'
import { ImageSelect } from './ImageSelect'
import { useActionState, useState } from 'react'
import { playerIconOptions } from '@/app/game-lib'
import { AddPlayerToSessionAction } from '@/app/game-actions'

export interface AddPlayerToSessionFormProps extends React.PropsWithChildren {
  sessionId: number
  player: GameSessionPlayer
}
export const AddPlayerToSessionForm: React.FC<AddPlayerToSessionFormProps> = ({
  sessionId,
  player,
}: AddPlayerToSessionFormProps) => {
  const [selectedPlayerIconIndex, setSelectedPlayerIconIndex] = useState(0)
  const [state, formAction, isPending] = useActionState(AddPlayerToSessionAction, {
    sessionId,
    playerInfo: {
      id: player.id,
      picture: playerIconOptions[selectedPlayerIconIndex].image,
      name: '',
    },
  })
  return (
    <>
      <div className="w-fit mx-auto">
        <form action={formAction}>
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
            <ImageSelect onIndexSet={setSelectedPlayerIconIndex} itemName="image" />

            <legend className="fieldset-legend text-2xl">Join Game</legend>
            <label className="label font-bold">Name</label>
            <input
              name="name"
              required
              type="text"
              className="input"
              placeholder="My Player Name"
            />
            <button className="btn" type="submit">
              Join Game
            </button>
          </fieldset>
        </form>
      </div>
    </>
  )
}
