import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/features/auth'
import { AppRoutes } from '@/app/router'
import {
  cartInputs,
  changeDraftQuantity,
  getOrders,
  claimOrderOwner,
  setOrderDestination,
} from '@/shared/lib/orderDraft'
import type { OrderInput } from '@/shared/lib/orderDraft'
import { clearMenuCache } from './menuCache'

const fetchMock = vi.fn<typeof fetch>()
const restaurant = {
  id: 1,
  name: 'Verde Bowl',
  address: 'Thames 1420',
  ecoIndicator: 'Bici',
  biodegradablePackaging: true,
  imageUrl: null,
  category: 'Bowls',
  rating: null,
  estimatedDeliveryMinutes: null,
  latitude: null,
  longitude: null,
}
const second = { ...restaurant, id: 2, name: 'Raíz Cocina' }
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
const secondDish = { ...dish, id: 20, name: 'Bowl vegetal', price: 5000, restaurantId: 2, restaurant: second }
const usuario = { id_usuario: 1, nombre: 'Lucía', email: 'lucia@mail.com', rol: 'cliente' }
let currentUser = usuario
let restaurants = [restaurant, second]
let menus: Record<number, { restaurant: typeof restaurant; dishes: (typeof dish)[] }>
let failure = 0
let lostResponse = false
let invalidSession = false
let invalidLogin = false
const confirmations = new Map<number, unknown>()
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
function quote(order: OrderInput) {
  const menu = menus[order.restaurantId]!
  const items = order.items.map((item) => {
    const product = menu.dishes.find((dish) => dish.id === item.dishId)!
    return { ...item, name: product.name, unitPrice: product.price, subtotal: product.price * item.quantity }
  })
  return {
    restaurantId: order.restaurantId,
    restaurantName: menu.restaurant.name,
    zone: 'ruta',
    destination: order.destination,
    distanceKm: 2.5,
    methodology: 'transport-170g-v1',
    items,
    subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
    deliveryFee: null,
    total: null,
    environmentalImpact: { co2SavedKg: 0.43 },
    requiresEnvironmentalRules: true,
  }
}
async function server(input: RequestInfo | URL, options?: RequestInit) {
  const url = new URL(String(input))
  if (url.pathname.endsWith('/auth/me'))
    return invalidSession ? json({ message: 'Sesión vencida' }, 401) : json({ user: currentUser })
  if (url.pathname.endsWith('/auth/login') || url.pathname.endsWith('/auth/register'))
    return invalidLogin
      ? json({ message: 'Credenciales incorrectas' }, 401)
      : json({ user: currentUser, token: 'jwt' })
  if (url.pathname.endsWith('/checkout/cotizar'))
    return json({ data: quote(JSON.parse(String(options?.body))) })
  if (url.pathname.endsWith('/pedidos')) {
    if (failure)
      return json(
        { message: failure === 401 ? 'Sesión vencida' : 'Error interno al crear el pedido' },
        failure,
      )
    const body = JSON.parse(String(options?.body))
    const data = quote(body)
    if (JSON.stringify(body.reviewedQuote) !== JSON.stringify(data))
      return json({ message: 'La cotización cambió. Revisá los valores actualizados.', quote: data }, 409)
    const id = confirmations.size + 1
    const result = {
      order: {
        id,
        date: '2026-11-02T12:00:00Z',
        status: 'completed',
        total: data.subtotal,
        zone: data.zone,
        distanceKm: data.distanceKm,
        restaurant: { id: data.restaurantId, name: data.restaurantName },
        items: data.items.map((item) => ({ ...item, co2SavedKg: 0.05, packagingType: 'biodegradable' })),
        environmentalImpact: { co2SavedKg: 0.1 },
      },
      myImpact: { co2SavedKg: 0.1, ordersCount: id },
    }
    confirmations.set(id, result)
    if (lostResponse) {
      lostResponse = false
      throw new TypeError('Network disconnected')
    }
    return json({ data: result }, 201)
  }
  const confirmationId = url.pathname.match(/\/pedidos\/(\d+)\/confirmacion$/)?.[1]
  if (confirmationId) return json({ data: confirmations.get(Number(confirmationId)) })
  if (/\/restaurantes\/\d+\/valoraciones$/.test(url.pathname))
    return json({ data: { averageScore: 0, totalRatings: 0, ratings: [] } })
  const id = url.pathname.match(/\/restaurantes\/(\d+)$/)?.[1]
  if (id)
    return menus[Number(id)]
      ? json({ data: menus[Number(id)] })
      : json({ message: 'Restaurante no encontrado' }, 404)
  const search = url.searchParams.get('search')?.toLowerCase()
  const category = url.searchParams.get('categoria')
  return json({
    data: restaurants.filter(
      (restaurant) =>
        (!search || restaurant.name.toLowerCase().includes(search)) &&
        (!category || restaurant.category === category),
    ),
  })
}
function NavigationProbe() {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <>
      <output aria-label="URL actual">
        {location.pathname}
        {location.search}
      </output>
      <button onClick={() => navigate(-1)}>Historial atrás</button>
    </>
  )
}
function mount(path: string, authenticated = false) {
  if (authenticated) localStorage.setItem('ecobite.token', 'jwt')
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <AppRoutes />
        <NavigationProbe />
      </AuthProvider>
    </MemoryRouter>,
  )
  return userEvent.setup()
}
function cart() {
  return within(screen.queryByRole('dialog') ?? screen.getByRole('complementary', { name: 'Carrito' }))
}
async function signIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Correo electrónico'), 'lucia@mail.com')
  await user.type(screen.getByLabelText('Contraseña'), 'verde2026bici')
  await user.click(screen.getByRole('button', { name: 'Ingresar' }))
}
beforeEach(() => {
  setOrderDestination({ latitude: -34.6, longitude: -58.4, label: 'Destino de prueba' })
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value() {
      this.open = true
    },
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value() {
      this.open = false
      this.dispatchEvent(new Event('close'))
    },
  })
  restaurants = [restaurant, second]
  menus = { 1: { restaurant, dishes: [dish] }, 2: { restaurant: second, dishes: [secondDish] } }
  currentUser = usuario
  failure = 0
  lostResponse = false
  invalidSession = false
  invalidLogin = false
  confirmations.clear()
  fetchMock.mockReset().mockImplementation(server)
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('scrollTo', vi.fn())
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Catálogo, carrito agrupado y checkout', () => {
  it('muestra todos los locales sin controles de carrusel y permite filtrar', async () => {
    restaurants = Array.from({ length: 19 }, (_, index) => ({
      ...restaurant,
      id: index + 1,
      name: `Local ${index + 1}`,
    }))
    const user = mount('/restaurantes')
    expect(screen.getByText('Cargando restaurantes…')).toHaveAttribute('role', 'status')
    await screen.findByRole('link', { name: 'Ver menú de Local 19' })
    expect(screen.getAllByRole('article')).toHaveLength(19)
    expect(screen.queryByRole('button', { name: 'Restaurante siguiente' })).not.toBeInTheDocument()
    expect(screen.queryByRole('complementary', { name: 'Carrito' })).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await user.type(screen.getByLabelText('Buscar restaurantes'), 'Local 19')
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1))
    await user.selectOptions(screen.getByLabelText('Categoría'), 'Ensaladas')
    await screen.findByText('No encontramos restaurantes con estos filtros.')
  })
  it.each([0, 1, 2, 10])('maneja un catálogo de %i restaurantes', async (count) => {
    restaurants = Array.from({ length: count }, (_, index) => ({
      ...restaurant,
      id: index + 1,
      name: `Local ${index + 1}`,
    }))
    mount('/restaurantes')
    if (!count) {
      await screen.findByText('No encontramos restaurantes con estos filtros.')
      expect(screen.queryByRole('region', { name: 'Restaurantes' })).not.toBeInTheDocument()
    } else {
      await screen.findByRole('link', { name: 'Ver menú de Local 1' })
      expect(screen.getAllByRole('article')).toHaveLength(count)
    }
  })
  it('mantiene la selección del mapa y permite recuperar el catálogo', async () => {
    const user = mount('/restaurantes?restaurante=2&origen=mapa')
    expect(await screen.findByRole('link', { name: 'Ver menú de Raíz Cocina' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Ver menú de Verde Bowl' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ver todos' }))
    expect(await screen.findByRole('link', { name: 'Ver menú de Verde Bowl' })).toBeInTheDocument()
    expect(screen.getByLabelText('URL actual')).toHaveTextContent('origen=mapa')
  })
  it.each(['999', '0', '-1', 'abc', '1.5', '9007199254740992', ''])(
    'maneja una selección inválida %s',
    async (id) => {
      mount(`/restaurantes?restaurante=${id}`)
      expect(await screen.findByText(/El restaurante seleccionado no está disponible/)).toBeInTheDocument()
    },
  )
  it('identifica el restaurante, conserva los filtros y muestra el acceso móvil al agregar', async () => {
    menus[1]!.dishes.push({ ...dish, id: 17, name: 'Ensalada de temporada', category: 'Ensaladas' })
    const user = mount('/restaurantes/1')
    await screen.findByRole('heading', { name: 'Verde Bowl' })
    expect(screen.getByRole('link', { name: 'Ver reseñas' })).toHaveAttribute('href', '#valoraciones')
    expect(screen.queryByText('Menú del restaurante')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ver carrito' })).not.toBeInTheDocument()
    expect(await cart().findByRole('heading', { name: 'Tu pedido de Verde Bowl' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ensaladas' }))
    expect(screen.queryByRole('heading', { name: 'Bowl quinoa' })).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('Buscar platos'), 'temporada')
    await user.click(screen.getByRole('button', { name: 'Agregar Ensalada de temporada al pedido' }))
    expect(screen.getByRole('button', { name: 'Ver carrito' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Cantidad de Ensalada de temporada' })).toHaveTextContent('1')
    await user.click(screen.getByRole('button', { name: 'Todos' }))
    await user.clear(screen.getByLabelText('Buscar platos'))
    expect(screen.getByRole('heading', { name: 'Bowl quinoa' })).toBeInTheDocument()
  })
  it('permite agregar sin sesión y muestra cantidades sincronizadas en tarjeta y carrito', async () => {
    const user = mount('/restaurantes/1')
    await user.click(await screen.findByRole('button', { name: 'Agregar Bowl quinoa al pedido' }))
    const picker = screen.getByRole('group', { name: 'Cantidad de Bowl quinoa' })
    await user.click(within(picker).getByRole('button', { name: 'Agregar una unidad de Bowl quinoa' }))
    expect(cart().getAllByText('9.000', { exact: false }).length).toBeGreaterThan(0)
    expect(cart().getByRole('group', { name: 'Cantidad de Bowl quinoa en el carrito' })).toHaveTextContent(
      '2',
    )
    await user.click(cart().getByRole('button', { name: 'Quitar una unidad de Bowl quinoa' }))
    expect(picker).toHaveTextContent('1')
    expect(screen.queryByLabelText('Correo electrónico')).not.toBeInTheDocument()
  })
  it('aísla el carrito de cada menú y conserva los demás al cambiar de restaurante', async () => {
    const user = mount('/restaurantes/1')
    await user.click(await screen.findByRole('button', { name: 'Agregar Bowl quinoa al pedido' }))
    await user.click(screen.getByRole('link', { name: 'Volver a restaurantes' }))
    await screen.findByRole('link', { name: 'Ver menú de Raíz Cocina' })
    await user.click(screen.getByRole('link', { name: 'Ver menú de Raíz Cocina' }))
    await screen.findByRole('heading', { name: 'Raíz Cocina' })
    expect(cart().queryByText('Bowl quinoa')).not.toBeInTheDocument()
    expect(cart().getByText('Agregá un plato para empezar.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver carrito, 0 productos' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Agregar Bowl vegetal al pedido' }))
    expect(cartInputs(getOrders())).toHaveLength(2)
    expect(cart().getByText('Bowl vegetal')).toBeInTheDocument()
    expect(cart().queryByText('Bowl quinoa')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver carrito, 1 producto' })).toBeInTheDocument()
    await user.click(cart().getByRole('link', { name: 'Ver mis otros carritos' }))
    expect(await screen.findByRole('dialog', { name: 'Tus carritos' })).toBeInTheDocument()
    expect(cart().getByRole('button', { name: 'Revisar carrito de Raíz Cocina' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(
      cart().queryByRole('button', { name: /^(Revisar pedido de|Iniciar sesión para continuar con)/ }),
    ).not.toBeInTheDocument()
    await user.click(cart().getByRole('button', { name: 'Revisar carrito de Verde Bowl' }))
    expect(cart().getByText('Bowl quinoa')).toBeVisible()
    expect(
      cart().getAllByRole('button', { name: /^(Revisar pedido de|Iniciar sesión para continuar con)/ }),
    ).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Ver carrito, 2 productos' })).toBeInTheDocument()
  })
  it('quita solo el carrito elegido y actualiza el resumen', async () => {
    changeDraftQuantity(1, restaurant.name, 16, 2)
    changeDraftQuantity(2, second.name, 20, 1)
    const user = mount('/restaurantes')
    expect(screen.getByText('2 carritos · 3 productos')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ver carritos' }))
    await user.click(cart().getByRole('button', { name: 'Revisar carrito de Verde Bowl' }))
    await user.click(cart().getByRole('button', { name: 'Quitar carrito de Verde Bowl' }))
    expect(cartInputs(getOrders())).toHaveLength(1)
    expect(getOrders().drafts[2]?.items[20]).toBe(1)
    await user.click(screen.getByRole('button', { name: 'Cerrar carrito' }))
    expect(screen.getByText('1 carrito · 1 producto')).toBeInTheDocument()
  })
  it('permite reintentar los precios sin desplegar un carrito y bloquea continuar si fallan', async () => {
    changeDraftQuantity(1, restaurant.name, 16, 1)
    let menuFailed = true
    fetchMock.mockImplementation((input, options) =>
      menuFailed && new URL(String(input)).pathname.endsWith('/restaurantes/1')
        ? Promise.resolve(json({ message: 'Sin conexión' }, 503))
        : server(input, options),
    )
    const user = mount('/restaurantes')
    await user.click(screen.getByRole('button', { name: 'Ver carritos' }))
    await cart().findByRole('alert')
    expect(cart().getByRole('button', { name: 'Revisar carrito de Verde Bowl' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    await user.click(cart().getByRole('button', { name: 'Revisar carrito de Verde Bowl' }))
    expect(
      cart().getByRole('button', { name: 'Iniciar sesión para continuar con Verde Bowl' }),
    ).toBeDisabled()
    await user.click(cart().getByRole('button', { name: 'Revisar carrito de Verde Bowl' }))
    menuFailed = false
    await user.click(cart().getByRole('button', { name: 'Reintentar' }))
    await waitFor(() => expect(cart().queryByRole('alert')).not.toBeInTheDocument())
    await user.click(cart().getByRole('button', { name: 'Revisar carrito de Verde Bowl' }))
    expect(cart().getByRole('button', { name: 'Iniciar sesión para continuar con Verde Bowl' })).toBeEnabled()
  })
  it('solicita login solo al ir a pagar y conserva los dos restaurantes', async () => {
    changeDraftQuantity(1, restaurant.name, 16, 2)
    changeDraftQuantity(2, second.name, 20, 1)
    const user = mount('/restaurantes')
    await user.click(screen.getByRole('button', { name: 'Ver carritos' }))
    await user.click(cart().getByRole('button', { name: 'Revisar carrito de Verde Bowl' }))
    await user.click(
      await cart().findByRole('button', { name: 'Iniciar sesión para continuar con Verde Bowl' }),
    )
    expect(
      await screen.findByRole('heading', { name: 'Continuá tu pedido de Verde Bowl' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al carrito' })).toHaveAttribute(
      'href',
      '/restaurantes?carrito=1',
    )
    await signIn(user)
    expect(await screen.findByText('2 × Bowl quinoa')).toBeInTheDocument()
    expect(screen.queryByText('1 × Bowl vegetal')).not.toBeInTheDocument()
    expect(getOrders().drafts[2]?.items[20]).toBe(1)
    expect(screen.getByRole('button', { name: /^Pagar / })).toBeInTheDocument()
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/pedidos'))).toHaveLength(0)
  })
  it('pasa por registro y vuelve al checkout sin perder lo elegido', async () => {
    changeDraftQuantity(1, restaurant.name, 16, 1)
    const user = mount('/checkout')
    await user.click(screen.getByRole('link', { name: 'Creá una gratis' }))
    await user.type(screen.getByLabelText('Nombre y apellido'), 'Lucía')
    await user.type(screen.getByLabelText('Correo electrónico'), 'lucia@mail.com')
    await user.type(screen.getByLabelText('Contraseña', { exact: true }), 'verde2026bici')
    await user.type(screen.getByLabelText('Repetí la contraseña'), 'verde2026bici')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(await screen.findByText('1 × Bowl quinoa')).toBeInTheDocument()
  })
  it('conserva el pedido después de un login incorrecto y al volver al menú', async () => {
    invalidLogin = true
    const user = mount('/restaurantes/1')
    await user.click(await screen.findByRole('button', { name: 'Agregar Bowl quinoa al pedido' }))
    await user.click(cart().getByRole('button', { name: 'Iniciar sesión para continuar con Verde Bowl' }))
    await signIn(user)
    await screen.findByRole('alert')
    expect(getOrders().drafts[1]?.items[16]).toBe(1)
    await user.click(screen.getByRole('button', { name: 'Historial atrás' }))
    expect(await cart().findByText('Bowl quinoa')).toBeInTheDocument()
  })
  it('conserva productos y filtros al recargar el menú', async () => {
    const user = mount('/restaurantes/1')
    await user.click(await screen.findByRole('button', { name: 'Agregar Bowl quinoa al pedido' }))
    await user.type(screen.getByLabelText('Buscar platos'), 'quinoa')
    cleanup()
    clearMenuCache()
    mount('/restaurantes/1')
    await screen.findByRole('heading', { name: 'Verde Bowl' })
    expect(screen.getByLabelText('Buscar platos')).toHaveValue('quinoa')
    expect(cart().getByText('Bowl quinoa')).toBeInTheDocument()
  })
  it('permite mantener platos sin destino pero bloquea cotización y pago', async () => {
    setOrderDestination(null)
    changeDraftQuantity(1, restaurant.name, 16, 1)
    mount('/checkout', true)
    await screen.findByText(/Elegí un destino para estimar el recorrido y la entrega/)
    expect(screen.getByRole('button', { name: 'Indicá el destino para continuar' })).toBeDisabled()
    expect(screen.getByText('Primero, indicá dónde querés recibir tu pedido')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Indicar destino de entrega' })).toHaveAttribute(
      'href',
      '#checkout-destination',
    )
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/checkout/cotizar'))).toHaveLength(0)
    expect(getOrders().drafts[1]?.items[16]).toBe(1)
  })
  it('al cambiar destino bloquea el pago hasta recibir otra cotización sin modificar platos', async () => {
    changeDraftQuantity(1, restaurant.name, 16, 1)
    mount('/checkout', true)
    await screen.findByRole('button', { name: 'Pagar $ 4.500' })
    let finish!: () => void
    fetchMock.mockImplementation((url, options) =>
      String(url).endsWith('/checkout/cotizar')
        ? new Promise((resolve) => {
            finish = () => {
              void server(url, options).then(resolve)
            }
          })
        : server(url, options),
    )
    act(() => setOrderDestination({ latitude: 2, longitude: 3, label: 'Destino nuevo' }))
    expect(screen.getByRole('button', { name: 'Actualizando precios…' })).toBeDisabled()
    expect(getOrders().drafts[1]?.items[16]).toBe(1)
    await act(async () => finish())
    expect(await screen.findByRole('button', { name: 'Pagar $ 4.500' })).toBeEnabled()
    expect(screen.getByText('Destino confirmado: Destino nuevo')).toBeInTheDocument()
  })
  it('distingue un fallo de cotización de una carga y permite reintentar sin perder el destino', async () => {
    changeDraftQuantity(1, restaurant.name, 16, 1)
    fetchMock.mockImplementation((url, options) =>
      String(url).endsWith('/checkout/cotizar')
        ? Promise.resolve(json({ message: 'No pudimos calcular el recorrido de entrega.' }, 503))
        : server(url, options),
    )
    const user = mount('/checkout', true)
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos calcular el recorrido')
    expect(screen.getByRole('button', { name: 'No pudimos calcular la entrega' })).toBeDisabled()
    expect(screen.queryByText('Calculando recorrido, precios y disponibilidad…')).not.toBeInTheDocument()
    fetchMock.mockImplementation(server)
    await user.click(screen.getByRole('button', { name: 'Reintentar cotización' }))
    expect(await screen.findByRole('button', { name: 'Pagar $ 4.500' })).toBeEnabled()
    expect(getOrders().destination?.label).toBe('Destino de prueba')
  })
  it('recotiza una prueba de entrega vencida y permite confirmar de nuevo sin perder productos', async () => {
    changeDraftQuantity(1, restaurant.name, 16, 1)
    const user = mount('/checkout', true)
    const pay = await screen.findByRole('button', { name: 'Pagar $ 4.500' })
    fetchMock.mockImplementation((url, options) =>
      String(url).endsWith('/pedidos')
        ? Promise.resolve(json({ message: 'El cálculo de entrega venció o no es válido.' }, 409))
        : server(url, options),
    )
    await user.click(pay)
    expect(await screen.findByRole('alert')).toHaveTextContent('El cálculo de entrega venció')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Pagar $ 4.500' })).toBeEnabled())
    expect(getOrders().pending).toBeNull()
    expect(getOrders().drafts[1]?.items[16]).toBe(1)
    fetchMock.mockImplementation(server)
    await user.click(screen.getByRole('button', { name: 'Pagar $ 4.500' }))
    expect(await screen.findByRole('heading', { name: '¡Pedido confirmado!' })).toBeInTheDocument()
    expect(confirmations.size).toBe(1)
  })
  it('paga sin completar la tarjeta y conserva el otro carrito con el mismo importe confirmado', async () => {
    changeDraftQuantity(1, restaurant.name, 16, 2)
    changeDraftQuantity(2, second.name, 20, 1)
    const user = mount('/checkout?restaurante=1', true)
    await screen.findByText('2 × Bowl quinoa')
    expect(screen.getByText('Sin cargo en esta demo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pagar $ 9.000' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^Pagar / }))
    expect(await screen.findByRole('heading', { name: '¡Pedido confirmado!' })).toBeInTheDocument()
    expect(screen.getByText('Distancia del recorrido: 2,5 km')).toBeInTheDocument()
    expect(screen.queryByText(/Pedido histórico/)).not.toBeInTheDocument()
    expect(cartInputs(getOrders())).toHaveLength(1)
    expect(getOrders().drafts[1]).toBeUndefined()
    expect(getOrders().drafts[2]?.items[20]).toBe(1)
    expect(confirmations.size).toBe(1)
    const requests = fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/pedidos'))
    expect(JSON.parse(String(requests[0]![1]!.body))).toEqual({
      restaurantId: 1,
      destination: { latitude: -34.6, longitude: -58.4, label: 'Destino de prueba' },
      reviewedQuote: expect.objectContaining({ distanceKm: 2.5, environmentalImpact: { co2SavedKg: 0.43 } }),
      items: [{ dishId: 16, quantity: 2 }],
    })
    expect(screen.getByText('Importe confirmado (ARS)').parentElement).toHaveTextContent('$ 9.000')
    expect(screen.getByText('Pago simulado aprobado · Tarjeta')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Valorar este restaurante' })).toHaveAttribute(
      'href',
      '/restaurantes/1#valoraciones',
    )
  })
  it('acepta datos arbitrarios de tarjeta sin enviarlos ni guardarlos y evita doble pedido', async () => {
    changeDraftQuantity(1, restaurant.name, 16, 1)
    const user = mount('/checkout', true)
    const pay = await screen.findByRole('button', { name: 'Pagar $ 4.500' })
    await user.type(screen.getByLabelText('Número de tarjeta'), 'tarjeta ficticia')
    await user.type(screen.getByLabelText('Vencimiento'), 'sin fecha')
    await user.type(screen.getByLabelText('Código de seguridad'), 'cualquier cosa')
    await user.type(screen.getByLabelText('Nombre del titular'), 'Titular de prueba')
    await user.dblClick(pay)
    await screen.findByRole('heading', { name: '¡Pedido confirmado!' })
    expect(confirmations.size).toBe(1)
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/pedidos'))).toHaveLength(1)
    const sent = JSON.stringify(fetchMock.mock.calls)
    const stored = JSON.stringify([Object.values(localStorage), Object.values(sessionStorage)])
    for (const value of ['tarjeta ficticia', 'sin fecha', 'cualquier cosa', 'Titular de prueba']) {
      expect(sent).not.toContain(value)
      expect(stored).not.toContain(value)
    }
  })
  it('permite cancelar PayPal sin crear pedido y autorizar después sin credenciales', async () => {
    changeDraftQuantity(1, restaurant.name, 16, 1)
    changeDraftQuantity(2, second.name, 20, 1)
    const user = mount('/checkout?restaurante=1', true)
    await screen.findByRole('button', { name: 'Pagar $ 4.500' })
    await user.click(screen.getByRole('radio', { name: 'PayPal' }))
    expect(screen.queryByLabelText('Número de tarjeta')).not.toBeInTheDocument()
    const next = screen.getByRole('button', { name: 'Continuar con PayPal' })
    await user.click(next)
    const dialog = screen.getByRole('dialog', { name: 'Autorizá tu pago a EcoBite' })
    expect(within(dialog).getByText('Verde Bowl')).toBeInTheDocument()
    expect(within(dialog).getByText('$ 4.500 ARS')).toBeInTheDocument()
    expect(within(dialog).queryByRole('textbox')).not.toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Volver al pedido' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(next).toHaveFocus()
    expect(confirmations.size).toBe(0)
    await user.click(next)
    await user.dblClick(screen.getByRole('button', { name: 'Autorizar pago' }))
    await screen.findByRole('heading', { name: '¡Pedido confirmado!' })
    expect(screen.getByText('Pago simulado aprobado · PayPal')).toBeInTheDocument()
    expect(confirmations.size).toBe(1)
    expect(getOrders().drafts[2]?.items[20]).toBe(1)
  })
  it('mantiene pago y resumen durante la cotización y el envío del pedido', async () => {
    changeDraftQuantity(1, restaurant.name, 16, 1)
    let finishQuote: () => void = () => {}
    let finishOrder: () => void = () => {}
    fetchMock.mockImplementation((input, options) => {
      if (String(input).endsWith('/checkout/cotizar')) {
        return new Promise((resolve) => {
          finishQuote = () => {
            void server(input, options).then(resolve)
          }
        })
      }
      if (String(input).endsWith('/pedidos')) {
        return new Promise((resolve) => {
          finishOrder = () => {
            void server(input, options).then(resolve)
          }
        })
      }
      return server(input, options)
    })
    const user = mount('/checkout', true)
    const summary = await screen.findByRole('complementary', { name: 'Tu pedido de Verde Bowl' })
    const number = screen.getByLabelText('Número de tarjeta')
    expect(number).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Actualizando precios…' })).toBeDisabled()
    await act(async () => {
      finishQuote()
    })
    const pay = await screen.findByRole('button', { name: 'Pagar $ 4.500' })
    expect(screen.getByRole('complementary', { name: 'Tu pedido de Verde Bowl' })).toBe(summary)
    expect(screen.getByLabelText('Número de tarjeta')).toBe(number)
    await user.type(number, 'dato ficticio')
    await user.click(pay)
    expect(screen.getByRole('button', { name: 'Procesando pago…' })).toBeDisabled()
    await waitFor(() =>
      expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/pedidos'))).toHaveLength(1),
    )
    expect(screen.getByRole('complementary', { name: 'Tu pedido de Verde Bowl' })).toBe(summary)
    expect(screen.getByLabelText('Número de tarjeta')).toBe(number)
    expect(number).toHaveValue('dato ficticio')
    expect(number).toBeDisabled()
    await act(async () => {
      finishOrder()
    })
    await screen.findByRole('heading', { name: '¡Pedido confirmado!' })
  })
  it('entra al checkout arriba y vuelve a la posición guardada del menú', async () => {
    const user = mount('/restaurantes/1', true)
    await user.click(await screen.findByRole('button', { name: 'Agregar Bowl quinoa al pedido' }))
    vi.stubGlobal('scrollY', 420)
    await user.click(cart().getByRole('button', { name: 'Revisar pedido de Verde Bowl' }))
    await screen.findByRole('button', { name: 'Pagar $ 4.500' })
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'instant' })
    vi.stubGlobal('scrollY', 0)
    await user.click(screen.getByRole('link', { name: 'Volver al menú' }))
    await screen.findByRole('heading', { name: 'Verde Bowl' })
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 420, behavior: 'instant' })
  })
  it('no mezcla carritos al entrar al checkout sin restaurante', async () => {
    changeDraftQuantity(1, restaurant.name, 16, 1)
    changeDraftQuantity(2, second.name, 20, 1)
    mount('/checkout', true)
    expect(
      await screen.findByText('Elegí un restaurante desde el carrito para confirmar su pedido por separado.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Pagar / })).not.toBeInTheDocument()
  })
  it('no reenvía una confirmación de resultado incierto ni siquiera después de recargar', async () => {
    lostResponse = true
    changeDraftQuantity(1, restaurant.name, 16, 2)
    const user = mount('/checkout', true)
    await user.click(await screen.findByRole('button', { name: /^Pagar / }))
    await screen.findByRole('region', { name: 'Confirmación pendiente' })
    expect(getOrders().pending).not.toBeNull()
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos conectarnos')
    cleanup()
    mount('/checkout', true)
    await screen.findByRole('region', { name: 'Confirmación pendiente' })
    expect(screen.getByRole('button', { name: 'Habilitar un nuevo intento' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: /^Pagar / })).not.toBeInTheDocument()
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/pedidos'))).toHaveLength(1)
    expect(confirmations.size).toBe(1)
  })
  it('habilita otro intento solo después de verificar que el pedido no se creó', async () => {
    failure = 500
    changeDraftQuantity(1, restaurant.name, 16, 1)
    const user = mount('/checkout', true)
    await user.click(await screen.findByRole('button', { name: /^Pagar / }))
    await screen.findByRole('region', { name: 'Confirmación pendiente' })
    expect(screen.getByRole('button', { name: 'Habilitar un nuevo intento' })).toBeDisabled()
    expect(confirmations.size).toBe(0)
    expect(screen.getByRole('alert')).toHaveTextContent('Error interno al crear el pedido')
    failure = 0
    await user.click(screen.getByRole('checkbox', { name: /Verifiqué que este pedido no se creó/ }))
    await user.click(screen.getByRole('button', { name: 'Habilitar un nuevo intento' }))
    expect(getOrders().pending).toBeNull()
    await user.click(await screen.findByRole('button', { name: /^Pagar / }))
    expect(await screen.findByRole('heading', { name: '¡Pedido confirmado!' })).toBeInTheDocument()
    expect(confirmations.size).toBe(1)
  })
  it('revisa precios cambiados antes de aceptar otra confirmación', async () => {
    changeDraftQuantity(1, restaurant.name, 16, 1)
    const user = mount('/checkout', true)
    await screen.findByText('1 × Bowl quinoa')
    menus[1]!.dishes[0] = { ...dish, price: 6000 }
    await user.click(screen.getByRole('button', { name: /^Pagar / }))
    expect(await screen.findByRole('alert')).toHaveTextContent('La cotización cambió')
    expect(getOrders().pending).toBeNull()
    expect(confirmations.size).toBe(0)
    await waitFor(() => expect(screen.getByRole('button', { name: /^Pagar / })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: /^Pagar / }))
    await screen.findByRole('heading', { name: '¡Pedido confirmado!' })
  })
  it('retira productos no disponibles al actualizar el catálogo y mantiene el aviso', async () => {
    changeDraftQuantity(1, restaurant.name, 16, 1)
    menus[1]!.dishes = []
    mount('/restaurantes/1')
    await screen.findByText('Este restaurante todavía no tiene platos disponibles.')
    expect(cart().getByText('Agregá un plato para empezar.')).toBeInTheDocument()
    expect(cart().getByText(/Quitamos platos que ya no están disponibles/)).toBeInTheDocument()
    expect(
      cart().queryByRole('button', { name: /^(Revisar pedido de|Iniciar sesión para continuar con)/ }),
    ).not.toBeInTheDocument()
  })
  it('elimina todos los grupos al cerrar sesión y mantiene el menú público', async () => {
    changeDraftQuantity(1, restaurant.name, 16, 1)
    const user = mount('/restaurantes/1', true)
    await screen.findByRole('heading', { name: 'Verde Bowl' })
    await user.click(screen.getByRole('button', { name: 'Mi cuenta' }))
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(cartInputs(getOrders())).toEqual([])
    expect(screen.getByRole('heading', { name: 'Verde Bowl' })).toBeInTheDocument()
  })
  it('no recupera carritos pertenecientes a otra cuenta', async () => {
    changeDraftQuantity(1, restaurant.name, 16, 1)
    claimOrderOwner(1)
    currentUser = { ...usuario, id_usuario: 2 }
    mount('/checkout', true)
    expect(await screen.findByText(/Tu carrito está vacío/)).toBeInTheDocument()
  })
  it('una sesión vencida permite reingresar sin perder el carrito', async () => {
    changeDraftQuantity(1, restaurant.name, 16, 1)
    failure = 401
    const user = mount('/checkout', true)
    await user.click(await screen.findByRole('button', { name: /^Pagar / }))
    await screen.findByLabelText('Correo electrónico')
    expect(getOrders().drafts[1]?.items[16]).toBe(1)
    failure = 0
    await signIn(user)
    expect(await screen.findByText('1 × Bowl quinoa')).toBeInTheDocument()
  })
  it.each([false, true])('abre el detalle y devuelve el foco al cerrar (móvil: %s)', async (mobile) => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: mobile && query.includes('max-width'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
    const user = mount('/restaurantes')
    const open = screen.getByRole('button', { name: 'Ver carritos' })
    await user.click(open)
    expect(screen.getByRole('dialog', { name: 'Tus carritos' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cerrar carrito' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(open).toHaveFocus()
  })
  it.each(['0', 'abc', '-1'])('rechaza el identificador de menú inválido %s', async (id) => {
    mount(`/restaurantes/${id}`)
    expect(await screen.findByRole('alert')).toHaveTextContent('identificador del restaurante no es válido')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
