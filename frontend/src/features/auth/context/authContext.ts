import { createContext } from 'react'
import type { LoginPayload, RegisterPayload, Usuario } from '../types'

export interface AuthContextValue {
  usuario: Usuario | null
  /** true mientras se valida un token guardado al cargar la app. */
  loading: boolean
  login: (payload: LoginPayload) => Promise<Usuario>
  register: (payload: RegisterPayload) => Promise<Usuario>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
