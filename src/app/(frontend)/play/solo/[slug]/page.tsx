import { notFound } from 'next/navigation'
import { getQuizBySlug } from '@/lib/queries'
import { mediaUrl } from '@/lib/utils'
import type { Media } from '@/payload-types'
import { SoloGame } from '@/components/game/SoloGame'
import { getGameSounds } from '@/lib/game/sounds'

export const dynamic = 'force-dynamic'

export default async function SoloPlayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const quiz = await getQuizBySlug(slug)
  if (!quiz) notFound()

  const questions = (quiz.questions ?? []).map((q) => ({
    questionText: q.questionText,
    questionType: (q.questionType ?? 'text') as string,
    image: mediaUrl(q.image as Media | number | null),
    video: mediaUrl(q.video as Media | number | null),
    audio: mediaUrl(q.audio as Media | number | null),
    timeLimitSeconds: q.timeLimitSeconds ?? 15,
    points: q.points ?? 10,
    answers: (q.answers ?? []).map((a) => ({ text: a.text, isCorrect: a.isCorrect ?? false })),
  }))

  const sounds = await getGameSounds()
  return <SoloGame title={quiz.name} questions={questions} sounds={sounds} />
}
