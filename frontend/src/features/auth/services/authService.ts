import { hasApi, request } from '@/shared/lib/http'
import type { AuthResponse, LoginPayload, MeResponse, RegisterPayload } from '../types'
import { authMock } from './authMock'

const authApi = {
  login: (payload: LoginPayload) => request<AuthResponse>('/auth/login', { method: 'POST', body: payload }),
  register: (payload: RegisterPayload) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: payload }),
  me: () => request<MeResponse>('/auth/me'),
  // Con JWT sin estado no hace falta avisar al servidor: alcanza con borrar el token.
  logout: () => {},
}

/** Usa la API real si hay VITE_API_URL; si no, el mock local. */
export const authService = hasApi ? authApi : authMock
