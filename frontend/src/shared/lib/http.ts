import { readItem, writeItem } from '@/shared/lib/storage'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
const TOKEN_KEY = 'ecobite.token'

/** Sin VITE_API_URL los servicios usan sus mocks locales. */
export const hasApi = API_URL !== ''

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
    const { message, errors } = data as ErrorBody
    throw new ApiError(res.status, message ?? 'Algo salió mal. Intentá de nuevo.', errors)
  }
  return data as T
}
