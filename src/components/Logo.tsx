import Link from 'next/link'
import { cn } from '@/lib/utils'

export function FoxMark({ className }: { className?: string }) {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
    >
      <path d="M6 9 L2 3 L11 6 Z" fill="#ffffff" />
      <path d="M26 9 L30 3 L21 6 Z" fill="#ffffff" />
      <path
        d="M4 12 C4 7 8 4 16 4 C24 4 28 7 28 12 L28 19 C28 24 24 28 16 28 C8 28 4 24 4 19 Z"
        fill="#ffffff"
      />
      <path d="M4 12 C4 7 8 4 16 4 C24 4 28 7 28 12 L28 14 C22 11.5 10 11.5 4 14 Z" fill="#9c27b0" opacity="0.28" />
      <circle cx="11" cy="16" r="1.9" fill="#00bcd4" />
      <circle cx="21" cy="16" r="1.9" fill="#00bcd4" />
      <path d="M15.5 20.5 C17 20.5 18 21.8 18 23 L14 23 C14 21.8 15 20.5 15.5 20.5 Z" fill="#0f172a" opacity="0.85" />
    </svg>
  )
}

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2 select-none" aria-label="GQE anime home">
      <FoxMark />
      <span className={cn('text-xl font-black tracking-tight leading-none', dark ? 'text-ink' : 'text-white')}>
        GQE
        <span className="text-accent"> anime</span>
      </span>
      <span className="sr-only">GQE anime</span>
    </Link>
  )
}
