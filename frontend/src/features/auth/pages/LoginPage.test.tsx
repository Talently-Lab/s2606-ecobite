import { screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ROUTES } from '@/shared/config/routes'
import { renderAuthRoute } from '@/test/renderWithProviders'
import { AUTH_MESSAGES as MSG } from '../messages'
import { LoginPage } from './LoginPage'

const fetchMock = vi.fn<typeof fetch>()
beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
  fetchMock.mockResolvedValue(
    new Response(
      JSON.stringify({
        message: 'Inicio de sesión exitoso',
        token: 'jwt-login',
        user: {
          id_usuario: 1,
          nombre: 'Lucía Pérez',
          email: 'lucia@mail.com',
          rol: 'cliente',
          fecha_registro: '2026-10-25T15:39:24.172Z',
        },
      }),
      { status: 200 },
    ),
  )
})
afterEach(() => vi.unstubAllGlobals())

describe('LoginPage', () => {
  it('valida los campos antes de enviar', async () => {
    const { user } = renderAuthRoute(ROUTES.login, <LoginPage />)
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByText(MSG.emailRequired)).toBeInTheDocument()
    expect(screen.getByText(MSG.passwordRequired)).toBeInTheDocument()
  })

  it('muestra el error del diseño con credenciales incorrectas', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: { message: MSG.invalidCredentials, fields: {} } }), {
        status: 401,
      }),
    )
    const { user } = renderAuthRoute(ROUTES.login, <LoginPage />)
    await user.type(screen.getByLabelText('Correo electrónico'), 'lucia@mail.com')
    await user.type(screen.getByLabelText('Contraseña'), 'incorrecta')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(MSG.invalidCredentials)
    expect(localStorage.getItem('ecobite.token')).toBeNull()
  })

  it('ingresa y lleva al inicio', async () => {
    const { user } = renderAuthRoute(ROUTES.login, <LoginPage />)
    await user.type(screen.getByLabelText('Correo electrónico'), 'lucia@mail.com')
    await user.type(screen.getByLabelText('Contraseña'), 'verde2026bici')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('Inicio: Lucía Pérez')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'lucia@mail.com', password: 'verde2026bici' }),
      }),
    )
    expect(localStorage.getItem('ecobite.token')).toBe('jwt-login')
  })

  it('muestra los errores de campo enviados por la API', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_INPUT',
            message: 'Los campos obligatorios no son válidos',
            fields: { email: 'El correo electrónico no es válido' },
          },
        }),
        { status: 400 },
      ),
    )
    const { user } = renderAuthRoute(ROUTES.login, <LoginPage />)
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'ClaveSegura123')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByText('El correo electrónico no es válido')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('aria-invalid', 'true')
    expect(localStorage.getItem('ecobite.token')).toBeNull()
  })

  it('muestra el límite de intentos sin iniciar sesión', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Demasiados intentos. Inténtalo nuevamente más tarde.',
            fields: {},
          },
        }),
        { status: 429 },
      ),
    )
    const { user } = renderAuthRoute(ROUTES.login, <LoginPage />)
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'ClaveSegura123')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Demasiados intentos')
    expect(localStorage.getItem('ecobite.token')).toBeNull()
  })

  it('permite reintentar después de un error de conexión', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    const { user } = renderAuthRoute(ROUTES.login, <LoginPage />)
    await user.type(screen.getByLabelText('Correo electrónico'), 'lucia@mail.com')
    await user.type(screen.getByLabelText('Contraseña'), 'verde2026bici')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos conectarnos')
    expect(localStorage.getItem('ecobite.token')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByText('Inicio: Lucía Pérez')).toBeInTheDocument()
    expect(localStorage.getItem('ecobite.token')).toBe('jwt-login')
  })
})
