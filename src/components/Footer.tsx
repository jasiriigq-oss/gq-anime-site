import Link from 'next/link'
import { FoxMark } from './Logo'

const FOOTER_LINKS = [
  { label: 'Terms', url: '/terms' },
  { label: 'Privacy', url: '/privacy' },
  { label: 'Submit a Quiz', url: '/create' },
]

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-soft mt-16">
      <div className="mx-auto max-w-7xl px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <FoxMark />
          <div>
            <p className="font-bold text-white">GQE anime</p>
            <p className="text-sm text-white/50">
              Ultimate Anime Quizzes. Test your knowledge on every series, character, and genre.
            </p>
          </div>
        </div>
        <nav className="flex items-center gap-6">
          {FOOTER_LINKS.map((l) => (
            <Link key={l.url} href={l.url} className="text-sm text-white/60 hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
