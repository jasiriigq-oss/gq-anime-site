'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import { FiCheck, FiCopy, FiUser, FiUsers } from 'react-icons/fi'
import { useGameRealtime } from '@/lib/game/realtime'
import {
  submitAnswerAction,
  setReadyAction,
  startGameAction,
  revealRoundAction,
} from '@/app/game-actions'
import { answerLetter, ANSWER_COLORS, PLAYER_COLORS } from '@/lib/utils'
import { FEEDBACK_COPY, feedbackKind, playFeedbackSound } from '@/lib/game/feedback'
import type { FeedbackKind, GamePlayer, GameRole, GameSounds, QuestionSnapshot } from '@/lib/game/types'
import { ChatPanel } from './ChatPanel'
import { AdminControls } from './AdminControls'

// ---------------------------------------------------------------------------

function Avatar({ src, size = 40 }: { src?: string | null; size?: number }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className="rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <div className="rounded-full bg-white/15" style={{ width: size, height: size }} />
  )
}

function Timer({ secondsLeft, total }: { secondsLeft: number | null; total: number }) {
  const value = secondsLeft ?? total
  const pct = total > 0 ? Math.max(0, Math.min(1, value / total)) : 0
  const r = 34
  const c = 2 * Math.PI * r
  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#2b2b2b" strokeWidth="7" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={pct < 0.25 ? '#ef4444' : '#e91e63'}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white">
        {secondsLeft === null ? '—' : secondsLeft}
        <span className="text-xs font-normal text-white/60">s</span>
      </div>
    </div>
  )
}

function Leaderboard({
  players,
  currentPlayerId,
  revealed,
}: {
  players: GamePlayer[]
  currentPlayerId?: string | null
  revealed: boolean
}) {
  const ranked = [...players]
    .filter((p) => p.role !== 'spectator')
    .sort((a, b) => b.score - a.score || a.created_at.localeCompare(b.created_at))
  const spectators = players.filter((p) => p.role === 'spectator')

  return (
    <div className="space-y-2">
      {ranked.map((p, i) => {
        const color = PLAYER_COLORS[i % PLAYER_COLORS.length].hex
        const isMe = p.id === currentPlayerId
        const answered = p.answer_index != null
        return (
          <div
            key={p.id}
            className={`flex items-center gap-2 rounded-xl border-l-4 bg-ink-card px-3 py-2 ${
              isMe ? 'ring-2 ring-brand' : ''
            } ${p.eliminated ? 'opacity-40' : ''}`}
            style={{ borderLeftColor: color }}
          >
            <Avatar src={p.avatar} size={32} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                {p.name}
                {p.role === 'admin' && ' (Host)'}
              </p>
              {!revealed && p.role === 'player' && (
                <p className="text-[10px] text-white/50">
                  {answered ? '✓ answered' : '…'}
                </p>
              )}
            </div>
            <span className="text-sm font-black text-white">{(p.score ?? 0).toLocaleString()}</span>
          </div>
        )
      })}
      {spectators.length > 0 && (
        <p className="pt-1 text-[11px] text-white/40">
          {spectators.length} spectator{spectators.length > 1 ? 's' : ''} watching
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

function LobbyView({
  room,
  code,
  mode,
  myPlayer,
  players,
  readyCount,
}: {
  room: NonNullable<ReturnType<typeof useGameRealtime>['room']>
  code: string
  mode: GameRole
  myPlayer: GamePlayer | null
  players: GamePlayer[]
  readyCount: number
}) {
  const [copied, setCopied] = useState(false)
  const [pending, setPending] = useState(false)
  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/join?code=${code}` : ''

  async function copy() {
    await navigator.clipboard.writeText(joinUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const canStart = players.filter((p) => p.role === 'player').length >= 1

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-dark p-8 text-center">
          <h1 className="text-2xl font-black text-white">{room.quiz_title ?? 'Anime Quiz'}</h1>
          <p className="mt-1 text-white/50">Join at the code below</p>

          <div className="mx-auto mt-6 w-fit rounded-3xl bg-white p-5">
            <QRCode value={joinUrl} size={176} />
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="text-5xl font-black tracking-[0.3em] text-white">{code}</span>
            <button onClick={copy} className="btn-dark !p-2" aria-label="Copy join link">
              {copied ? <FiCheck className="text-green-400" /> : <FiCopy />}
            </button>
          </div>

          {mode === 'admin' ? (
            <button
              onClick={async () => {
                setPending(true)
                await startGameAction(room.id)
                setPending(false)
              }}
              disabled={!canStart || pending}
              className="btn-brand mt-6 w-full"
            >
              {pending ? 'Starting…' : 'Start Game'}
            </button>
          ) : (
            <p className="mt-6 text-white/50">Waiting for the host to start…</p>
          )}
        </div>

        <div className="card-dark p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-white">
              Players{' '}
              <span className="text-sm font-normal text-white/50">
                ({readyCount} ready)
              </span>
            </h2>
            {mode === 'player' && myPlayer && (
              <button
                onClick={async () => {
                  setPending(true)
                  await setReadyAction(myPlayer.id, !myPlayer.ready)
                  setPending(false)
                }}
                className={myPlayer.ready ? 'btn-dark !py-1.5' : 'btn-brand !py-1.5'}
                disabled={pending}
              >
                {myPlayer.ready ? 'Ready ✓' : 'Mark Ready'}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {players.length === 0 && <p className="text-white/40">No one has joined yet.</p>}
            {players
              .filter((p) => p.role !== 'spectator')
              .map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2">
                  <Avatar src={p.avatar} size={36} />
                  <span className="flex-1 font-bold text-white">{p.name}</span>
                  {p.role === 'admin' ? (
                    <span className="text-xs text-accent">HOST</span>
                  ) : (
                    <span className={`text-sm font-bold ${p.ready ? 'text-green-400' : 'text-white/40'}`}>
                      {p.ready ? 'Ready' : 'Not ready'}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

function QuestionMedia({ question }: { question: QuestionSnapshot }) {
  if (question.questionType === 'image' && question.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={question.image} alt="" className="mx-auto max-h-64 rounded-xl object-contain" />
    )
  }
  if (question.questionType === 'video' && question.video) {
    return <video src={question.video} controls className="mx-auto max-h-64 rounded-xl" />
  }
  if (question.questionType === 'audio' && question.audio) {
    return <audio src={question.audio} controls className="mx-auto w-full max-w-md" />
  }
  return null
}

function InGameView({
  room,
  mode,
  myPlayer,
  players,
  chat,
  events,
  playerName,
  secondsLeft,
  totalTime,
  onAnswer,
  feedback,
}: {
  room: NonNullable<ReturnType<typeof useGameRealtime>['room']>
  mode: GameRole
  myPlayer: GamePlayer | null
  players: GamePlayer[]
  chat: ReturnType<typeof useGameRealtime>['chat']
  events: ReturnType<typeof useGameRealtime>['events']
  playerName: string
  secondsLeft: number | null
  totalTime: number
  onAnswer: (index: number) => void
  feedback: { kind: FeedbackKind; nonce: number } | null
}) {
  const quiz = room.quiz_data
  const question = quiz.questions[room.round] as QuestionSnapshot | undefined
  const isQuestion = room.round_state === 'question'
  const isReveal = room.round_state === 'reveal'
  const correctIndex = room.revealed_correct_index ?? null
  const myAnswer = myPlayer?.answer_index ?? null
  const canAnswer = mode === 'player' && isQuestion && myPlayer && !myPlayer.eliminated && myAnswer == null

  if (!question) return <div className="p-10 text-center text-white/50">Loading question…</div>

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {feedback && (
        <div
          key={feedback.nonce}
          className="flash-layer"
          style={{ background: FEEDBACK_COPY[feedback.kind].flash }}
        />
      )}
      <div className="grid gap-4 lg:grid-cols-[240px_1fr_300px]">
        {/* left: timer + leaderboard */}
        <div className="space-y-4">
          <div className="card-dark flex flex-col items-center gap-3 p-4">
            <Timer secondsLeft={secondsLeft} total={totalTime} />
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
              Round {room.round + 1} / {room.total_rounds}
            </span>
          </div>
          <Leaderboard players={players} currentPlayerId={myPlayer?.id} revealed={isReveal} />
        </div>

        {/* center: question */}
        <div className="card-dark p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">
              {quiz.title}
            </span>
            <span className="text-sm text-white/50">
              {mode === 'spectator' && '👀 Spectating'}
              {myPlayer?.eliminated && ' ✖ Eliminated'}
            </span>
          </div>

          <h2 className="mt-3 text-xl font-black text-white md:text-2xl">{question.questionText}</h2>
          <QuestionMedia question={question} />

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {question.answers.map((a, i) => {
              const color = ANSWER_COLORS[i % ANSWER_COLORS.length]
              const isCorrectAnswer = isReveal && correctIndex === i
              const isWrongPick = isReveal && myAnswer === i && correctIndex !== i
              return (
                <button
                  key={i}
                  disabled={!canAnswer}
                  onClick={() => onAnswer(i)}
                  className="answer-btn"
                  style={{
                    background: isCorrectAnswer ? '#16a34a' : isWrongPick ? '#dc2626' : color.bg,
                    color: isCorrectAnswer || isWrongPick ? '#fff' : color.text,
                    opacity: isReveal && !isCorrectAnswer && !isWrongPick ? 0.55 : 1,
                  }}
                >
                  <span className="answer-letter">{answerLetter(i)}</span>
                  <span className="flex-1">{a.text}</span>
                  {isCorrectAnswer && <FiCheck className="text-xl" />}
                </button>
              )
            })}
          </div>

          {mode === 'player' && (
            <div className="mt-4 text-center text-sm">
              {isQuestion && myPlayer?.eliminated && <p className="text-red-400">You&apos;ve been eliminated.</p>}
              {isQuestion && !myPlayer?.eliminated && myAnswer != null && (
                <p className="text-white/60">Answer locked in ✓</p>
              )}
              {isReveal && feedback && (
                <p
                  key={feedback.nonce}
                  className={`text-lg font-black ${FEEDBACK_COPY[feedback.kind].className}`}
                >
                  {feedback.kind === 'correct'
                    ? `Correct! +${question.points} pts`
                    : feedback.kind === 'timeout'
                      ? "Time's up!"
                      : 'Incorrect'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* right: chat / admin */}
        <div className="flex flex-col gap-4">
          {mode === 'admin' && <AdminControls room={room} players={players} events={events} />}
          <div className="min-h-[300px]">
            <ChatPanel roomId={room.id} playerName={playerName} role={mode} messages={chat} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

function ResultsView({
  room,
  players,
  events,
  mode,
}: {
  room: NonNullable<ReturnType<typeof useGameRealtime>['room']>
  players: GamePlayer[]
  events: ReturnType<typeof useGameRealtime>['events']
  mode: GameRole
}) {
  const ranked = players.filter((p) => p.role === 'player').sort((a, b) => b.score - a.score)
  const winner = ranked[0]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="card-dark p-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-accent">Winner</p>
        <h1 className="mt-2 text-3xl font-black text-white">
          {winner ? (
            <>
              <span className="text-gold">CHAMPION:</span> {winner.name}
            </>
          ) : (
            'No players'
          )}
        </h1>
        {winner && (
          <p className="mt-1 text-white/60">
            FINAL SCORE: <span className="text-accent">{(winner.score ?? 0).toLocaleString()} PTS</span>
          </p>
        )}
        {winner?.avatar && (
          <div className="mx-auto mt-6 w-fit rounded-full ring-4 ring-gold">
            <Avatar src={winner.avatar} size={96} />
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {ranked.map((p, i) => (
          <div
            key={p.id}
            className="card-dark flex flex-col items-center gap-1 p-4 text-center"
            style={{ borderTop: `4px solid ${PLAYER_COLORS[i % PLAYER_COLORS.length].hex}` }}
          >
            <span className="text-xs font-bold text-white/50">Rank #{i + 1}</span>
            <Avatar src={p.avatar} size={48} />
            <span className="w-full truncate text-sm font-bold text-white">{p.name}</span>
            <span className="text-xs text-white/60">{(p.score ?? 0).toLocaleString()} pts</span>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card-dark p-4">
          <h3 className="font-black text-white">Play Summary</h3>
          <div className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs text-white/60">
            {events.map((e) => (
              <p key={e.id}>{e.message}</p>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 p-4">
          <Link href="/search" className="btn-brand w-full">
            <FiUsers /> Browse More Quizzes
          </Link>
          {mode === 'admin' && (
            <Link href="/profile" className="btn-dark w-full">
              <FiUser /> Back to Profile
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export function GameClient({
  code,
  roomId,
  mode,
  playerId,
  sounds,
}: {
  code: string
  roomId: string
  mode: GameRole
  playerId: string | null
  sounds?: GameSounds | null
}) {
  const { room, players, chat, events, connected } = useGameRealtime(roomId)
  const [now, setNow] = useState(Date.now())
  const [localAnswer, setLocalAnswer] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{ kind: FeedbackKind; nonce: number } | null>(null)
  const revealedRef = useRef(false)
  const prevRoundState = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!room || room.round_state !== 'question' || room.paused) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [room?.round_state, room?.paused, room?.id])

  const myPlayer = useMemo(
    () => players.find((p) => p.id === playerId) ?? null,
    [players, playerId],
  )
  const playerName = myPlayer?.name ?? (mode === 'admin' ? 'Host' : mode)

  // Feedback animation + sound when a round is revealed (players only).
  useEffect(() => {
    const state = room?.round_state
    if (state === 'reveal' && prevRoundState.current !== 'reveal' && mode === 'player' && myPlayer) {
      const kind = feedbackKind(myPlayer.answer_index, myPlayer.last_correct)
      setFeedback({ kind, nonce: Date.now() })
      playFeedbackSound(kind, sounds)
    }
    if (state !== 'reveal') setFeedback(null)
    prevRoundState.current = state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.round_state, mode, myPlayer, sounds])

  const question = room?.quiz_data.questions[room?.round ?? 0] as QuestionSnapshot | undefined
  const totalTime = question?.timeLimitSeconds ?? 15
  const deadline = room?.round_deadline
  const secondsLeft =
    deadline && room?.round_state === 'question' && !room?.paused
      ? Math.max(0, Math.ceil((new Date(deadline).getTime() - now) / 1000))
      : null

  // Auto-reveal when the timer hits zero (host only, authoritative).
  useEffect(() => {
    if (mode !== 'admin') return
    if (room?.round_state === 'question' && secondsLeft === 0 && !revealedRef.current) {
      revealedRef.current = true
      revealRoundAction(room.id)
    }
    if (room?.round_state !== 'question') revealedRef.current = false
  }, [secondsLeft, room?.round_state, mode, room?.id])

  async function onAnswer(index: number) {
    if (!playerId) return
    setLocalAnswer(index)
    const res = await submitAnswerAction(playerId, index)
    if (!res.ok) setLocalAnswer(null)
  }

  if (!room) {
    return (
      <div className="p-16 text-center text-white/60">
        {connected ? 'Game not found.' : 'Connecting to game…'}
      </div>
    )
  }

  const readyCount = players.filter((p) => p.ready && p.role !== 'spectator').length

  if (room.state === 'lobby') {
    return (
      <LobbyView room={room} code={code} mode={mode} myPlayer={myPlayer} players={players} readyCount={readyCount} />
    )
  }

  if (room.state === 'ended' || room.round_state === 'leaderboard') {
    return <ResultsView room={room} players={players} events={events} mode={mode} />
  }

  return (
    <InGameView
      room={room}
      mode={mode}
      myPlayer={myPlayer}
      players={players}
      chat={chat}
      events={events}
      playerName={playerName}
      secondsLeft={secondsLeft}
      totalTime={totalTime}
      onAnswer={onAnswer}
      feedback={feedback}
    />
  )
}
