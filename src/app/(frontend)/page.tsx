import Link from 'next/link'
import { FiPlay, FiPlus } from 'react-icons/fi'
import { getPublishedQuizzes, getPopularQuizzes } from '@/lib/queries'
import { QuizRow } from '@/components/QuizRow'
import { QuizCard } from '@/components/QuizCard'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [recent, popular] = await Promise.all([getPublishedQuizzes(10), getPopularQuizzes(10)])
  const featured = popular.slice(0, 4)

  return (
    <>
      {/* Hero */}
      <section className="gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-14 grid gap-10 md:grid-cols-2 items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-white/70">GQE anime</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-black leading-tight text-white">
              Ultimate Anime <span className="text-accent">Quizzes</span>
            </h1>
            <p className="mt-4 max-w-md text-white/85 text-lg">
              Test your knowledge on every series, character, and genre. Play solo or host a
              live multiplayer game with your friends.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/search" className="btn-brand">
                <FiPlay /> Browse Quizzes
              </Link>
              <Link href="/create" className="btn-dark !bg-black/25">
                <FiPlus /> Create a Quiz
              </Link>
            </div>
          </div>
          {featured.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {featured.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          )}
        </div>
      </section>

      <QuizRow title="Recently Added Quizzes" quizzes={recent} seeMoreHref="/search" />
      <QuizRow title="Popular Quizzes by Series" quizzes={popular} seeMoreHref="/search" />
    </>
  )
}
