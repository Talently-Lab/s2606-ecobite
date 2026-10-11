// Mock local mientras la API de auth no exista. Solo para desarrollar la UI: guarda
// contraseñas en texto plano en localStorage, nunca usarlo con datos reales.
import { ApiError } from '@/shared/lib/http'
import { readJson, writeItem, writeJson } from '@/shared/lib/storage'
import { AUTH_MESSAGES } from '../messages'
import type { AuthResponse, LoginPayload, MeResponse, RegisterPayload, Usuario } from '../types'

const USERS_KEY = 'ecobite.mock.usuarios'
const SESSION_KEY = 'ecobite.mock.sesion'
const LATENCY_MS = 400

interface MockUser extends Usuario {
  password: string
}

const wait = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
const readUsers = () => readJson<MockUser[]>(USERS_KEY) ?? []

function startSession({ password: _password, ...usuario }: MockUser): AuthResponse {
  writeJson(SESSION_KEY, usuario)
  return { token: `mock-${usuario.id_usuario}`, usuario }
}

export const authMock = {
  async login({ email, password }: LoginPayload): Promise<AuthResponse> {
    await wait()
    const user = readUsers().find((u) => u.email === email.toLowerCase() && u.password === password)
    if (!user) throw new ApiError(401, AUTH_MESSAGES.invalidCredentials)
    return startSession(user)
  },

  async register({ nombre, email, password }: RegisterPayload): Promise<AuthResponse> {
    await wait()
    const users = readUsers()
    const normalized = email.toLowerCase()
    if (users.some((u) => u.email === normalized)) {
      throw new ApiError(409, AUTH_MESSAGES.emailTaken, { email: AUTH_MESSAGES.emailTaken })
    }
    const user: MockUser = {
      id_usuario: users.length + 1,
      nombre,
      email: normalized,
      password,
      rol: 'cliente',
    }
    writeJson(USERS_KEY, [...users, user])
    return startSession(user)
  },

  async me(): Promise<MeResponse> {
    const usuario = readJson<Usuario>(SESSION_KEY)
    if (!usuario) throw new ApiError(401, AUTH_MESSAGES.sessionExpired)
    return { usuario }
  },

  logout(): void {
    writeItem(SESSION_KEY, null)
  },
}
