const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const MIN_PASSWORD = 8

export function validateEmail(email) {
  if (!email.trim()) return 'Ingresá tu correo.'
  if (!EMAIL_RE.test(email.trim())) return 'Revisá el formato del correo.'
  return null
}

// 0 = vacía, 1 = débil, 2 = aceptable, 3 = fuerte
export function passwordStrength(password) {
  if (!password) return 0
  if (password.length < MIN_PASSWORD) return 1
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length
  return password.length >= 12 || variety >= 3 ? 3 : 2
}
