import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getToken, setToken } from '@/shared/lib/http'
import { authService } from '../services/authService'
import type { AuthResponse, LoginPayload, RegisterPayload, Usuario } from '../types'
import { AuthContext, type AuthContextValue } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(() => Boolean(getToken()))

  useEffect(() => {
    if (!getToken()) return
    authService
      .me()
      .then(({ usuario }) => setUsuario(usuario))
      .catch(() => {
        setToken(null)
        setUsuario(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const startSession = useCallback(({ token, usuario }: AuthResponse) => {
    setToken(token)
    setUsuario(usuario)
    return usuario
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      loading,
      login: (payload: LoginPayload) => authService.login(payload).then(startSession),
      register: (payload: RegisterPayload) => authService.register(payload).then(startSession),
      logout: () => {
        authService.logout()
        setToken(null)
        setUsuario(null)
      },
    }),
    [usuario, loading, startSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
