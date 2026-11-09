import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/features/auth'
import { AppRoutes } from '@/app/router'
import type { HomeData } from '../types'
import { HomePage } from './HomePage'

const fetchMock = vi.fn<typeof fetch>()
const restaurant = {
  id: 1,
  name: 'Verde Bowl',
  address: 'Av. Verde 123',
  biodegradablePackaging: true,
  ecoIndicator: 'Reparto sustentable',
  latitude: -34.6037,
  longitude: -58.3816,
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

function CurrentLocation() {
  const location = useLocation()
  return (
    <span aria-label="Ruta actual">
      {location.pathname}
      {location.search}
    </span>
  )
}

function renderHome() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <HomePage />
        <CurrentLocation />
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
})
afterEach(() => vi.unstubAllGlobals())

describe('HomePage', () => {
  it('carga el inicio bajo demanda desde el router y consulta sus restaurantes', async () => {
    fetchMock.mockResolvedValue(response({ message: 'Inicio', data }))
    render(
      <MemoryRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Encontrá dónde comer.' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Bowl de quinoa' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Mapa de restaurantes')).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/home', expect.any(Object))
  })

  it('ofrece un CTA al catálogo y navegación móvil con estado expandido', async () => {
    fetchMock.mockResolvedValue(response({ message: 'OK', data }))
    const user = userEvent.setup()
    renderHome()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Encontrá dónde comer.')
    expect(screen.queryByRole('link', { name: /Explorar restaurantes/ })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Ver opciones' })).toHaveAttribute('href', '#opciones')
    expect(screen.getByRole('link', { name: 'Explorar el mapa' })).toHaveAttribute('href', '/mapa')
    expect(
      screen.getByText(
        'Elegí restaurantes con delivery sustentable y conocé el CO₂ estimado que evitás con cada pedido.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText('UN POCO MÁS RICO. UN POCO MÁS CONSCIENTE.')).not.toBeInTheDocument()
    expect(screen.queryByText('Bici o eléctrico')).not.toBeInTheDocument()
    expect(screen.queryByText('Envases conscientes')).not.toBeInTheDocument()
    const toggle = screen.getByRole('button', { name: 'Abrir navegación' })
    await user.click(toggle)
    expect(screen.getByRole('button', { name: 'Cerrar navegación' })).toHaveAttribute('aria-expanded', 'true')
    await user.click(screen.getByRole('link', { name: 'Restaurantes' }))
    expect(screen.getByRole('button', { name: 'Abrir navegación' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('abre la página del mapa desde Inicio y carga solo los restaurantes del catálogo', async () => {
    fetchMock.mockImplementation(async (url) =>
      response({ data: String(url).endsWith('/api/home') ? data : data.restaurants }),
    )
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    )
    await user.click(await screen.findByRole('link', { name: 'Explorar el mapa' }))
    expect(await screen.findByRole('heading', { name: 'Elegí dónde comer' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Encontrá dónde comer.' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mapa' })).toHaveAttribute('aria-current', 'page')
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/restaurantes', expect.any(Object)),
    )
  })
  it('muestra hasta seis platos sin repetir nombres y actualiza el precio y el menú', async () => {
    const first = data.featuredDishes[0]!
    fetchMock.mockResolvedValue(
      response({
        data: {
          ...data,
          featuredDishes: [
            first,
            {
              ...first,
              id: 99,
              name: '  BOWL   DE QUINOA  ',
              restaurant: { ...restaurant, id: 99, name: 'Otro restaurante' },
            },
            ...Array.from({ length: 6 }, (_, index) => ({
              ...first,
              id: index + 2,
              name: `Plato ${index + 2}`,
              price: 9000 + index,
              restaurant: { ...restaurant, id: index + 2, name: `Local ${index + 2}` },
            })),
          ],
        },
      }),
    )
    renderHome()
    const section = screen.getByRole('region', { name: 'Tu próximo plato empieza acá.' })
    await within(section).findByRole('heading', { name: first.name })
    expect(section.querySelectorAll('.dish-carousel-slide')).toHaveLength(6)
    expect(section.querySelector('[aria-label="Mostrar Plato 7"]')).toBeNull()
    expect(section.querySelector('[aria-label="Mostrar   BOWL   DE QUINOA  "]')).toBeNull()
    expect(within(section).getByText('$ 8.500')).toBeInTheDocument()
    await userEvent.setup().click(within(section).getByRole('button', { name: 'Plato siguiente' }))
    expect(within(section).getByRole('heading', { name: 'Plato 2' })).toBeInTheDocument()
    expect(within(section).getByText('$ 9.000')).toBeInTheDocument()
    expect(within(section).getByRole('link', { name: 'Ver menú de Local 2' })).toHaveAttribute(
      'href',
      '/restaurantes/2',
    )
    expect(screen.getByRole('heading', { name: 'Qué cambia con tu pedido' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Conocé cómo lo calculamos' })).toHaveAttribute(
      'href',
      '/como-calculamos-co2',
    )
    expect(screen.queryByText('Pedir rico y cuidar el planeta es igual de fácil')).not.toBeInTheDocument()
  })

  it('muestra una alternativa si falla la fotografía de un plato', async () => {
    fetchMock.mockResolvedValue(
      response({
        data: {
          ...data,
          featuredDishes: [{ ...data.featuredDishes[0], imageUrl: 'https://example.com/plato.jpg' }],
        },
      }),
    )
    renderHome()
    const photo = await screen.findByRole('img', { name: 'Bowl de quinoa' })
    fireEvent.error(photo)
    expect(screen.queryByRole('img', { name: 'Bowl de quinoa' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Sin fotografía disponible')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver menú de Verde Bowl' })).toBeInTheDocument()
  })

  it('mantiene el acceso al catálogo mientras carga y cuando no hay platos', async () => {
    fetchMock.mockResolvedValue(response({ data: { ...data, featuredDishes: [] } }))
    renderHome()
    expect(screen.getByRole('status')).toHaveTextContent('Cargando platos')
    expect(screen.getByRole('link', { name: 'Ver todos los restaurantes' })).toHaveAttribute(
      'href',
      '/restaurantes',
    )
    expect(await screen.findByText(/No hay platos para mostrar/)).toBeInTheDocument()
  })

  it('informa un error de carga sin esconder el acceso al catálogo', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    renderHome()
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos conectarnos')
    expect(screen.getByRole('link', { name: 'Ver todos los restaurantes' })).toHaveAttribute(
      'href',
      '/restaurantes',
    )
  })
})
