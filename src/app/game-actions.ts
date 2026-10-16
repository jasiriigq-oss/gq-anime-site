'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import * as engine from '@/lib/game/engine'
import { getCurrentUser } from '@/lib/payload'
import type { GameRole } from '@/lib/game/types'

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export async function createRoomAction(
  quizId: number,
): Promise<ActionResult<{ code: string; roomId: string }>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'You must be logged in to host a game.' }
  if (user.role !== 'admin') return { ok: false, error: 'Only admins can host a game.' }

  const name = user.username || user.email || 'Host'
  const result = await engine.createRoom(quizId, { userId: user.id, name })
  if (!result.ok) return result
  revalidatePath('/play')
  return result
}

export async function joinRoomAction(
  code: string,
  input: { name: string; avatar: string; role?: GameRole },
): Promise<ActionResult<{ playerId: string; roomId: string }>> {
  return engine.joinRoom(code, input)
}

export async function setReadyAction(playerId: string, ready: boolean) {
  return engine.setReady(playerId, ready)
}

export async function startGameAction(roomId: string) {
  return engine.startGame(roomId)
}

export async function submitAnswerAction(playerId: string, answerIndex: number) {
  return engine.submitAnswer(playerId, answerIndex)
}

export async function revealRoundAction(roomId: string) {
  return engine.revealRound(roomId)
}

export async function nextRoundAction(roomId: string): Promise<ActionResult<{ ended: boolean }>> {
  return engine.nextRound(roomId)
}

export async function endGameAction(roomId: string) {
  return engine.endGame(roomId)
}

export async function pauseTimerAction(roomId: string) {
  return engine.pauseTimer(roomId)
}

export async function resumeTimerAction(roomId: string) {
  return engine.resumeTimer(roomId)
}

export async function removePlayerAction(playerId: string) {
  return engine.removePlayer(playerId)
}

export async function sendAnnouncementAction(roomId: string, message: string) {
  return engine.sendAnnouncement(roomId, message)
}

export async function sendChatAction(
  roomId: string,
  input: { playerName: string; role: GameRole; message: string },
) {
  return engine.sendChat(roomId, input)
}

export async function hostAnotherGameAction(quizId: number) {
  const result = await createRoomAction(quizId)
  if (result.ok) redirect(`/play/${result.data.code}?mode=admin`)
}
