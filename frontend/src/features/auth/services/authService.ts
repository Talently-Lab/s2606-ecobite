import { request } from '@/shared/lib/http'
import type {
  AuthResponse,
  LoginPayload,
  MeResponse,
  RegisterPayload,
  AuthApiResponse,
  MeApiResponse,
} from '../types'

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { token, user } = await request<AuthApiResponse>('/auth/login', {
      method: 'POST',
      body: payload,
    })
    return { token, usuario: user }
  },
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { token, user } = await request<AuthApiResponse>('/auth/register', {
      method: 'POST',
      body: payload,
    })
    return { token, usuario: user }
  },
  me: async (): Promise<MeResponse> => {
    const { user } = await request<MeApiResponse>('/auth/me')
    return { usuario: user }
  },
  // Con JWT sin estado alcanza con borrar el token.
  logout: () => {},
}
