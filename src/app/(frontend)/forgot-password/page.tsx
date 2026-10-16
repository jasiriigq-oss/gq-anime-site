'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { forgotPasswordAction } from '@/app/auth-actions'
import { forgotPasswordSchema } from '@/lib/validation'

export default function ForgotPasswordPage() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const parsed = forgotPasswordSchema.safeParse({ email: fd.get('email') })
    if (!parsed.success) {
      setFieldErrors({ email: parsed.error.issues[0]?.message ?? 'Enter a valid email.' })
      return
    }
    setPending(true)
    setFieldErrors({})
    await forgotPasswordAction(fd)
    setPending(false)
    setSent(true)
  }

  return (
    <AuthLayout
      title="Reset Your Password"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-bold text-accent hover:underline">
            Sign Up
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="space-y-4 text-center">
          <p className="text-white/85">
            A reset link will be sent to this email address if it is registered with GQE anime.
            Please check your inbox and spam folder.
          </p>
          <Link href="/login" className="text-sm font-semibold text-accent hover:underline">
            Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label className="label-dark" htmlFor="email">
              Enter your registered Email Address
            </label>
            <input id="email" name="email" type="email" placeholder="Email Address" className="input-dark" />
            {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
          </div>
          <button type="submit" disabled={pending} className="btn-brand w-full">
            {pending ? 'Sending…' : 'Send Reset Link'}
          </button>
          <div className="text-center">
            <Link href="/login" className="text-sm text-white/60 hover:text-white">
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
