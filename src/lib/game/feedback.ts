'use client'

import type { FeedbackKind, GameSounds } from '@/lib/game/types'

/**
 * Resolve how a player's answer turned out:
 * no answer submitted -> timeout, otherwise correct/incorrect.
 */
export function feedbackKind(
  answerIndex: number | null | undefined,
  lastCorrect: boolean | null | undefined,
): FeedbackKind {
  if (answerIndex == null) return 'timeout'
  return lastCorrect ? 'correct' : 'incorrect'
}

/** Play the admin-configured sound for a feedback kind (no-op if unset). */
export function playFeedbackSound(kind: FeedbackKind, sounds: GameSounds | null | undefined) {
  if (!sounds || !sounds.enabled) return
  const url = kind === 'correct' ? sounds.correct : kind === 'incorrect' ? sounds.incorrect : sounds.timeout
  if (!url) return
  try {
    const audio = new Audio(url)
    audio.volume = Math.max(0, Math.min(1, sounds.volume ?? 0.7))
    void audio.play().catch(() => {})
  } catch {
    /* autoplay may be blocked until the user interacts; ignore */
  }
}

export const FEEDBACK_COPY: Record<FeedbackKind, { title: string; className: string; flash: string }> = {
  correct: { title: 'Correct!', className: 'anim-correct text-green-400', flash: 'rgba(34,197,94,0.45)' },
  incorrect: { title: 'Incorrect', className: 'anim-incorrect text-red-400', flash: 'rgba(239,68,68,0.45)' },
  timeout: { title: "Time's up!", className: 'anim-timeout text-amber-400', flash: 'rgba(245,158,11,0.40)' },
}
