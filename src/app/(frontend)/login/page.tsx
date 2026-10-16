'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { loginAction } from '@/app/auth-actions'
import { loginSchema } from '@/lib/validation'

export default function LoginPage() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [general, setGeneral] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const parsed = loginSchema.safeParse({ email: fd.get('email'), password: fd.get('password') })
    if (!parsed.success) {
      const errs: Record<string, string> = {}
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message
      setFieldErrors(errs)
      setGeneral('')
      return
    }
    setPending(true)
    setGeneral('')
    setFieldErrors({})
    const res = await loginAction(fd)
    setPending(false)
    if (!res.ok) {
      setFieldErrors(res.fieldErrors ?? {})
      setGeneral(res.error ?? 'Login failed.')
    }
    // on success loginAction redirects
  }

  return (
    <AuthLayout
      title="Log In to"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-bold text-accent hover:underline">
            Sign Up
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label className="label-dark" htmlFor="email">
            Email Address
          </label>
          <input id="email" name="email" type="email" placeholder="Email Address" className="input-dark" />
          {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
        </div>
        <div>
          <label className="label-dark" htmlFor="password">
            Password
          </label>
          <input id="password" name="password" type="password" placeholder="Password" className="input-dark" />
          {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
        </div>
        {general && <p className="field-error">{general}</p>}
        <button type="submit" disabled={pending} className="btn-brand w-full">
          {pending ? 'Logging in…' : 'Login'}
        </button>
        <div className="text-center">
          <Link href="/forgot-password" className="text-sm text-white/60 hover:text-white">
            Forgot Password?
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
