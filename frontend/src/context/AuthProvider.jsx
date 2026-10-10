import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService'
import { getToken, setToken } from '../services/api'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(getToken()))

  useEffect(() => {
    if (!getToken()) return
    authService
      .me()
      .then(({ usuario }) => setUsuario(usuario))
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  const startSession = useCallback(({ token, usuario }) => {
    setToken(token)
    setUsuario(usuario)
    return usuario
  }, [])

  const login = useCallback(
    (credentials) => authService.login(credentials).then(startSession),
    [startSession],
  )

  const register = useCallback(
    (data) => authService.register(data).then(startSession),
    [startSession],
  )

  const logout = useCallback(() => {
    authService.logout()
    setToken(null)
    setUsuario(null)
  }, [])

  const value = useMemo(
    () => ({ usuario, loading, login, register, logout }),
    [usuario, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
