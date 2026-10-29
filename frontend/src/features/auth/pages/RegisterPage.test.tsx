import { screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ROUTES } from '@/shared/config/routes'
import { renderAuthRoute } from '@/test/renderWithProviders'
import { AUTH_MESSAGES as MSG } from '../messages'
import { RegisterPage } from './RegisterPage'

async function fillForm(user: ReturnType<typeof renderAuthRoute>['user'], email = 'lucia@mail.com') {
  await user.type(screen.getByLabelText('Nombre y apellido'), 'Lucía Pérez')
  await user.type(screen.getByLabelText('Correo electrónico'), email)
  await user.type(screen.getByLabelText('Contraseña'), 'verde2026Bici')
  await user.type(screen.getByLabelText('Repetí la contraseña'), 'verde2026Bici')
  await user.click(screen.getByRole('checkbox'))
  await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
}

const fetchMock = vi.fn<typeof fetch>()
const apiUser = {
  id_usuario: 1,
  nombre: 'Lucía Pérez',
  email: 'lucia@mail.com',
  rol: 'cliente',
  fecha_registro: '2026-10-25T15:32:42.838Z',
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
  fetchMock.mockResolvedValue(
    new Response(
      JSON.stringify({
        message: 'Usuario registrado correctamente',
        token: 'jwt-registro',
        user: apiUser,
      }),
      { status: 201 },
    ),
  )
})
afterEach(() => vi.unstubAllGlobals())

describe('RegisterPage', () => {
  it('muestra los errores de cada campo al enviar vacío', async () => {
    const { user } = renderAuthRoute(ROUTES.register, <RegisterPage />)
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(MSG.registerInvalid)
    expect(screen.getByText(MSG.nameRequired)).toBeInTheDocument()
    expect(screen.getByText(MSG.emailRequired)).toBeInTheDocument()
    expect(screen.getByText(MSG.termsRequired)).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre y apellido')).toHaveAttribute('aria-invalid', 'true')
  })

  it('crea la cuenta y lleva al inicio con la sesión iniciada', async () => {
    const { user } = renderAuthRoute(ROUTES.register, <RegisterPage />)
    await fillForm(user)
    expect(await screen.findByText('Inicio: Lucía Pérez')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/auth/register',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ nombre: 'Lucía Pérez', email: 'lucia@mail.com', password: 'verde2026Bici' }),
      }),
    )
    expect(localStorage.getItem('ecobite.token')).toBe('jwt-registro')
    expect(localStorage.getItem('ecobite.mock.usuarios')).toBeNull()
  })

  it('recupera la sesión registrada al volver a abrir la página', async () => {
    localStorage.setItem('ecobite.token', 'jwt-registro')
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'Usuario autenticado',
          user: apiUser,
        }),
        { status: 200 },
      ),
    )
    renderAuthRoute(ROUTES.register, <RegisterPage />)
    expect(await screen.findByText('Inicio: Lucía Pérez')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/auth/me',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer jwt-registro' }) }),
    )
  })

  it('avisa si el correo ya está registrado', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'El correo electrónico ya está registrado',
            fields: { email: 'Este correo ya está en uso' },
          },
        }),
        { status: 409 },
      ),
    )
    const { user } = renderAuthRoute(ROUTES.register, <RegisterPage />)
    await fillForm(user, 'LUCIA@mail.com')

    expect(await screen.findByText('Este correo ya está en uso')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toHaveAccessibleDescription(
      'Este correo ya está en uso',
    )
    expect(localStorage.getItem('ecobite.token')).toBeNull()
  })

  it('muestra la validación enviada por la API', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_INPUT',
            message: 'Los campos obligatorios no son válidos',
            fields: { nombre: 'El nombre no es válido' },
          },
        }),
        { status: 400 },
      ),
    )
    const { user } = renderAuthRoute(ROUTES.register, <RegisterPage />)
    await fillForm(user)
    expect(await screen.findByText('El nombre no es válido')).toBeInTheDocument()
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
    const { user } = renderAuthRoute(ROUTES.register, <RegisterPage />)
    await fillForm(user)
    expect(await screen.findByRole('alert')).toHaveTextContent('Demasiados intentos')
    expect(localStorage.getItem('ecobite.token')).toBeNull()
  })

  it('avisa cuando no puede conectarse al servidor', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    const { user } = renderAuthRoute(ROUTES.register, <RegisterPage />)
    await fillForm(user)
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos conectarnos')
  })

  it('permite mostrar la contraseña', async () => {
    const { user } = renderAuthRoute(ROUTES.register, <RegisterPage />)
    const input = screen.getByLabelText('Contraseña')
    expect(input).toHaveAttribute('type', 'password')

    await user.click(screen.getAllByRole('button', { name: 'Mostrar contraseña' })[0]!)
    expect(input).toHaveAttribute('type', 'text')
  })
})
