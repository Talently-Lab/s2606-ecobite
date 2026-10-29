import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/features/auth'
import type { HomeData } from '../types'
import { HomePage } from './HomePage'

const fetchMock = vi.fn<typeof fetch>()
const restaurant = {
  id: 1,
  name: 'Verde Bowl',
  address: 'Av. Verde 123',
  biodegradablePackaging: true,
  ecoIndicator: 'Reparto sustentable',
}
const data: HomeData = {
  userImpact: null,
  categories: [
    { id: 1, name: 'Bowls', slug: 'bowls' },
    { id: 2, name: 'Wraps', slug: 'wraps' },
  ],
  restaurants: [restaurant],
  featuredDishes: [
    { id: 1, name: 'Bowl de quinoa', price: 8500, co2SavedPerUnit: 0.4, category: 'Bowls', restaurant },
    { id: 2, name: 'Wrap de vegetales', price: 7000, co2SavedPerUnit: 0.3, category: 'Wraps', restaurant },
  ],
  howItWorks: [
    {
      step: 1,
      title: 'Elige tu comida',
      description: 'Descubre restaurantes y platillos disponibles en EcoBite.',
    },
  ],
}

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status })
}

function renderHome() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <HomePage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

function authenticate() {
  localStorage.setItem('ecobite.token', 'jwt-valido')
  fetchMock.mockResolvedValueOnce(
    response({
      message: 'Usuario autenticado',
      user: {
        id_usuario: 1,
        nombre: 'Ana Pérez',
        email: 'ana@example.com',
        rol: 'cliente',
        fecha_registro: '2026-10-25T15:40:26.684Z',
      },
    }),
  )
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
})
afterEach(() => vi.unstubAllGlobals())

describe('HomePage', () => {
  it('consulta Home sin JWT para visitantes y muestra los datos reales', async () => {
    fetchMock.mockResolvedValue(response({ message: 'Datos obtenidos correctamente', data }))
    renderHome()
    expect(screen.getByRole('status')).toHaveTextContent('Cargando Home')
    expect(await screen.findByText(restaurant.address)).toBeInTheDocument()
    expect(screen.getByText('Envase biodegradable')).toBeInTheDocument()
    expect(screen.getByText(restaurant.ecoIndicator)).toBeInTheDocument()
    expect(screen.getByText('Bowl de quinoa')).toBeInTheDocument()
    expect(screen.getByText('8.500', { exact: false })).toBeInTheDocument()
    expect(screen.getByText(data.howItWorks[0]!.description)).toBeInTheDocument()
    expect(screen.getByText('Ingresá para consultar tu CO₂ ahorrado')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/home', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: undefined,
    })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('filtra los platos destacados con las categorías de la API', async () => {
    fetchMock.mockResolvedValue(response({ message: 'Datos obtenidos correctamente', data }))
    const user = userEvent.setup()
    renderHome()
    await user.click(await screen.findByRole('button', { name: 'Bowls' }))
    expect(screen.getByText('Bowl de quinoa')).toBeInTheDocument()
    expect(screen.queryByText('Wrap de vegetales')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Todos' }))
    expect(screen.getByText('Wrap de vegetales')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('envía el JWT y muestra el impacto personal, incluido cero', async () => {
    authenticate()
    fetchMock.mockResolvedValue(
      response({
        message: 'Datos obtenidos correctamente',
        data: {
          ...data,
          userImpact: { co2SavedKg: 0 },
        },
      }),
    )
    renderHome()
    expect(await screen.findByText('0 kg')).toBeInTheDocument()
    expect(screen.getByText('de CO₂ ahorrados en tus pedidos')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenLastCalledWith(
      'http://localhost:3000/api/home',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-valido' }),
      }),
    )
  })

  it('actualiza Home sin autenticación al cerrar sesión', async () => {
    authenticate()
    fetchMock.mockResolvedValueOnce(
      response({
        message: 'Datos obtenidos correctamente',
        data: {
          ...data,
          userImpact: { co2SavedKg: 2.5 },
        },
      }),
    )
    fetchMock.mockResolvedValue(response({ message: 'Datos obtenidos correctamente', data }))
    const user = userEvent.setup()
    renderHome()
    expect(await screen.findByText('2,5 kg')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(screen.queryByText('2,5 kg')).not.toBeInTheDocument()
    expect(await screen.findByText(restaurant.address)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenLastCalledWith('http://localhost:3000/api/home', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: undefined,
    })
  })

  it('muestra el error 401 de Home sin confundirlo con un catálogo vacío', async () => {
    authenticate()
    fetchMock.mockResolvedValue(
      response(
        {
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token inválido',
            fields: {},
          },
        },
        401,
      ),
    )
    renderHome()
    expect(await screen.findByRole('alert')).toHaveTextContent('Token inválido')
    expect(screen.queryByText('Todavía no hay locales disponibles.')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('muestra el estado vacío cuando la API devuelve listas vacías', async () => {
    fetchMock.mockResolvedValue(
      response({
        message: 'Datos obtenidos correctamente',
        data: {
          userImpact: null,
          categories: [],
          restaurants: [],
          featuredDishes: [],
          howItWorks: [],
        },
      }),
    )
    renderHome()
    expect(await screen.findByText('Todavía no hay locales disponibles.')).toBeInTheDocument()
    expect(screen.getByText('No hay platos destacados en esta categoría.')).toBeInTheDocument()
  })

  it('muestra los errores de conexión', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    renderHome()
    expect(within(await screen.findByRole('alert')).getByText(/No pudimos conectarnos/)).toBeInTheDocument()
  })
})
