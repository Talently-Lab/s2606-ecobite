import { readItem, writeItem } from '@/shared/lib/storage'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '')
const TOKEN_KEY = 'ecobite.token'

export type FieldErrors = Record<string, string>

export interface ApiResult<T> {
  message: string
  data: T
}

export class ApiError extends Error {
  readonly safeToRetry: boolean
  readonly quote?: unknown
  readonly status: number
  readonly fields: FieldErrors

  constructor(
    status: number,
    message: string,
    fields: FieldErrors = {},
    quote?: unknown,
    safeToRetry = false,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
    this.quote = quote
    this.safeToRetry = safeToRetry
  }
}

export const getToken = (): string | null => readItem(TOKEN_KEY)
export const setToken = (token: string | null): void => writeItem(TOKEN_KEY, token)

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  signal?: AbortSignal
}

interface ErrorBody {
  safeToRetry?: boolean
  quote?: unknown
  message?: string
  errors?: FieldErrors
  error?: {
    code?: string
    message?: string
    fields?: FieldErrors
  }
}

export async function request<T>(
  path: string,
  { method = 'GET', body, signal }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      signal,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    if (signal?.aborted)
      throw new ApiError(0, 'El cálculo de entrega tardó demasiado. Reintentá o cambiá el destino.')
    throw new ApiError(0, 'No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.')
  }

  const data: unknown = await res.json().catch(() => ({}))
  if (signal?.aborted)
    throw new ApiError(0, 'El cálculo de entrega tardó demasiado. Reintentá o cambiá el destino.')
  if (!res.ok) {
    const { error, message, errors, quote, safeToRetry } = (data ?? {}) as ErrorBody
    const fallback =
      res.status === 429
        ? 'Demasiados intentos. Inténtalo nuevamente más tarde.'
        : 'Algo salió mal. Intentá de nuevo.'
    throw new ApiError(
      res.status,
      error?.message ?? message ?? fallback,
      error?.fields ?? errors,
      quote,
      safeToRetry,
    )
  }
  return data as T
}
