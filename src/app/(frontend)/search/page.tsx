import { SearchFilters } from '@/components/search/SearchFilters'
import { QuizCard } from '@/components/QuizCard'
import { searchQuizzes, getSeriesList } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const q = (params.q as string) ?? ''
  const series = (params.series as string) ?? ''
  const category = (params.category as string) ?? ''
  const difficultyRaw = params.difficulty ? Number(params.difficulty) : undefined
  const difficulty = difficultyRaw && !Number.isNaN(difficultyRaw) ? difficultyRaw : undefined

  const [results, seriesList] = await Promise.all([
    searchQuizzes({ q, series, category, difficulty }),
    getSeriesList(),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <SearchFilters
        initial={{ q, series, category, difficulty: difficulty ? String(difficulty) : '' }}
        series={seriesList}
      />

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-black text-white">
          {q ? `Results for “${q}”` : 'Popular Series Quizzes'}
        </h2>
        {results.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {results.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        ) : (
          <div className="card-dark p-10 text-center text-white/60">
            No quizzes found. Try a different search or{' '}
            <a href="/create" className="text-accent hover:underline">
              create your own
            </a>
            .
          </div>
        )}
      </div>
    </div>
  )
}
