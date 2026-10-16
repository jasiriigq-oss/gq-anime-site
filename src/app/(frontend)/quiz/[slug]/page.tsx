import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FiUser, FiUsers, FiZap, FiThumbsUp } from 'react-icons/fi'
import { getQuizBySlug, getPopularQuizzes, getTopPlayers } from '@/lib/queries'
import { mediaUrl, richTextToPlain } from '@/lib/utils'
import type { Media } from '@/payload-types'
import { DifficultyStars, QuizCard } from '@/components/QuizCard'
import { HostGameButton } from '@/components/HostGameButton'

export const dynamic = 'force-dynamic'

export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const quiz = await getQuizBySlug(slug)
  if (!quiz) notFound()

  const [related, topPlayers] = await Promise.all([
    getPopularQuizzes(6).then((qs) => qs.filter((q) => q.id !== quiz.id).slice(0, 4)),
    getTopPlayers(5),
  ])

  const cover = mediaUrl(quiz.cover as Media | number | null)
  const description = richTextToPlain(quiz.description)
  const questionCount = quiz.questions?.length ?? 0
  const expectedTime = quiz.expectedTimeMinutes ?? Math.ceil(questionCount * 0.6)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="card-dark overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="relative h-64 md:h-auto">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt={quiz.name} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 gradient-hero" />
              )}
            </div>
            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-accent">
                {quiz.series || 'Anime Quiz'}
              </p>
              <h1 className="mt-1 text-2xl font-black text-white">{quiz.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/75">
                <span className="inline-flex items-center gap-1.5">
                  <DifficultyStars value={quiz.difficulty ?? 3} />
                </span>
                <span>{questionCount} Questions</span>
                <span>~{expectedTime} mins</span>
              </div>
              {description && <p className="mt-4 text-white/70">{description}</p>}
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link href={`/play/solo/${quiz.slug}`} className="btn-brand">
            <FiUser /> Solo Play
          </Link>
          <HostGameButton quizId={quiz.id} />
          <Link href="/join" className="btn-dark">
            <FiUsers /> Join Multi-Player
          </Link>
        </div>

        {/* leaderboard */}
        <div className="card-dark mt-8 p-6">
          <h2 className="text-lg font-black text-white">Quiz Leaderboard</h2>
          {topPlayers.length > 0 ? (
            <ol className="mt-4 divide-y divide-white/5">
              {topPlayers.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <span className="w-6 text-center font-bold text-accent">{i + 1}</span>
                  <span className="flex-1 font-semibold text-white">{p.username}</span>
                  <span className="text-sm text-white/60">{(p.points ?? 0).toLocaleString()} pts</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-white/50">No scores yet — be the first to play!</p>
          )}
        </div>
      </div>

      {/* related */}
      <aside>
        <h2 className="mb-4 text-lg font-black text-white">Related Quizzes</h2>
        <div className="space-y-4">
          {related.map((q) => (
            <QuizCard key={q.id} quiz={q} />
          ))}
        </div>
      </aside>
    </div>
  )
}
