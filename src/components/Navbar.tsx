'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { FiSearch, FiPlus, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi'
import { Logo } from './Logo'
import { logoutAction } from '@/app/auth-actions'
import { cn } from '@/lib/utils'

type NavUser = { username: string; role: string }

export function Navbar({ user }: { user: NavUser | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const query = q.trim()
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : '/search')
    setOpen(false)
  }

  const itemCls =
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/10'
  const activeCls = 'bg-white/15'

  return (
    <header className="gradient-hero sticky top-0 z-50 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="md:hidden rounded-lg bg-black/25 p-2 text-white"
        >
          {open ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>

        <Logo />

        <form onSubmit={onSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Find your next anime challenge…"
              className="w-full rounded-full bg-black/40 border border-white/20 px-4 py-2 pr-10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Search quizzes"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-accent text-ink p-1.5"
            >
              <FiSearch size={16} />
            </button>
          </div>
        </form>

        <nav className="ml-auto hidden md:flex items-center gap-2">
          <Link href="/search" className={cn('btn-dark', pathname === '/search' && '!bg-white/20')}>
            Explore
          </Link>

          {user ? (
            <>
              <Link
                href="/create"
                className={cn('btn-dark', pathname === '/create' && '!bg-white/20')}
              >
                <FiPlus />
                <span className="hidden sm:inline">Create</span>
              </Link>
              <Link
                href="/profile"
                className={cn('btn-dark', pathname === '/profile' && '!bg-white/20')}
              >
                <FiUser />
                <span className="hidden sm:inline max-w-[8rem] truncate">{user.username}</span>
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="btn-dark" aria-label="Log out" title="Log out">
                  <FiLogOut />
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-dark">
                Log In
              </Link>
              <Link href="/signup" className="btn-brand !py-2">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* mobile search */}
      <form onSubmit={onSubmit} className="md:hidden px-4 pb-3">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find your next anime challenge…"
            className="w-full rounded-full bg-black/40 border border-white/20 px-4 py-2 pr-10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Search quizzes"
          />
          <button type="submit" aria-label="Search" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-accent text-ink p-1.5">
            <FiSearch size={16} />
          </button>
        </div>
      </form>

      {/* mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-white/15 bg-black/25 px-3 pb-3 pt-2 space-y-1">
          <Link href="/search" className={cn(itemCls, pathname === '/search' && activeCls)}>
            <FiSearch /> Explore quizzes
          </Link>
          {user ? (
            <>
              <Link href="/create" className={cn(itemCls, pathname === '/create' && activeCls)}>
                <FiPlus /> Create a quiz
              </Link>
              <Link href="/profile" className={cn(itemCls, pathname === '/profile' && activeCls)}>
                <FiUser /> <span className="truncate">{user.username}</span>
              </Link>
              <form action={logoutAction}>
                <button type="submit" className={cn(itemCls, 'w-full text-left')}>
                  <FiLogOut /> Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={itemCls}>
                <FiUser /> Log in
              </Link>
              <Link href="/signup" className={cn(itemCls, '!bg-brand !text-white')}>
                <FiPlus /> Sign up
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  )
}
