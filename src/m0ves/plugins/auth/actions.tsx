'use server'

import { User } from '@/payload-types'
import { StandardSiteResponse } from '../../lib/StandardSiteResponse'
import { LoginWithEmail, SignUpWithEmail } from './operations'

export const LoginAction = async (formData: FormData): Promise<StandardSiteResponse<User>> => {
  const email = formData.get('email')
  const password = formData.get('password')
  const result = await LoginWithEmail({ email: email as string, password: password as string })
  return result
}

export const RegisterAction = async (formData: FormData): Promise<StandardSiteResponse<User>> => {
  const email = formData.get('email')
  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')

  const result = SignUpWithEmail({
    email: email as string,
    password: password as string,
    confirmPassword: confirmPassword as string,
  })

  return result
}
