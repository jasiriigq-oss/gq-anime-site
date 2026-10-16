import Link from 'next/link'
import { FiThumbsUp, FiSearch } from 'react-icons/fi'
import type { Media, Quiz } from '@/payload-types'
import { mediaUrl } from '@/lib/utils'

export function DifficultyStars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Difficulty ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= value ? 'text-gold' : 'text-white/25'}>
          ★
        </span>
      ))}
    </span>
  )
}

export function QuizCard({ quiz }: { quiz: Quiz }) {
  const cover = mediaUrl(quiz.cover as Media | number | null)
  const questionCount = quiz.questions?.length ?? 0
  const badge = quiz.category === 'quick-challenge' ? 'QUICK CHALLENGE' : 'QUIZ'

  return (
    <Link
      href={`/quiz/${quiz.slug}`}
      className="group relative block aspect-[4/5] w-48 shrink-0 overflow-hidden rounded-2xl bg-ink-card"
    >
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt={quiz.name} className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0 gradient-hero" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

      <div className="absolute left-2 top-2">
        <span className="rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
          {badge}
        </span>
      </div>

      <div className="absolute right-2 top-2 rounded-full bg-white/15 p-1.5 text-white">
        <FiSearch size={14} />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-3">
        <h3 className="text-sm font-bold leading-tight text-white line-clamp-2">{quiz.name}</h3>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-white/85">
          <DifficultyStars value={quiz.difficulty ?? 3} />
          <span className="inline-flex items-center gap-1">
            <FiThumbsUp size={11} />
            {quiz.likes ?? 0}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] text-white/70">
          {questionCount} Question{questionCount === 1 ? '' : 's'}
        </p>
      </div>
    </Link>
  )
}
