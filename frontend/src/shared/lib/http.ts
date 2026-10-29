import { readItem, writeItem } from '@/shared/lib/storage'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '')
const TOKEN_KEY = 'ecobite.token'

export type FieldErrors = Record<string, string>

export class ApiError extends Error {
  readonly status: number
  readonly fields: FieldErrors

  constructor(status: number, message: string, fields: FieldErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

export const getToken = (): string | null => readItem(TOKEN_KEY)
export const setToken = (token: string | null): void => writeItem(TOKEN_KEY, token)

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
}

interface ErrorBody {
  message?: string
  errors?: FieldErrors
  error?: {
    code?: string
    message?: string
    fields?: FieldErrors
  }
}

export async function request<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.')
  }

  const data: unknown = await res.json().catch(() => ({}))
  if (!res.ok) {
    const { error, message, errors } = (data ?? {}) as ErrorBody
    const fallback =
      res.status === 429
        ? 'Demasiados intentos. Inténtalo nuevamente más tarde.'
        : 'Algo salió mal. Intentá de nuevo.'
    throw new ApiError(res.status, error?.message ?? message ?? fallback, error?.fields ?? errors)
  }
  return data as T
}
