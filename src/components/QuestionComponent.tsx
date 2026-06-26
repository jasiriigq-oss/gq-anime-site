'use client'

import { Question } from '@/payload-types'

export interface QuestionProps {
  question: Question
  onSubmitAnswers: (answers: number[]) => void
}

export default function QuestionComponent({ question, onSubmitAnswers }: QuestionProps) {
  return <></>
}
