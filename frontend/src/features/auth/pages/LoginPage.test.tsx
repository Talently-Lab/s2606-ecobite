import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { ROUTES } from '@/shared/config/routes'
import { renderAuthRoute } from '@/test/renderWithProviders'
import { AUTH_MESSAGES as MSG } from '../messages'
import { LoginPage } from './LoginPage'

beforeEach(() => {
  localStorage.setItem(
    'ecobite.mock.usuarios',
    JSON.stringify([
      {
        id_usuario: 1,
        nombre: 'Lucía Pérez',
        email: 'lucia@mail.com',
        password: 'verde2026bici',
        rol: 'cliente',
      },
    ]),
  )
})

describe('LoginPage', () => {
  it('valida los campos antes de enviar', async () => {
    const { user } = renderAuthRoute(ROUTES.login, <LoginPage />)
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(screen.getByText(MSG.emailRequired)).toBeInTheDocument()
    expect(screen.getByText(MSG.passwordRequired)).toBeInTheDocument()
  })

  it('muestra el error del diseño con credenciales incorrectas', async () => {
    const { user } = renderAuthRoute(ROUTES.login, <LoginPage />)
    await user.type(screen.getByLabelText('Correo electrónico'), 'lucia@mail.com')
    await user.type(screen.getByLabelText('Contraseña'), 'incorrecta')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(MSG.invalidCredentials)
  })

  it('ingresa y lleva al inicio', async () => {
    const { user } = renderAuthRoute(ROUTES.login, <LoginPage />)
    await user.type(screen.getByLabelText('Correo electrónico'), 'lucia@mail.com')
    await user.type(screen.getByLabelText('Contraseña'), 'verde2026bici')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('Inicio: Lucía Pérez')).toBeInTheDocument()
  })
})
