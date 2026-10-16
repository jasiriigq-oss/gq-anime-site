import React from 'react'
import type { Metadata } from 'next'
import '@/app/globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { getCurrentUser } from '@/lib/payload'

export const metadata: Metadata = {
  title: {
    default: 'GQE anime — Ultimate Anime Quizzes',
    template: '%s — GQE anime',
  },
  description:
    'Ultimate Anime Quizzes. Test your knowledge on every series, character, and genre.',
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar
          user={user ? { username: user.username, role: user.role ?? 'user' } : null}
        />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
