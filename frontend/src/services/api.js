const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''
const TOKEN_KEY = 'ecobite.token'

export const hasApi = API_URL !== ''

export class ApiError extends Error {
  constructor(status, message, fields = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Sin storage (modo privado): la sesión dura lo que la pestaña.
  }
}

export async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(res.status, data.message ?? 'Algo salió mal. Intentá de nuevo.', data.errors)
  }
  return data
}
