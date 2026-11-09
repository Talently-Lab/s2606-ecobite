import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DishCarousel } from './DishCarousel'
import type { FeaturedDish } from '../types'

const dishes: FeaturedDish[] = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  name: `Plato ${index + 1}`,
  price: 1000 + index,
  category: null,
  co2SavedPerUnit: 0,
  restaurant: { id: index + 1, name: `Local ${index + 1}`, ecoIndicator: 'A', biodegradablePackaging: true },
}))
beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  )
})
afterEach(() => vi.unstubAllGlobals())
function renderCarousel(items = dishes) {
  return render(
    <MemoryRouter>
      <DishCarousel dishes={items} />
    </MemoryRouter>,
  )
}

describe('Carrusel de platos', () => {
  it('recorre los seis platos en ambos sentidos y conserva el enlace del seleccionado', async () => {
    const user = userEvent.setup()
    renderCarousel()
    expect(screen.getByText('1 de 6')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Plato anterior' }))
    expect(screen.getByRole('heading', { name: 'Plato 6' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver menú de Local 6' })).toHaveAttribute(
      'href',
      '/restaurantes/6',
    )
    await user.click(screen.getByRole('button', { name: 'Plato siguiente' }))
    expect(screen.getByRole('heading', { name: 'Plato 1' })).toBeInTheDocument()
    expect(screen.getByText('1 de 6')).toBeInTheDocument()
  })

  it('permite cambiar con las flechas del teclado y seleccionando una tarjeta lateral', async () => {
    const user = userEvent.setup()
    renderCarousel()
    await user.tab()
    expect(screen.getByRole('region', { name: 'Platos para descubrir' })).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('heading', { name: 'Plato 2' })).toBeInTheDocument()
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('heading', { name: 'Plato 1' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Mostrar Plato 3' }))
    expect(await screen.findByRole('heading', { name: 'Plato 3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mostrar Plato 3' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('muestra un único plato sin controles innecesarios', () => {
    renderCarousel(dishes.slice(0, 1))
    expect(screen.getByRole('heading', { name: 'Plato 1' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Plato siguiente' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver menú de Local 1' })).toHaveAttribute(
      'href',
      '/restaurantes/1',
    )
  })
})
