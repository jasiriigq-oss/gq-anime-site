import 'server-only'
import { getPayloadLocal } from './payload'
import type { Quiz, User } from '@/payload-types'
import type { Where } from 'payload'

export async function getPublishedQuizzes(limit = 24): Promise<Quiz[]> {
  const payload = await getPayloadLocal()
  const { docs } = await payload.find({
    collection: 'quizzes',
    where: { published: { equals: true } },
    limit,
    sort: '-createdAt',
    depth: 1,
  })
  return docs
}

export async function getPopularQuizzes(limit = 12): Promise<Quiz[]> {
  const payload = await getPayloadLocal()
  const { docs } = await payload.find({
    collection: 'quizzes',
    where: { published: { equals: true } },
    limit,
    sort: '-playCount',
    depth: 1,
  })
  return docs
}

export async function getQuizBySlug(slug: string): Promise<Quiz | null> {
  const payload = await getPayloadLocal()
  const { docs } = await payload.find({
    collection: 'quizzes',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  return docs[0] ?? null
}

export async function getQuizById(id: number): Promise<Quiz | null> {
  const payload = await getPayloadLocal()
  const quiz = await payload.findByID({ collection: 'quizzes', id, depth: 2 })
  return quiz
}

export type SearchFilters = {
  q?: string
  series?: string
  category?: string
  difficulty?: number
  limit?: number
}

export async function searchQuizzes(filters: SearchFilters): Promise<Quiz[]> {
  const payload = await getPayloadLocal()
  const and: Where[] = [{ published: { equals: true } }]
  if (filters.q) {
    const term = filters.q.trim()
    and.push({ or: [{ name: { contains: term } }, { series: { contains: term } }] })
  }
  if (filters.series) and.push({ series: { equals: filters.series } })
  if (filters.category) and.push({ category: { equals: filters.category } })
  if (filters.difficulty) and.push({ difficulty: { equals: filters.difficulty } })

  const { docs } = await payload.find({
    collection: 'quizzes',
    where: { and },
    limit: filters.limit ?? 40,
    sort: '-createdAt',
    depth: 1,
  })
  return docs
}

export async function getSeriesList(): Promise<string[]> {
  const payload = await getPayloadLocal()
  const { docs } = await payload.find({ collection: 'quizzes', limit: 500, depth: 0 })
  const set = new Set<string>()
  for (const q of docs) if (q.series) set.add(q.series)
  return [...set].sort()
}

export async function getUserQuizzes(userId: number): Promise<Quiz[]> {
  const payload = await getPayloadLocal()
  const { docs } = await payload.find({
    collection: 'quizzes',
    where: { author: { equals: userId } },
    limit: 100,
    sort: '-createdAt',
    depth: 1,
  })
  return docs
}

export async function getGlobalRank(userId: number): Promise<number | null> {
  const payload = await getPayloadLocal()
  const { docs } = await payload.find({
    collection: 'users',
    where: { points: { greater_than: 0 } },
    sort: '-points',
    limit: 5000,
    depth: 0,
  })
  const idx = docs.findIndex((u) => u.id === userId)
  return idx >= 0 ? idx + 1 : null
}

export async function getTopPlayers(limit = 10): Promise<User[]> {
  const payload = await getPayloadLocal()
  const { docs } = await payload.find({
    collection: 'users',
    sort: '-points',
    limit,
    depth: 0,
  })
  return docs
}
