import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth, type Usuario } from '@/features/auth'
import { SiteHeader } from './SiteHeader'

vi.mock('@/features/auth', () => ({ useAuth: vi.fn() }))
const user: Usuario = { id_usuario: 1, nombre: 'Ana Pérez', email: 'ana@example.com', rol: 'cliente' }
const logout = vi.fn()
function session(usuario: Usuario | null = null) {
  vi.mocked(useAuth).mockReturnValue({ usuario, loading: false, login: vi.fn(), register: vi.fn(), logout })
}
function renderHeader(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SiteHeader />
      <button>Fuera del encabezado</button>
    </MemoryRouter>,
  )
}
beforeEach(() => {
  session()
  logout.mockReset()
})

describe('SiteHeader', () => {
  it('incluye el mapa en la navegación y mantiene el acceso a la cuenta y al carrito vacío', () => {
    renderHeader()
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    expect(
      within(nav)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['Inicio', 'Restaurantes', 'Mapa', 'Nuestro impacto'])
    expect(screen.getByRole('link', { name: 'Mapa' })).toHaveAttribute('href', '/mapa')
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('link', { name: 'Explorar restaurantes' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver carrito, 0 productos' })).toHaveAttribute(
      'href',
      '/restaurantes?carrito=1',
    )
    expect(screen.queryByRole('navigation', { name: 'Opciones de cuenta' })).not.toBeInTheDocument()
  })

  it('ofrece ingreso y registro al visitante y cierra al navegar', async () => {
    const user = userEvent.setup()
    renderHeader()
    await user.click(screen.getByRole('button', { name: 'Mi cuenta' }))
    expect(screen.getByRole('link', { name: 'Ingresar' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: 'Crear cuenta' })).toHaveAttribute('href', '/registro')
    await user.click(screen.getByRole('link', { name: 'Ingresar' }))
    expect(screen.getByRole('button', { name: 'Mi cuenta' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('agrupa nombre, impacto y cierre de sesión; reserva administración para admin', async () => {
    session(user)
    const interaction = userEvent.setup()
    renderHeader()
    expect(screen.queryByText('Ana Pérez')).not.toBeInTheDocument()
    await interaction.click(screen.getByRole('button', { name: 'Mi cuenta' }))
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mi impacto' })).toHaveAttribute('href', '/impacto')
    expect(screen.queryByRole('link', { name: 'Administración' })).not.toBeInTheDocument()
    await interaction.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(logout).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Mi cuenta' })).toHaveFocus()
  })

  it('muestra el acceso de administración con el rol correspondiente', async () => {
    session({ ...user, rol: 'admin' })
    renderHeader()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Mi cuenta' }))
    expect(screen.getByRole('link', { name: 'Administración' })).toHaveAttribute('href', '/admin')
  })

  it('cierra con Escape y restaura el foco; también cierra al pulsar fuera', async () => {
    const user = userEvent.setup()
    renderHeader()
    const account = screen.getByRole('button', { name: 'Mi cuenta' })
    await user.click(account)
    await user.tab()
    expect(screen.getByRole('link', { name: 'Ingresar' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(account).toHaveFocus()
    expect(account).toHaveAttribute('aria-expanded', 'false')
    await user.click(account)
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Fuera del encabezado' }))
    expect(account).toHaveAttribute('aria-expanded', 'false')
  })

  it('alterna cuenta y navegación móvil y marca restaurantes también en sus menús', async () => {
    const user = userEvent.setup()
    renderHeader('/restaurantes/1')
    expect(screen.getByRole('link', { name: 'Restaurantes' })).toHaveAttribute('aria-current', 'page')
    await user.click(screen.getByRole('button', { name: 'Abrir navegación' }))
    expect(screen.getByRole('button', { name: 'Cerrar navegación' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Mi cuenta' }))
    expect(screen.getByRole('button', { name: 'Abrir navegación' })).toHaveAttribute('aria-expanded', 'false')
    await user.click(screen.getByRole('button', { name: 'Abrir navegación' }))
    expect(screen.getByRole('button', { name: 'Mi cuenta' })).toHaveAttribute('aria-expanded', 'false')
    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: 'Abrir navegación' })).toHaveFocus()
  })
})
