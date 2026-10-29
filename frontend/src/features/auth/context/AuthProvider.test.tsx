import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../hooks/useAuth'
import { AuthProvider } from './AuthProvider'

const fetchMock = vi.fn<typeof fetch>()
const apiUser = {
  id_usuario: 1,
  nombre: 'Usuario EcoBite',
  email: 'usuario@example.com',
  rol: 'cliente',
  fecha_registro: '2026-10-25T15:40:26.684Z',
}

function SessionProbe() {
  const { usuario, loading } = useAuth()
  if (loading) return <p>Cargando sesión</p>
  return <p>{usuario ? JSON.stringify(usuario) : 'Sin sesión'}</p>
}

function renderSession() {
  return render(
    <AuthProvider>
      <SessionProbe />
    </AuthProvider>,
  )
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
})
afterEach(() => vi.unstubAllGlobals())

describe('AuthProvider /auth/me', () => {
  it('no consulta el perfil cuando no hay JWT', () => {
    renderSession()
    expect(screen.getByText('Sin sesión')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('envía el JWT por GET y recupera todos los datos del usuario', async () => {
    localStorage.setItem('ecobite.token', 'jwt-valido')
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'Usuario autenticado',
          user: apiUser,
        }),
        { status: 200 },
      ),
    )
    renderSession()
    expect(screen.getByText('Cargando sesión')).toBeInTheDocument()
    expect(await screen.findByText(JSON.stringify(apiUser))).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer jwt-valido' },
      body: undefined,
    })
    expect(localStorage.getItem('ecobite.token')).toBe('jwt-valido')
  })

  it('elimina el JWT y termina la carga cuando la API responde 401', async () => {
    localStorage.setItem('ecobite.token', 'jwt-invalido')
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_TOKEN',
            message: 'El token no corresponde a un usuario activo',
            fields: {},
          },
        }),
        { status: 401 },
      ),
    )
    renderSession()
    expect(await screen.findByText('Sin sesión')).toBeInTheDocument()
    expect(localStorage.getItem('ecobite.token')).toBeNull()
    expect(screen.queryByText('Cargando sesión')).not.toBeInTheDocument()
  })
})
