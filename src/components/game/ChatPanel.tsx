'use client'

import { useEffect, useRef, useState } from 'react'
import { FiSend } from 'react-icons/fi'
import { sendChatAction } from '@/app/game-actions'
import { chatMessageSchema } from '@/lib/validation'
import type { GameChatMessage, GameRole } from '@/lib/game/types'

export function ChatPanel({
  roomId,
  playerName,
  role,
  messages,
}: {
  roomId: string
  playerName: string
  role: GameRole
  messages: GameChatMessage[]
}) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = chatMessageSchema.safeParse({ message: text })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid message')
      return
    }
    setPending(true)
    setError('')
    await sendChatAction(roomId, { playerName, role, message: parsed.data.message })
    setText('')
    setPending(false)
  }

  return (
    <div className="flex h-full flex-col rounded-2xl bg-ink-card border border-white/8">
      <div className="border-b border-white/8 px-4 py-3 font-black text-white">Chat</div>
      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {messages.length === 0 && <p className="text-sm text-white/40">Say hi 👋</p>}
        {messages.map((m) => (
          <div key={m.id} className="text-sm">
            <span className="font-bold text-accent">{m.player_name ?? 'anon'}: </span>
            <span className="text-white/85">{m.message}</span>
          </div>
        ))}
      </div>
      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-white/8 p-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message…"
          maxLength={280}
          className="input-dark !py-2"
        />
        <button type="submit" disabled={pending} className="btn-brand !p-2" aria-label="Send">
          <FiSend />
        </button>
      </form>
      {error && <p className="field-error px-3 pb-2">{error}</p>}
    </div>
  )
}
