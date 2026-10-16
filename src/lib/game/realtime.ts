'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase'
import type { GameRoom, GamePlayer, GameChatMessage, GameEvent } from './types'

export type GameLiveState = {
  room: GameRoom | null
  players: GamePlayer[]
  chat: GameChatMessage[]
  events: GameEvent[]
  connected: boolean
}

// Subscribes to the four live game tables for a room and keeps local state in
// sync via Supabase Realtime (postgres_changes).
export function useGameRealtime(roomId: string | null): GameLiveState {
  const [room, setRoom] = useState<GameRoom | null>(null)
  const [players, setPlayers] = useState<GamePlayer[]>([])
  const [chat, setChat] = useState<GameChatMessage[]>([])
  const [events, setEvents] = useState<GameEvent[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!roomId) return
    let mounted = true
    const sb = supabaseBrowser

    const initial = async () => {
      const [r, p, c, e] = await Promise.all([
        sb.from('game_room').select('*').eq('id', roomId).single(),
        sb.from('game_player').select('*').eq('room_id', roomId).order('created_at'),
        sb.from('game_chat').select('*').eq('room_id', roomId).order('created_at').limit(100),
        sb.from('game_event').select('*').eq('room_id', roomId).order('created_at', { ascending: false }).limit(100),
      ])
      if (!mounted) return
      if (r.data) setRoom(r.data as GameRoom)
      if (p.data) setPlayers(p.data as GamePlayer[])
      if (c.data) setChat(c.data as GameChatMessage[])
      if (e.data) setEvents((e.data as GameEvent[]).reverse())
    }
    initial()

    const channel = sb
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_room', filter: `id=eq.${roomId}` },
        (payload) => {
          if (!mounted) return
          if (payload.eventType === 'DELETE') setRoom(null)
          else setRoom(payload.new as GameRoom)
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_player', filter: `room_id=eq.${roomId}` },
        (payload) => {
          if (!mounted) return
          const row = payload.new as GamePlayer
          const old = payload.old as { id?: string } | undefined
          setPlayers((prev) => {
            if (payload.eventType === 'DELETE') return prev.filter((x) => x.id !== old?.id)
            if (payload.eventType === 'INSERT') return [...prev, row]
            return prev.map((x) => (x.id === row.id ? row : x))
          })
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game_chat', filter: `room_id=eq.${roomId}` },
        (payload) => {
          if (!mounted) return
          setChat((prev) => [...prev, payload.new as GameChatMessage].slice(-100))
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game_event', filter: `room_id=eq.${roomId}` },
        (payload) => {
          if (!mounted) return
          setEvents((prev) => [...prev, payload.new as GameEvent].slice(-120))
        },
      )
      .subscribe((status) => {
        if (mounted) setConnected(status === 'SUBSCRIBED')
      })

    return () => {
      mounted = false
      sb.removeChannel(channel)
    }
  }, [roomId])

  return { room, players, chat, events, connected }
}

// Compute the number of seconds remaining in the current question, driven by
// round_deadline (authoritative). Returns null when no timer is running.
export function computeSecondsLeft(room: GameRoom | null): number | null {
  if (!room || room.round_state !== 'question' || room.paused || !room.round_deadline) return null
  const ms = new Date(room.round_deadline).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 1000))
}
