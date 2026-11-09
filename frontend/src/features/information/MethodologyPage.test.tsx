import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/features/auth'
import { MethodologyPage } from './MethodologyPage'

beforeEach(() => {
  vi.stubGlobal('scrollTo', vi.fn())
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  )
})
afterEach(() => vi.unstubAllGlobals())
function mount() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <MethodologyPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('Metodología de CO₂', () => {
  it('presenta el cálculo y su alcance sin inventar cifras de ahorro', () => {
    const originalTitle = document.title
    const { unmount } = mount()
    expect(screen.getByRole('heading', { level: 1, name: 'Cómo calculamos el CO₂' })).toBeInTheDocument()
    const formula = screen.getByRole('complementary', { name: 'La idea detrás del ahorro' })
    expect(within(formula).getByText('Distancia del recorrido')).toBeInTheDocument()
    expect(within(formula).getByText('CO₂ evitado estimado')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(3)
    expect(screen.getByText('Los pedidos pendientes o cancelados no suman a tu impacto.')).toBeInTheDocument()
    expect(screen.getByText(/no la huella total de la comida/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver a restaurantes' })).toHaveAttribute(
      'href',
      '/restaurantes',
    )
    expect(document.title).toBe('Cómo calculamos el CO₂ · EcoBite')
    unmount()
    expect(document.title).toBe(originalTitle)
  })
  it('permite consultar y cerrar el detalle del cálculo', async () => {
    const user = userEvent.setup()
    mount()
    const summary = screen.getByText('Ver el detalle del cálculo')
    const details = summary.closest('details')!
    expect(details).not.toHaveAttribute('open')
    await user.click(summary)
    expect(details).toHaveAttribute('open')
    expect(within(details).getByText(/2,50 km → 0,43 kg/)).toBeVisible()
    await user.click(summary)
    expect(details).not.toHaveAttribute('open')
  })
})
