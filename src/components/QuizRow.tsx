import Link from 'next/link'
import type { Quiz } from '@/payload-types'
import { QuizCard } from './QuizCard'

export function QuizRow({
  title,
  quizzes,
  seeMoreHref,
}: {
  title: string
  quizzes: Quiz[]
  seeMoreHref?: string
}) {
  if (quizzes.length === 0) return null
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-black text-white">{title}</h2>
        {seeMoreHref && (
          <Link href={seeMoreHref} className="text-sm font-semibold text-accent hover:underline">
            See More
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} />
        ))}
      </div>
    </section>
  )
}
