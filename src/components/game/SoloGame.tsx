'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiCheck, FiChevronRight } from 'react-icons/fi'
import { answerLetter, ANSWER_COLORS } from '@/lib/utils'
import { FEEDBACK_COPY, feedbackKind, playFeedbackSound } from '@/lib/game/feedback'
import type { FeedbackKind, GameSounds } from '@/lib/game/types'

type SoloQuestion = {
  questionText: string
  questionType: string
  image?: string | null
  video?: string | null
  audio?: string | null
  timeLimitSeconds: number
  points: number
  answers: { text: string; isCorrect: boolean }[]
}

export function SoloGame({
  title,
  questions,
  sounds,
}: {
  title: string
  questions: SoloQuestion[]
  sounds?: GameSounds | null
}) {
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [phase, setPhase] = useState<'question' | 'reveal' | 'done'>('question')
  const [selected, setSelected] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number>(questions[0]?.timeLimitSeconds ?? 15)
  const [finished, setFinished] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: FeedbackKind; nonce: number } | null>(null)

  const q = questions[index]
  const total = q?.timeLimitSeconds ?? 15

  useEffect(() => {
    if (phase !== 'question' || !q) return
    setSelected(null)
    setSecondsLeft(total)
    const id = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, phase, total])

  // Time-out handler kept out of the state updater (updaters must stay pure).
  useEffect(() => {
    if (phase === 'question' && total > 0 && secondsLeft <= 0) {
      reveal(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, phase, total])

  function reveal(i: number | null) {
    setSelected(i)
    setPhase('reveal')
    const correct = i != null && Boolean(q.answers[i]?.isCorrect)
    if (correct) {
      setScore((s) => s + q.points)
      setCorrectCount((c) => c + 1)
    }
    const kind = feedbackKind(i, correct)
    setFeedback({ kind, nonce: Date.now() })
    playFeedbackSound(kind, sounds)
  }

  function next() {
    setFeedback(null)
    if (index + 1 >= questions.length) {
      setFinished(true)
      setPhase('done')
    } else {
      setIndex((i) => i + 1)
      setPhase('question')
    }
  }

  if (finished || !q) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="card-dark p-10">
          <h1 className="text-3xl font-black text-white">Quiz Complete!</h1>
          <p className="mt-2 text-white/60">{title}</p>
          <p className="mt-6 text-5xl font-black text-accent">{score} pts</p>
          <p className="mt-2 text-white/60">
            {correctCount} / {questions.length} correct
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href={`/play/solo/${title}`} className="btn-brand">Play Again</Link>
            <Link href="/search" className="btn-dark">More Quizzes</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {feedback && (
        <div
          key={feedback.nonce}
          className="flash-layer"
          style={{ background: FEEDBACK_COPY[feedback.kind].flash }}
        />
      )}
      <div className="card-dark p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">{title}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
            {index + 1} / {questions.length}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-white md:text-2xl">{q.questionText}</h2>
          <span className={`ml-4 rounded-xl px-3 py-2 text-xl font-black ${secondsLeft <= 5 && phase === 'question' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'}`}>
            {phase === 'question' ? `${secondsLeft}s` : '—'}
          </span>
        </div>

        {q.questionType === 'image' && q.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={q.image} alt="" className="mx-auto mt-4 max-h-56 rounded-xl object-contain" />
        )}
        {q.questionType === 'video' && q.video && <video src={q.video} controls className="mx-auto mt-4 max-h-56 rounded-xl" />}
        {q.questionType === 'audio' && q.audio && <audio src={q.audio} controls className="mx-auto mt-4 w-full max-w-md" />}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {q.answers.map((a, i) => {
            const color = ANSWER_COLORS[i % ANSWER_COLORS.length]
            const isReveal = phase === 'reveal'
            const isCorrect = isReveal && a.isCorrect
            const isPicked = isReveal && selected === i
            const isWrongPick = isPicked && !a.isCorrect
            return (
              <button
                key={i}
                disabled={phase === 'reveal'}
                onClick={() => reveal(i)}
                className="answer-btn"
                style={{
                  background: isCorrect ? '#16a34a' : isWrongPick ? '#dc2626' : color.bg,
                  color: isCorrect || isWrongPick ? '#fff' : color.text,
                  opacity: isReveal && !isCorrect && !isWrongPick ? 0.5 : 1,
                }}
              >
                <span className="answer-letter">{answerLetter(i)}</span>
                <span className="flex-1">{a.text}</span>
                {isCorrect && <FiCheck className="text-xl" />}
              </button>
            )
          })}
        </div>

        {phase === 'reveal' && (
          <div className="mt-5 flex items-center justify-between">
            <p
              key={feedback?.nonce}
              className={`text-lg font-black ${feedback ? FEEDBACK_COPY[feedback.kind].className : ''}`}
            >
              {feedback?.kind === 'correct'
                ? `Correct! +${q.points} pts`
                : feedback?.kind === 'timeout'
                  ? "Time's up!"
                  : 'Incorrect'}
            </p>
            <button onClick={next} className="btn-brand">
              {index + 1 >= questions.length ? 'See Results' : 'Next'} <FiChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
