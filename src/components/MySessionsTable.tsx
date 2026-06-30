'use client'

import { getUserGameSessionsAction } from '@/app/game-actions'
import { Quizzes } from '@/collections/Quizzes'
import { GameSession, Quiz } from '@/payload-types'
import { useActionState, useEffect, useRef, useState } from 'react'
import { useGameStore } from './game-store'

export interface MySessionsTableProps extends React.PropsWithChildren {
  updateNumber: number
}
export const MySessionsTable: React.FC<MySessionsTableProps> = ({
  updateNumber,
}: MySessionsTableProps) => {
  const [formState, action, isPending] = useActionState(getUserGameSessionsAction, null)
  const formRef = useRef<HTMLFormElement | null>(null)
  useEffect(() => {
    if (formRef.current && !isPending) {
      formRef.current.requestSubmit()
    }
  }, [updateNumber])

  return (
    <div className="border border-primary p-2" data-update={updateNumber}>
      <h2 className="font-bold text-center">My Game Sessions</h2>
      <form ref={formRef} action={action}></form>
      {!(formState as any)?.result ||
        (isPending && <div className="loading loading-spinner z-10 loading-lg"></div>)}
      {(formState as any)?.result && (
        <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Status</th>
                <th>Quiz</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {(formState?.result?.data || []).map((gs, i) => {
                const quiz = gs.quiz as Quiz
                return (
                  <tr key={gs.id}>
                    <th>{gs.id}</th>
                    <th>{gs.name}</th>
                    <td className="capitalize">{gs.state}</td>
                    <td>{quiz.name}</td>
                    <td>
                      <div className="flex gap-3">
                        <a
                          className="btn"
                          href={`${window.location.origin}/play/${gs.id}?mode=admin`}
                        >
                          Manage
                        </a>
                        <a
                          className="btn"
                          href={`${window.location.origin}/play/${gs.id}?mode=spectate`}
                        >
                          Spectate
                        </a>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="border border-primary">
            {(formState?.result?.data || []).length == 0 && (
              <div className="text-center text-lg ">No Sessions Yet!</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
