import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/payload'
import { getUserQuizzes, getGlobalRank } from '@/lib/queries'
import { mediaUrl } from '@/lib/utils'
import type { Media } from '@/payload-types'
import { QuizCard } from '@/components/QuizCard'

export const dynamic = 'force-dynamic'

const BADGES = [
  { id: 'lore-master', label: 'Lore Master', icon: '📖' },
  { id: 'speed-runner', label: 'Speed Runner', icon: '⚡' },
  { id: 'trivia-titan', label: 'Trivia Titan', icon: '🏆' },
  { id: 'community-contributor', label: 'Community Contributor', icon: '🦊' },
]

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const [quizzes, rank] = await Promise.all([getUserQuizzes(user.id), getGlobalRank(user.id)])
  const avatar = mediaUrl(user.avatar as Media | number | null)

  const earnedBadges = BADGES.filter((b) => {
    if (b.id === 'community-contributor') return quizzes.length >= 1
    if (b.id === 'trivia-titan') return (user.points ?? 0) >= 1000
    if (b.id === 'speed-runner') return (user.points ?? 0) >= 500
    return (user.points ?? 0) >= 100
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* header */}
          <div className="card-dark flex items-center gap-4 p-6">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={user.username} className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-hero text-3xl font-black text-white">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black text-white">{user.username}</h1>
              <p className="text-sm text-white/50">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-white/50">Global Rank: #{rank ?? '—'}</p>
            </div>
          </div>

          {/* stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Lifetime Points', value: (user.points ?? 0).toLocaleString() },
              { label: 'Quizzes Created', value: quizzes.length },
              { label: 'Global Rank', value: `#${rank ?? '—'}` },
            ].map((s) => (
              <div key={s.label} className="card-dark p-4 text-center">
                <p className="text-2xl font-black text-accent">{s.value}</p>
                <p className="mt-1 text-xs text-white/50">{s.label}</p>
              </div>
            ))}
          </div>

          {/* badges */}
          <div className="card-dark p-6">
            <h2 className="mb-4 font-black text-white">Achievement Badges</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {BADGES.map((b) => {
                const earned = earnedBadges.some((e) => e.id === b.id)
                return (
                  <div
                    key={b.id}
                    className={`flex flex-col items-center gap-1 rounded-xl p-4 text-center ${
                      earned ? 'bg-white/5' : 'opacity-30'
                    }`}
                  >
                    <span className="text-2xl">{b.icon}</span>
                    <span className="text-xs font-bold text-white">{b.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* created quizzes */}
          <div>
            <h2 className="mb-4 font-black text-white">Created Quizzes</h2>
            {quizzes.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {quizzes.map((q) => (
                  <QuizCard key={q.id} quiz={q} />
                ))}
              </div>
            ) : (
              <div className="card-dark p-8 text-center text-white/50">
                You haven&apos;t created any quizzes yet.{' '}
                <Link href="/create" className="text-accent hover:underline">
                  Create your first quiz
                </Link>
                .
              </div>
            )}
          </div>
        </div>

        {/* right rail */}
        <aside className="space-y-4">
          <div className="card-dark p-5">
            <h3 className="font-black text-white">Quick Actions</h3>
            <div className="mt-3 space-y-2">
              <Link href="/create" className="btn-brand w-full">Create a Quiz</Link>
              <Link href="/join" className="btn-dark w-full">Join a Game</Link>
              <Link href="/search" className="btn-dark w-full">Browse Quizzes</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
