'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiUsers, FiEye } from 'react-icons/fi'
import { joinRoomAction } from '@/app/game-actions'
import { joinGameSchema } from '@/lib/validation'
import { AVATARS } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function JoinForm({ initialCode = '' }: { initialCode?: string }) {
  const router = useRouter()
  const [code, setCode] = useState(initialCode)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [role, setRole] = useState<'player' | 'spectator'>('player')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [general, setGeneral] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = joinGameSchema.safeParse({ code, name, avatar })
    if (!parsed.success) {
      const errs: Record<string, string> = {}
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message
      setErrors(errs)
      setGeneral('')
      return
    }
    setPending(true)
    setErrors({})
    setGeneral('')
    const res = await joinRoomAction(parsed.data.code, {
      name: parsed.data.name,
      avatar: parsed.data.avatar,
      role,
    })
    setPending(false)
    if (!res.ok) {
      setGeneral(res.error)
      return
    }
    router.push(`/play/${parsed.data.code}?mode=${role}&player=${res.data.playerId}`)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="card-dark p-6">
        <h1 className="text-xl font-black text-white">Join a Game</h1>
        <p className="mt-1 text-sm text-white/50">Enter the 6-letter code from the host screen.</p>

        <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
          <div>
            <label className="label-dark" htmlFor="code">
              Game Code
            </label>
            <input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              className="input-dark text-center text-2xl font-black tracking-[0.4em]"
            />
            {errors.code && <p className="field-error">{errors.code}</p>}
          </div>

          <div>
            <label className="label-dark" htmlFor="name">
              Nickname
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your nickname"
              maxLength={20}
              className="input-dark"
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          <div>
            <span className="label-dark">Choose an avatar</span>
            <div className="flex gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className={cn(
                    'h-14 w-14 overflow-hidden rounded-full ring-2 transition',
                    avatar === a ? 'ring-brand scale-105' : 'ring-transparent',
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a} alt="avatar option" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="label-dark">Join as</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('player')}
                className={cn('btn-dark', role === 'player' && '!bg-brand !border-brand')}
              >
                <FiUsers /> Player
              </button>
              <button
                type="button"
                onClick={() => setRole('spectator')}
                className={cn('btn-dark', role === 'spectator' && '!bg-brand !border-brand')}
              >
                <FiEye /> Spectator
              </button>
            </div>
          </div>

          {general && <p className="field-error">{general}</p>}

          <button type="submit" disabled={pending} className="btn-brand w-full">
            {pending ? 'Joining…' : 'Join Game'}
          </button>
        </form>
      </div>
    </div>
  )
}
