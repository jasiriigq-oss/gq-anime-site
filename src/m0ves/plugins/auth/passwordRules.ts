import z from 'zod'

export function validatePassword(
  password: string | undefined,
  confirmPassword: string | undefined,
) {
  if (!password || !confirmPassword) {
    return {
      message: 'Password is required',
      error: false,
    }
  }

  if (password !== confirmPassword) {
    return {
      message: 'Passwords do not match',
      error: true,
    }
  }

  const schema = z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')

  const result = schema.safeParse(password)

  if (!result.success) {
    return {
      message: result.error.issues.map((issue) => issue.message).join('\n'),
      error: true,
    }
  }

  return {
    message: 'Good Password',
    error: false,
  }
}
