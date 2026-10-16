'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createRoomAction } from '@/app/game-actions'

export function HostGameButton({ quizId }: { quizId: number }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function onClick() {
    setPending(true)
    setError('')
    const result = await createRoomAction(quizId)
    if (result.ok) {
      router.push(`/play/${result.data.code}?mode=admin`)
    } else {
      setError(result.error)
      setPending(false)
    }
  }

  return (
    <div>
      <button onClick={onClick} disabled={pending} className="btn-brand w-full">
        {pending ? 'Creating lobby…' : 'Host Multi-Player'}
      </button>
      {error && <p className="field-error mt-2 text-center">{error}</p>}
    </div>
  )
}
