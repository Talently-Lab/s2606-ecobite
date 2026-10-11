import type { FormErrors } from '@/shared/hooks/useForm'
import { AUTH_MESSAGES as MSG, MIN_PASSWORD } from './messages'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type PasswordStrength = 0 | 1 | 2 | 3

export interface LoginValues extends Record<string, unknown> {
  email: string
  password: string
}

export interface RegisterValues extends Record<string, unknown> {
  nombre: string
  email: string
  password: string
  password2: string
  terms: boolean
}

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return MSG.emailRequired
  if (!EMAIL_RE.test(email.trim())) return MSG.emailInvalid
  return undefined
}

/** 0 = vacía, 1 = débil, 2 = aceptable, 3 = fuerte. */
export function passwordStrength(password: string): PasswordStrength {
  if (!password) return 0
  if (password.length < MIN_PASSWORD) return 1
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length
  return password.length >= 12 || variety >= 3 ? 3 : 2
}

export function validateLogin(values: LoginValues): FormErrors<LoginValues> {
  return {
    email: validateEmail(values.email),
    password: values.password ? undefined : MSG.passwordRequired,
  }
}

export function validateRegister(values: RegisterValues): FormErrors<RegisterValues> {
  return {
    nombre: values.nombre.trim() ? undefined : MSG.nameRequired,
    email: validateEmail(values.email),
    password: values.password.length >= MIN_PASSWORD ? undefined : MSG.passwordShort,
    password2: values.password2 === values.password ? undefined : MSG.passwordMismatch,
    terms: values.terms ? undefined : MSG.termsRequired,
  }
}
