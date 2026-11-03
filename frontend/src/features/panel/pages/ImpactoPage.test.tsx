import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/features/auth'
import { ImpactoPage } from './ImpactoPage'

const fetchMock = vi.fn<typeof fetch>()
const home = { categories: [], restaurants: [], featuredDishes: [], howItWorks: [] }
function mount() {
  vi.stubGlobal('fetch', fetchMock)
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ImpactoPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}
afterEach(() => {
  vi.unstubAllGlobals()
  fetchMock.mockReset()
})

describe('Mi impacto con datos reales', () => {
  it('muestra cero como un valor real y elimina métricas e historial ficticios', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { ...home, userImpact: { co2SavedKg: 0 } } })),
    )
    mount()
    expect(screen.getByRole('status')).toHaveTextContent('Cargando tu impacto')
    expect(await screen.findByLabelText('Tu impacto acumulado')).toHaveTextContent('0 kg')
    expect(screen.queryByText('Historial de pedidos')).not.toBeInTheDocument()
    expect(screen.queryByText('Este mes')).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/home',
      expect.objectContaining({ method: 'GET' }),
    )
  })
  it('distingue un dato ausente del ahorro cero', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ data: { ...home, userImpact: null } })))
    mount()
    expect(await screen.findByText('Tu impacto todavía no está disponible.')).toBeInTheDocument()
    expect(screen.queryByLabelText('Tu impacto acumulado')).not.toBeInTheDocument()
  })
  it('muestra el error sin inventar una cifra', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    mount()
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos conectarnos')
    expect(screen.queryByLabelText('Tu impacto acumulado')).not.toBeInTheDocument()
  })
})
