import { describe, expect, it } from 'vitest'
import { AUTH_MESSAGES as MSG } from './messages'
import { passwordStrength, validateEmail, validateLogin, validateRegister } from './validation'

describe('validateEmail', () => {
  it('pide el correo si está vacío', () => {
    expect(validateEmail('  ')).toBe(MSG.emailRequired)
  })

  it('rechaza formatos inválidos', () => {
    expect(validateEmail('lucia@')).toBe(MSG.emailInvalid)
    expect(validateEmail('lucia mail.com')).toBe(MSG.emailInvalid)
  })

  it('acepta un correo válido con espacios alrededor', () => {
    expect(validateEmail(' lucia@mail.com ')).toBeUndefined()
  })
})

describe('passwordStrength', () => {
  it.each([
    ['', 0],
    ['abc', 1],
    ['abcdefgh', 2],
    ['abcdefgh1A', 3],
    ['abcdefghijkl', 3],
  ] as const)('"%s" tiene fuerza %i', (password, expected) => {
    expect(passwordStrength(password)).toBe(expected)
  })
})

describe('validateLogin', () => {
  it('marca los campos vacíos', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({
      email: MSG.emailRequired,
      password: MSG.passwordRequired,
    })
  })
})

describe('validateRegister', () => {
  const valid = {
    nombre: 'Lucía Pérez',
    email: 'lucia@mail.com',
    password: 'verde2026bici',
    password2: 'verde2026bici',
    terms: true,
  }

  it('no devuelve errores con datos válidos', () => {
    expect(Object.values(validateRegister(valid)).filter(Boolean)).toEqual([])
  })

  it('detecta contraseña corta, distinta y términos sin aceptar', () => {
    const errors = validateRegister({ ...valid, password: 'abc', password2: 'abcd', terms: false })
    expect(errors.password).toBe(MSG.passwordShort)
    expect(errors.password2).toBe(MSG.passwordMismatch)
    expect(errors.terms).toBe(MSG.termsRequired)
  })
})
