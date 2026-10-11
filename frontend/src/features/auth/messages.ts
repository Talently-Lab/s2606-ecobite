export const MIN_PASSWORD = 8

export const AUTH_MESSAGES = {
  nameRequired: 'Ingresá tu nombre.',
  emailRequired: 'Ingresá tu correo.',
  emailInvalid: 'Revisá el formato del correo.',
  emailTaken: 'Ya existe una cuenta con este correo.',
  passwordRequired: 'Ingresá tu contraseña.',
  passwordShort: `Muy corta: usá al menos ${MIN_PASSWORD} caracteres.`,
  passwordMismatch: 'Las contraseñas no coinciden.',
  termsRequired: 'Necesitás aceptar los términos para crear tu cuenta.',
  invalidCredentials: 'El correo o la contraseña no son correctos. Revisalos e intentá de nuevo.',
  registerInvalid: 'Revisá los campos marcados para crear tu cuenta.',
  sessionExpired: 'Sesión vencida.',
} as const

/** Ayuda bajo la contraseña según la fuerza (0 a 3). */
export const STRENGTH_HINTS = [
  `Mínimo ${MIN_PASSWORD} caracteres.`,
  AUTH_MESSAGES.passwordShort,
  'Aceptable. Sumá mayúsculas, números o símbolos para hacerla más segura.',
  `Buena contraseña. Mínimo ${MIN_PASSWORD} caracteres.`,
] as const
