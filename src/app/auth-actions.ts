'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayloadLocal } from '@/lib/payload'
import { ensureSupabaseAuthUser } from '@/lib/supabase-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { loginSchema, signupSchema, forgotPasswordSchema } from '@/lib/validation'

export type AuthResult = { ok: boolean; error?: string; fieldErrors?: Record<string, string> }

const TOKEN_COOKIE = 'payload-token'

export async function loginAction(formData: FormData): Promise<AuthResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) fieldErrors[String(issue.path[0])] = issue.message
    }
    return { ok: false, fieldErrors }
  }

  const payload = await getPayloadLocal()
  try {
    const { token } = await payload.login({
      collection: 'users',
      data: { email: parsed.data.email, password: parsed.data.password },
    })
    if (!token) return { ok: false, error: 'Invalid email or password.' }
    const cookieStore = await cookies()
    cookieStore.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    })
  } catch {
    return { ok: false, error: 'Invalid email or password.' }
  }

  redirect('/')
}

export async function signupAction(formData: FormData): Promise<AuthResult> {
  const parsed = signupSchema.safeParse({
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    acceptTerms: formData.get('acceptTerms') === 'on',
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) fieldErrors[String(issue.path[0])] = issue.message
    }
    return { ok: false, fieldErrors }
  }

  const payload = await getPayloadLocal()
  let createdPayloadId: number | string | null = null
  let createdAuthId: string | null = null
  try {
    // 1) Supabase Auth user — created first so the two stores stay in sync.
    const auth = await ensureSupabaseAuthUser({
      email: parsed.data.email,
      password: parsed.data.password,
      username: parsed.data.username,
    })
    if (!auth.ok) {
      return { ok: false, error: `Could not register with Supabase Auth: ${auth.error}` }
    }
    createdAuthId = auth.id

    // 2) Payload user, linked by the Supabase Auth id.
    const created = await payload.create({
      collection: 'users',
      data: {
        username: parsed.data.username,
        email: parsed.data.email,
        password: parsed.data.password,
        supabaseUserId: auth.id,
      },
    })
    createdPayloadId = created.id

    // Auto-login after signup.
    const { token } = await payload.login({
      collection: 'users',
      data: { email: parsed.data.email, password: parsed.data.password },
    })
    if (!token) return { ok: false, error: 'Account created — please log in.' }
    const cookieStore = await cookies()
    cookieStore.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    })
  } catch (e) {
    // Keep the two stores consistent: undo whatever we managed to create.
    if (createdPayloadId) {
      try {
        await payload.delete({ collection: 'users', id: createdPayloadId })
      } catch {
        /* ignore */
      }
    }
    if (createdAuthId) {
      try {
        await supabaseAdmin().auth.admin.deleteUser(createdAuthId)
      } catch {
        /* ignore */
      }
    }
    const message = (e as Error)?.message ?? ''
    if (/duplicate|unique/i.test(message)) {
      return { ok: false, error: 'An account with that username or email already exists.' }
    }
    return { ok: false, error: 'Could not create account. Please try again.' }
  }

  redirect('/')
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(TOKEN_COOKIE)
  redirect('/')
}

// Non-enumerating: always returns success to avoid revealing registered emails.
export async function forgotPasswordAction(formData: FormData): Promise<AuthResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) {
    return { ok: false, fieldErrors: { email: parsed.error.issues[0]?.message ?? 'Enter a valid email.' } }
  }

  const payload = await getPayloadLocal()
  try {
    await payload.forgotPassword({
      collection: 'users',
      data: { email: parsed.data.email },
    })
  } catch {
    /* swallow — do not reveal whether the email exists */
  }

  return { ok: true }
}
