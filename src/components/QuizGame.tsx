'use client'

import { Question, Quiz } from '@/payload-types'
import { useEffect, useState } from 'react'
import QuestionComponent from './QuestionComponent'

export interface QuizGameProps {
  quiz?: Quiz
}

// Multiple choice index of answers

export default function QuizGame({ quiz }: QuizGameProps) {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameProgress, setGameProgress] = useState(0)
  const [gameAnswers, setGameAnswers] = useState<Set<number>[]>([])

  const currentQuestion = quiz?.questions?.[gameProgress] as Question | undefined
  const currentQuestionAnswered = gameStarted && gameAnswers[gameProgress].size > 0

  function nextQuestion() {
    setGameProgress(gameProgress + 1)
  }
  function prevQuestion() {
    setGameProgress(gameProgress - 1)
  }
  function selectAnswer(answers: number[]) {
    const currentQuestionAnswers = gameAnswers[gameProgress] ?? new Set()
    answers.forEach((a) => currentQuestionAnswers.add(a))
    setGameAnswers([...gameAnswers, currentQuestionAnswers])
  }

  function startGame() {}

  return (
    <>
      {currentQuestion && (
        <QuestionComponent question={currentQuestion} onSubmitAnswers={selectAnswer} />
      )}
    </>
  )
}
