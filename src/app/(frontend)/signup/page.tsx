'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { signupAction } from '@/app/auth-actions'
import { signupSchema } from '@/lib/validation'

export default function SignupPage() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [general, setGeneral] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const parsed = signupSchema.safeParse({
      username: fd.get('username'),
      email: fd.get('email'),
      password: fd.get('password'),
      confirmPassword: fd.get('confirmPassword'),
      acceptTerms: fd.get('acceptTerms') === 'on',
    })
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
    const res = await signupAction(fd)
    setPending(false)
    if (!res.ok) {
      setFieldErrors(res.fieldErrors ?? {})
      setGeneral(res.error ?? 'Sign up failed.')
    }
  }

  return (
    <AuthLayout
      title="Join GQE"
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-accent hover:underline">
            Log In
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label className="label-dark" htmlFor="username">
            Username
          </label>
          <input id="username" name="username" placeholder="Username" className="input-dark" />
          {fieldErrors.username && <p className="field-error">{fieldErrors.username}</p>}
        </div>
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
        <div>
          <label className="label-dark" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            className="input-dark"
          />
          {fieldErrors.confirmPassword && <p className="field-error">{fieldErrors.confirmPassword}</p>}
        </div>
        <label className="flex items-start gap-2 text-sm text-white/70">
          <input type="checkbox" name="acceptTerms" className="mt-0.5 accent-[#e91e63]" />
          <span>
            I agree to the{' '}
            <Link href="/terms" className="underline hover:text-white">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-white">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {fieldErrors.acceptTerms && <p className="field-error">{fieldErrors.acceptTerms}</p>}
        {general && <p className="field-error">{general}</p>}
        <button type="submit" disabled={pending} className="btn-brand w-full">
          {pending ? 'Creating account…' : 'Sign Up'}
        </button>
      </form>
    </AuthLayout>
  )
}
