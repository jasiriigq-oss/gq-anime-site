'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { FiSearch, FiSliders } from 'react-icons/fi'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { value: '', label: 'All Types' },
  { value: 'lore', label: 'Lore' },
  { value: 'personality', label: 'Personality' },
  { value: 'trivia', label: 'Trivia' },
  { value: 'quick-challenge', label: 'Quick Challenge' },
]

export function SearchFilters({
  initial,
  series,
}: {
  initial: { q: string; series: string; category: string; difficulty: string }
  series: string[]
}) {
  const router = useRouter()
  const [q, setQ] = useState(initial.q)
  const [seriesVal, setSeriesVal] = useState(initial.series)
  const [category, setCategory] = useState(initial.category)
  const [difficulty, setDifficulty] = useState(initial.difficulty)
  const [open, setOpen] = useState(false)

  const activeCount = [seriesVal, category, difficulty].filter(Boolean).length

  function apply(e: FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (seriesVal) params.set('series', seriesVal)
    if (category) params.set('category', category)
    if (difficulty) params.set('difficulty', difficulty)
    router.push(`/search?${params.toString()}`)
  }

  function clear() {
    setQ('')
    setSeriesVal('')
    setCategory('')
    setDifficulty('')
    router.push('/search')
  }

  return (
    <form onSubmit={apply} className="gradient-hero rounded-2xl p-4">
      <div className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find your next anime challenge..."
          className="w-full rounded-full bg-black/45 border border-white/20 px-5 py-3 pr-12 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Search"
        />
        <button type="submit" aria-label="Search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-accent text-ink p-2">
          <FiSearch size={18} />
        </button>
      </div>

      {/* mobile filter toggle — the filter menu collapses on small screens */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-black/30 py-2 text-sm font-semibold text-white md:hidden"
      >
        <FiSliders /> Filters
        {activeCount > 0 && (
          <span className="rounded-full bg-brand px-2 py-0.5 text-xs">{activeCount}</span>
        )}
        <span className="text-xs">{open ? '▲' : '▼'}</span>
      </button>

      <div
        className={cn(
          'mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4',
          !open && 'hidden md:grid',
        )}
      >
        <div>
          <label className="mb-1 block text-xs font-semibold text-white/70">Anime Series</label>
          <select value={seriesVal} onChange={(e) => setSeriesVal(e.target.value)} className="input-dark !py-2 !bg-black/45">
            <option value="">All Series</option>
            {series.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-white/70">Quiz Type</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-dark !py-2 !bg-black/45">
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-white/70">Difficulty</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-dark !py-2 !bg-black/45">
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={String(n)}>
                {'★'.repeat(n)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="btn-brand !py-2 w-full">
            Filter
          </button>
          <button type="button" onClick={clear} className="btn-dark !py-2">
            Clear
          </button>
        </div>
      </div>
    </form>
  )
}
