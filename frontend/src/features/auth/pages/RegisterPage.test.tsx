import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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

describe('RegisterPage', () => {
  it('muestra los errores de cada campo al enviar vacío', async () => {
    const { user } = renderAuthRoute(ROUTES.register, <RegisterPage />)
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

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
  })

  it('avisa si el correo ya está registrado', async () => {
    localStorage.setItem(
      'ecobite.mock.usuarios',
      JSON.stringify([
        { id_usuario: 1, nombre: 'L', email: 'lucia@mail.com', password: 'x', rol: 'cliente' },
      ]),
    )
    const { user } = renderAuthRoute(ROUTES.register, <RegisterPage />)
    await fillForm(user, 'LUCIA@mail.com')

    const message = await screen.findByText(MSG.emailTaken, { exact: false })
    expect(screen.getByLabelText('Correo electrónico')).toHaveAccessibleDescription(/Ya existe una cuenta/)
    expect(within(message).getByRole('link', { name: 'Ingresá' })).toHaveAttribute('href', ROUTES.login)
  })

  it('permite mostrar la contraseña', async () => {
    const { user } = renderAuthRoute(ROUTES.register, <RegisterPage />)
    const input = screen.getByLabelText('Contraseña')
    expect(input).toHaveAttribute('type', 'password')

    await user.click(screen.getAllByRole('button', { name: 'Mostrar contraseña' })[0]!)
    expect(input).toHaveAttribute('type', 'text')
  })
})
