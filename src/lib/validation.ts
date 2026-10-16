import { z } from 'zod'

// Centralised validation for every form in the app. Zod v4.

const username = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters.')
  .max(24, 'Username must be 24 characters or fewer.')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers and underscores.')

const email = z
  .string()
  .trim()
  .email('Enter a valid email address.')

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password is too long.')

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required.'),
})

export const signupSchema = z
  .object({
    username,
    email,
    password,
    confirmPassword: z.string(),
    acceptTerms: z
      .boolean()
      .refine((v) => v === true, 'You must accept the Terms and Privacy Policy.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email,
})

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export const joinGameSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, 'Game code must be 6 characters.')
    .transform((s) => s.toUpperCase()),
  name: z
    .string()
    .trim()
    .min(1, 'Nickname is required.')
    .max(20, 'Nickname must be 20 characters or fewer.'),
  avatar: z.string().trim().min(1, 'Choose an avatar.').max(500),
})

export const chatMessageSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty.').max(280, 'Message is too long.'),
})

export const announcementSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Announcement cannot be empty.')
    .max(280, 'Announcement is too long.'),
})

// ---- Quiz creator ----
const answerOptionSchema = z.object({
  text: z.string().trim().min(1, 'Answer text is required.'),
  isCorrect: z.boolean(),
})

const questionSchema = z
  .object({
    questionText: z.string().trim().min(1, 'Question text is required.'),
    questionType: z.enum(['text', 'image', 'video', 'audio']).default('text'),
    timeLimitSeconds: z.coerce.number().int().min(5, 'Minimum 5 seconds.').max(300, 'Max 300 seconds.'),
    points: z.coerce.number().int().min(0, 'Points cannot be negative.').max(10000),
    answers: z.array(answerOptionSchema).min(2, 'At least 2 answers required.').max(6),
  })
  .refine((q) => q.answers.filter((a) => a.isCorrect).length === 1, {
    message: 'Exactly one answer must be marked correct.',
    path: ['answers'],
  })

export const quizCreatorSchema = z.object({
  name: z.string().trim().min(1, 'Quiz title is required.').max(120),
  series: z.string().trim().max(80).optional().default(''),
  category: z.enum(['lore', 'personality', 'trivia', 'quick-challenge']).default('trivia'),
  difficulty: z.coerce.number().int().min(1).max(5).default(3),
  expectedTimeMinutes: z.coerce.number().int().min(1).max(180).default(10),
  description: z.string().trim().max(2000).optional().default(''),
  multiplayerEnabled: z.boolean().default(true),
  soloPlayEnabled: z.boolean().default(true),
  challengeMode: z.boolean().default(false),
  questions: z.array(questionSchema).min(1, 'Add at least one question.'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type JoinGameInput = z.infer<typeof joinGameSchema>
export type QuizCreatorInput = z.infer<typeof quizCreatorSchema>
