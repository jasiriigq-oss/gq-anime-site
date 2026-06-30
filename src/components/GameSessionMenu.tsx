'use client'

import { ContentWell } from './ContentWell'
import { CreateGameSessionForm } from './CreateGameSessionForm'
import { MySessionsTable } from './MySessionsTable'
import { useState, useEffect } from 'react'
export interface GameSessionMenuProps extends React.PropsWithChildren {}
export const GameSessionMenu: React.FC<GameSessionMenuProps> = ({}: GameSessionMenuProps) => {
  const [state, setState] = useState(0)

  function refresh() {
    setState(state + 1)
  }

  useEffect(() => {
    console.log('I am refreshing')
  }, [state])

  return (
    <div className=" flex flex-col gap-4">
      <MySessionsTable updateNumber={state} />

      <ContentWell className="flex justify-center">
        <CreateGameSessionForm refresh={refresh} />
      </ContentWell>
    </div>
  )
}
