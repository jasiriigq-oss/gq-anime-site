'use client'

import { useState } from 'react'
import { FiPause, FiPlay, FiSkipForward, FiChevronRight, FiFlag, FiSend } from 'react-icons/fi'
import {
  pauseTimerAction,
  resumeTimerAction,
  revealRoundAction,
  nextRoundAction,
  endGameAction,
  sendAnnouncementAction,
  removePlayerAction,
} from '@/app/game-actions'
import { announcementSchema } from '@/lib/validation'
import type { GameEvent, GamePlayer, GameRoom } from '@/lib/game/types'

export function AdminControls({
  room,
  players,
  events,
}: {
  room: GameRoom
  players: GamePlayer[]
  events: GameEvent[]
}) {
  const [announcement, setAnnouncement] = useState('')
  const [annError, setAnnError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const isQuestion = room.round_state === 'question'
  const isReveal = room.round_state === 'reveal'
  const isLast = room.round >= room.total_rounds - 1

  async function run(key: string, fn: () => Promise<unknown>) {
    setBusy(key)
    await fn()
    setBusy(null)
  }

  async function onAnnounce(e: React.FormEvent) {
    e.preventDefault()
    const parsed = announcementSchema.safeParse({ message: announcement })
    if (!parsed.success) {
      setAnnError(parsed.error.issues[0]?.message ?? 'Invalid')
      return
    }
    setAnnError('')
    await sendAnnouncementAction(room.id, parsed.data.message)
    setAnnouncement('')
  }

  return (
    <div className="space-y-3 rounded-2xl bg-ink-card border border-white/8 p-4">
      <h3 className="font-black text-white">Admin Control</h3>

      <div className="grid grid-cols-2 gap-2">
        {isQuestion && (
          <button
            onClick={() => run('pause', () => (room.paused ? resumeTimerAction(room.id) : pauseTimerAction(room.id)))}
            className="btn-dark !py-2 text-sm"
            disabled={busy !== null}
          >
            {room.paused ? <FiPlay /> : <FiPause />} {room.paused ? 'Resume Timer' : 'Pause Timer'}
          </button>
        )}
        {isQuestion && (
          <button onClick={() => run('reveal', () => revealRoundAction(room.id))} className="btn-brand !py-2 text-sm" disabled={busy !== null}>
            <FiSkipForward /> Force Skip
          </button>
        )}
        {isReveal && (
          <button
            onClick={() => run('next', () => nextRoundAction(room.id))}
            className="btn-brand !py-2 text-sm"
            disabled={busy !== null}
          >
            <FiChevronRight /> {isLast ? 'Show Results' : 'Next Round'}
          </button>
        )}
        <button onClick={() => run('end', () => endGameAction(room.id))} className="btn-dark !py-2 text-sm" disabled={busy !== null}>
          <FiFlag /> End Game Early
        </button>
      </div>

      <form onSubmit={onAnnounce} className="flex gap-2">
        <input
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          placeholder="Announcement…"
          maxLength={280}
          className="input-dark !py-2 text-sm"
        />
        <button type="submit" className="btn-brand !p-2" aria-label="Send announcement">
          <FiSend />
        </button>
      </form>
      {annError && <p className="field-error">{annError}</p>}

      {/* remove players */}
      <div className="max-h-32 space-y-1 overflow-y-auto">
        {players
          .filter((p) => p.role === 'player')
          .map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1 text-sm">
              <span className="truncate text-white/85">{p.name}</span>
              <button
                onClick={() => run(`remove-${p.id}`, () => removePlayerAction(p.id))}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ))}
      </div>

      {/* admin feed */}
      <div className="border-t border-white/8 pt-2">
        <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-white/50">Admin Feed</h4>
        <div className="max-h-36 space-y-1 overflow-y-auto text-xs text-white/70">
          {events.length === 0 && <p className="text-white/40">No events yet.</p>}
          {[...events].reverse().map((e) => (
            <p key={e.id}>
              <span className={e.kind === 'admin' ? 'text-accent' : e.kind === 'player' ? 'text-brand-light' : 'text-white/50'}>
                [{e.kind}]
              </span>{' '}
              {e.message}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
