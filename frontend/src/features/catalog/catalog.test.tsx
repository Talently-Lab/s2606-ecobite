import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/features/auth'
import { AppRoutes } from '@/app/router'

const fetchMock = vi.fn<typeof fetch>()
const restaurant = {
  id: 1,
  name: 'Verde Bowl',
  address: 'Thames 1420',
  ecoIndicator: 'A',
  biodegradablePackaging: true,
  imageUrl: null,
  category: 'Bowls',
  rating: null,
  estimatedDeliveryMinutes: null,
}
const dish = {
  id: 16,
  name: 'Bowl quinoa',
  price: 4500,
  co2SavedPerUnit: 0.05,
  category: 'Bowls',
  restaurantId: 1,
  imageUrl: null,
  available: true,
  restaurant,
}
const usuario = { id_usuario: 1, nombre: 'Lucía', email: 'lucia@mail.com', rol: 'cliente' }
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status })
const menu = { restaurant, dishes: [dish] }
function mount(path: string, authenticated = false) {
  if (authenticated) localStorage.setItem('ecobite.token', 'jwt')
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  )
  return user
}
beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
  fetchMock.mockImplementation(async (input) => {
    const url = String(input)
    if (url.endsWith('/auth/me')) return json({ user: usuario })
    if (url.endsWith('/auth/login') || url.endsWith('/auth/register'))
      return json({ user: usuario, token: 'jwt' })
    if (/\/restaurantes\/\d+$/.test(url)) return json({ data: menu })
    return json({ data: [restaurant] })
  })
})
afterEach(() => vi.unstubAllGlobals())

describe('Catálogo y acceso al menú', () => {
  it('muestra datos reales y omite valoración y entrega desconocidas', async () => {
    mount('/restaurantes')
    expect(await screen.findByRole('link', { name: 'Verde Bowl' })).toHaveAttribute('href', '/restaurantes/1')
    expect(screen.getByText('Thames 1420')).toBeInTheDocument()
    expect(screen.queryByText(/Valoración:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Entrega estimada:/)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Sin fotografía disponible')).toBeInTheDocument()
  })
  it('envía búsqueda y categoría al backend', async () => {
    const user = mount('/restaurantes')
    await screen.findByRole('link', { name: 'Verde Bowl' })
    await user.type(screen.getByLabelText('Buscar restaurantes'), 'Verde')
    await user.selectOptions(screen.getByLabelText('Categoría'), 'Bowls')
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/restaurantes?search=Verde&categoria=Bowls'),
        expect.anything(),
      ),
    )
  })
  it('descarta resultados de búsquedas anteriores', async () => {
    let resolveOld!: (response: Response) => void
    fetchMock.mockImplementation((input) =>
      String(input).includes('search=vieja')
        ? new Promise<Response>((resolve) => {
            resolveOld = resolve
          })
        : Promise.resolve(json({ data: [restaurant] })),
    )
    const user = mount('/restaurantes')
    await screen.findByRole('link', { name: 'Verde Bowl' })
    await user.type(screen.getByLabelText('Buscar restaurantes'), 'vieja')
    await waitFor(() => expect(resolveOld).toBeDefined())
    await user.clear(screen.getByLabelText('Buscar restaurantes'))
    await user.type(screen.getByLabelText('Buscar restaurantes'), 'nueva')
    await screen.findByRole('link', { name: 'Verde Bowl' })
    resolveOld(json({ data: [{ ...restaurant, name: 'Resultado anterior' }] }))
    await waitFor(() => expect(screen.queryByText('Resultado anterior')).not.toBeInTheDocument())
  })
  it('redirige al login y vuelve al restaurante al ingresar', async () => {
    const user = mount('/restaurantes/1')
    expect(screen.queryByRole('heading', { name: 'Verde Bowl' })).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('Correo electrónico'), 'lucia@mail.com')
    await user.type(screen.getByLabelText('Contraseña'), 'verde2026bici')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByRole('heading', { name: 'Verde Bowl' })).toBeInTheDocument()
  })
  it('conserva el destino al pasar por registro y volver al login', async () => {
    const user = mount('/restaurantes/1')
    await user.click(screen.getByRole('link', { name: 'Creá una gratis' }))
    await user.click(screen.getByRole('link', { name: 'Ingresar' }))
    await user.type(screen.getByLabelText('Correo electrónico'), 'lucia@mail.com')
    await user.type(screen.getByLabelText('Contraseña'), 'verde2026bici')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByRole('heading', { name: 'Verde Bowl' })).toBeInTheDocument()
  })
  it('espera la sesión al recargar y retira el menú al cerrar sesión', async () => {
    const user = mount('/restaurantes/1', true)
    expect(screen.getByRole('status')).toHaveTextContent('Validando tu sesión')
    await screen.findByRole('heading', { name: 'Verde Bowl' })
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(await screen.findByRole('button', { name: 'Ingresar' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Verde Bowl' })).not.toBeInTheDocument()
    expect(localStorage.getItem('ecobite.token')).toBeNull()
  })
  it('rechaza una sesión inválida sin solicitar el menú', async () => {
    fetchMock.mockResolvedValue(json({ error: { message: 'Sesión vencida' } }, 401))
    mount('/restaurantes/1', true)
    expect(await screen.findByRole('button', { name: 'Ingresar' })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it('calcula cantidades, subtotal y CO₂ y permite quitar la última unidad', async () => {
    const user = mount('/restaurantes/1', true)
    const add = await screen.findByRole('button', { name: 'Agregar Bowl quinoa al pedido' })
    await user.click(add)
    await user.click(add)
    const cart = screen.getByRole('complementary', { name: 'Carrito' })
    expect(within(cart).getByText('2 unidades en tu carrito')).toBeInTheDocument()
    expect(within(cart).getByText('Subtotal').parentElement).toHaveTextContent('9.000')
    expect(within(cart).getByText(/CO₂ estimado del pedido:/)).toHaveTextContent('0,1 kg')
    expect(screen.getByRole('button', { name: 'Ir a pagar' })).toBeDisabled()
    await user.click(within(cart).getByRole('button', { name: 'Quitar una unidad de Bowl quinoa' }))
    await user.click(within(cart).getByRole('button', { name: 'Quitar una unidad de Bowl quinoa' }))
    expect(within(cart).getByText('Tu carrito está vacío.')).toBeInTheDocument()
  })
  it('filtra platos y muestra un resultado vacío', async () => {
    const user = mount('/restaurantes/1', true)
    await screen.findByRole('heading', { name: 'Bowl quinoa' })
    await user.type(screen.getByLabelText('Buscar platos'), 'pizza')
    expect(screen.getByText('No hay platos que coincidan con tu búsqueda.')).toBeInTheDocument()
  })
  it.each(['0', 'abc', '-1'])('rechaza ID inválido %s', async (id) => {
    mount(`/restaurantes/${id}`, true)
    expect(await screen.findByRole('alert')).toHaveTextContent('identificador del restaurante no es válido')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it('muestra 404 y permite reintentar', async () => {
    fetchMock.mockImplementation(async (input) =>
      String(input).endsWith('/auth/me')
        ? json({ user: usuario })
        : json({ error: { message: 'No existe' } }, 404),
    )
    const user = mount('/restaurantes/1', true)
    expect(await screen.findByRole('alert')).toHaveTextContent('Restaurante no encontrado o inactivo')
    fetchMock.mockResolvedValue(json({ data: menu }))
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('heading', { name: 'Verde Bowl' })).toBeInTheDocument()
  })
  it('muestra error de red en catálogo y se recupera al reintentar', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    const user = mount('/restaurantes')
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos conectarnos')
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('link', { name: 'Verde Bowl' })).toBeInTheDocument()
  })
  it('muestra catálogo y menú vacíos sin datos de ejemplo', async () => {
    fetchMock.mockResolvedValue(json({ data: [] }))
    mount('/restaurantes')
    expect(await screen.findByText('No encontramos restaurantes con estos filtros.')).toBeInTheDocument()
  })
  it('muestra un menú sin platos', async () => {
    fetchMock.mockImplementation(async (input) =>
      String(input).endsWith('/auth/me')
        ? json({ user: usuario })
        : json({ data: { restaurant, dishes: [] } }),
    )
    mount('/restaurantes/1', true)
    expect(
      await screen.findByText('Este restaurante todavía no tiene platos disponibles.'),
    ).toBeInTheDocument()
  })
  it('vuelve al menú después de crear una cuenta', async () => {
    const user = mount('/restaurantes/1')
    await user.click(screen.getByRole('link', { name: 'Crear cuenta' }))
    await user.type(screen.getByLabelText('Nombre y apellido'), 'Lucía')
    await user.type(screen.getByLabelText('Correo electrónico'), 'lucia@mail.com')
    await user.type(screen.getByLabelText('Contraseña', { exact: true }), 'verde2026bici')
    await user.type(screen.getByLabelText('Repetí la contraseña'), 'verde2026bici')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(await screen.findByRole('heading', { name: 'Verde Bowl' })).toBeInTheDocument()
  })
  it('vacía el carrito al abrir otro restaurante', async () => {
    const user = mount('/restaurantes/1', true)
    await user.click(await screen.findByRole('button', { name: 'Agregar Bowl quinoa al pedido' }))
    await user.click(screen.getByRole('link', { name: 'Volver a restaurantes' }))
    fetchMock.mockImplementation(async (input) =>
      String(input).endsWith('/restaurantes/2')
        ? json({
            data: {
              restaurant: { ...restaurant, id: 2, name: 'Otro local' },
              dishes: [{ ...dish, restaurantId: 2 }],
            },
          })
        : json({ data: [{ ...restaurant, id: 2, name: 'Otro local' }] }),
    )
    await user.clear(screen.getByLabelText('Buscar restaurantes'))
    await user.type(screen.getByLabelText('Buscar restaurantes'), 'Otro')
    await user.click(await screen.findByRole('link', { name: 'Otro local' }))
    expect(await screen.findByRole('heading', { name: 'Otro local' })).toBeInTheDocument()
    expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument()
  })
  it('protege también el checkout y muestra su estado pendiente', async () => {
    const user = mount('/checkout')
    await user.type(screen.getByLabelText('Correo electrónico'), 'lucia@mail.com')
    await user.type(screen.getByLabelText('Contraseña'), 'verde2026bici')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(
      await screen.findByRole('heading', { name: 'Checkout pendiente de integración' }),
    ).toBeInTheDocument()
  })
  it('redirige la ruta antigua al catálogo público', async () => {
    mount('/panel')
    expect(await screen.findByRole('heading', { name: 'Restaurantes' })).toBeInTheDocument()
  })
})
