'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getPayloadLocal, getCurrentUser } from '@/lib/payload'
import { plainTextToLexical } from '@/lib/utils'
import { quizCreatorSchema } from '@/lib/validation'

export type QuizActionResult = {
  ok: boolean
  error?: string
  fieldErrors?: Record<string, string>
  quizId?: number
  quizSlug?: string
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

async function ensureUniqueSlug(payload: Awaited<ReturnType<typeof getPayloadLocal>>, base: string, excludeId?: number) {
  let slug = base
  let i = 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { totalDocs } = await payload.find({
      collection: 'quizzes',
      where: { and: [{ slug: { equals: slug } }, ...(excludeId ? [{ id: { not_equals: excludeId } }] : [])] },
      limit: 1,
    })
    if (totalDocs === 0) return slug
    slug = `${base}-${++i}`
  }
}

export async function saveQuizAction(formData: FormData): Promise<QuizActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'You must be logged in to create a quiz.' }

  let questions: unknown
  try {
    questions = JSON.parse((formData.get('questions') as string) || '[]')
  } catch {
    return { ok: false, error: 'Invalid question data.' }
  }

  const parsed = quizCreatorSchema.safeParse({
    name: formData.get('name'),
    series: formData.get('series') || '',
    category: formData.get('category'),
    difficulty: formData.get('difficulty'),
    expectedTimeMinutes: formData.get('expectedTimeMinutes'),
    description: formData.get('description') || '',
    multiplayerEnabled: formData.get('multiplayerEnabled') === 'on',
    soloPlayEnabled: formData.get('soloPlayEnabled') === 'on',
    challengeMode: formData.get('challengeMode') === 'on',
    questions,
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'name')
      if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { ok: false, fieldErrors }
  }

  const data = parsed.data
  const payload = await getPayloadLocal()
  const publish = formData.get('publish') === 'true'
  const quizIdRaw = formData.get('quizId')
  const quizId = quizIdRaw ? Number(quizIdRaw) : undefined

  const quizData = {
    name: data.name,
    series: data.series,
    category: data.category,
    difficulty: data.difficulty,
    expectedTimeMinutes: data.expectedTimeMinutes,
    description: plainTextToLexical(data.description),
    settings: {
      multiplayerEnabled: data.multiplayerEnabled,
      soloPlayEnabled: data.soloPlayEnabled,
      challengeMode: data.challengeMode,
    },
    questions: data.questions.map((q) => ({
      questionText: q.questionText,
      questionType: q.questionType,
      timeLimitSeconds: q.timeLimitSeconds,
      points: q.points,
      answers: q.answers.map((a) => ({
        text: a.text,
        isCorrect: a.isCorrect,
      })),
    })),
    published: publish,
    author: user.id,
  }

  try {
    if (quizId) {
      const existing = await payload.findByID({ collection: 'quizzes', id: quizId })
      await payload.update({ collection: 'quizzes', id: quizId, data: { ...quizData, slug: existing.slug } })
      revalidatePath(`/quiz/${existing.slug}`)
      return { ok: true, quizId, quizSlug: existing.slug }
    }

    const slug = await ensureUniqueSlug(payload, slugify(data.name) || `quiz-${Date.now()}`)
    const created = await payload.create({
      collection: 'quizzes',
      data: { ...quizData, slug },
    })
    revalidatePath('/search')
    return { ok: true, quizId: created.id, quizSlug: slug }
  } catch (e) {
    return { ok: false, error: (e as Error)?.message ?? 'Failed to save quiz.' }
  }
}

export async function likeQuizAction(quizId: number): Promise<{ ok: boolean; error?: string }> {
  const payload = await getPayloadLocal()
  try {
    const quiz = await payload.findByID({ collection: 'quizzes', id: quizId })
    await payload.update({ collection: 'quizzes', id: quizId, data: { likes: (quiz.likes ?? 0) + 1 } })
    revalidatePath(`/quiz/${quiz.slug}`)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error)?.message }
  }
}

export async function deleteQuizAction(quizId: number): Promise<void> {
  const user = await getCurrentUser()
  if (!user) return
  const payload = await getPayloadLocal()
  const quiz = await payload.findByID({ collection: 'quizzes', id: quizId })
  if (typeof quiz.author === 'object' && quiz.author?.id === user.id) {
    await payload.delete({ collection: 'quizzes', id: quizId })
  }
  redirect('/search')
}
