import { ApiError, hasApi, request } from './api'

/*
 * Contrato propuesto (pendiente de acordar con backend, docs/api):
 *   POST /auth/register { nombre, email, password } -> 201 { token, usuario }
 *                                                     409 { message, errors: { email } }
 *   POST /auth/login    { email, password }         -> 200 { token, usuario }
 *                                                     401 { message }
 *   GET  /auth/me                                   -> 200 { usuario }
 *   usuario = { id_usuario, nombre, email, rol }
 */

export function login({ email, password }) {
  if (!hasApi) return mock.login({ email, password })
  return request('/auth/login', { method: 'POST', body: { email, password } })
}

export function register({ nombre, email, password }) {
  if (!hasApi) return mock.register({ nombre, email, password })
  return request('/auth/register', { method: 'POST', body: { nombre, email, password } })
}

export function me() {
  if (!hasApi) return mock.me()
  return request('/auth/me')
}

export function logout() {
  if (!hasApi) mock.logout()
}

// Mock local mientras la API de auth no exista. Solo para desarrollo: no es seguro.
const USERS_KEY = 'ecobite.mock.usuarios'
const SESSION_KEY = 'ecobite.mock.sesion'

const mock = {
  read() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) ?? []
    } catch {
      return []
    }
  },
  write(users) {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
    } catch {
      // Ignorado en modo privado.
    }
  },
  wait() {
    return new Promise((resolve) => setTimeout(resolve, 400))
  },
  session(user) {
    const usuario = { id_usuario: user.id_usuario, nombre: user.nombre, email: user.email, rol: user.rol }
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(usuario))
    } catch {
      // Ignorado en modo privado.
    }
    return { token: `mock-${user.id_usuario}`, usuario }
  },
  async login({ email, password }) {
    await mock.wait()
    const user = mock.read().find((u) => u.email === email.toLowerCase() && u.password === password)
    if (!user) throw new ApiError(401, 'El correo o la contraseña no son correctos.')
    return mock.session(user)
  },
  async register({ nombre, email, password }) {
    await mock.wait()
    const users = mock.read()
    const normalized = email.toLowerCase()
    if (users.some((u) => u.email === normalized)) {
      throw new ApiError(409, 'Ya existe una cuenta con este correo.', {
        email: 'Ya existe una cuenta con este correo.',
      })
    }
    const user = { id_usuario: users.length + 1, nombre, email: normalized, password, rol: 'cliente' }
    mock.write([...users, user])
    return mock.session(user)
  },
  async me() {
    try {
      const usuario = JSON.parse(localStorage.getItem(SESSION_KEY))
      if (usuario) return { usuario }
    } catch {
      // Sigue al error.
    }
    throw new ApiError(401, 'Sesión vencida.')
  },
  logout() {
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch {
      // Ignorado en modo privado.
    }
  },
}
