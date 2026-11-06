import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/features/auth'
import { AppRoutes } from '@/app/router'
import { cartInputs, changeDraftQuantity, getOrders, claimOrderOwner } from '@/shared/lib/orderDraft'
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
const groupId = '11111111-1111-4111-8111-111111111111'
const confirmations = new Map<string, unknown>()
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
function quote(orders: OrderInput[]) {
  const groups = orders.map((order) => {
    const menu = menus[order.restaurantId]!
    const items = order.items.map((item) => {
      const product = menu.dishes.find((dish) => dish.id === item.dishId)!
      return {
        ...item,
        name: product.name,
        unitPrice: product.price,
        subtotal: product.price * item.quantity,
      }
    })
    return {
      restaurantId: order.restaurantId,
      restaurantName: menu.restaurant.name,
      zone: order.zone,
      items,
      subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
      deliveryFee: null,
      total: null,
      environmentalImpact: null,
    }
  })
  return {
    groups,
    subtotal: groups.reduce((sum, group) => sum + group.subtotal, 0),
    deliveryFee: null,
    total: null,
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
  if (url.pathname.endsWith('/checkout/cotizar-grupo'))
    return json({ data: quote(JSON.parse(String(options?.body)).orders) })
  if (url.pathname.endsWith('/pedidos/grupos')) {
    if (failure)
      return json(
        { error: { message: failure === 401 ? 'Sesión vencida' : 'Error interno al crear el pedido' } },
        failure,
      )
    const key = (options?.headers as Record<string, string>)['Idempotency-Key']!
    const previous = confirmations.get(key)
    if (previous) return json({ data: previous }, 201)
    const body = JSON.parse(String(options?.body))
    const data = quote(body.orders)
    if (Math.round(data.subtotal * 100) !== body.expectedSubtotalCents)
      return json(
        {
          error: {
            code: 'PRICE_CHANGED',
            message: 'Los precios cambiaron. Revisá la cotización actualizada.',
          },
        },
        409,
      )
    const result = {
      groupId,
      date: '2026-11-02T12:00:00Z',
      orders: data.groups.map((group, index) => ({
        id: index + 1,
        date: '2026-11-02T12:00:00Z',
        status: 'completed',
        total: group.subtotal,
        restaurant: { id: group.restaurantId, name: group.restaurantName },
        items: group.items,
      })),
      subtotal: data.subtotal,
      environmentalImpact: { co2SavedKg: 0.1 },
      myImpact: { co2SavedKg: 0.1, ordersCount: data.groups.length },
    }
    confirmations.set(key, result)
    if (lostResponse) {
      lostResponse = false
      throw new TypeError('Network disconnected')
    }
    return json({ data: result }, 201)
  }
  if (url.pathname.includes('/pedidos/grupos/') && url.pathname.endsWith('/confirmacion'))
    return json({ data: [...confirmations.values()][0] })
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
  return within(screen.getByRole('complementary', { name: 'Carrito' }))
}
async function signIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Correo electrónico'), 'lucia@mail.com')
  await user.type(screen.getByLabelText('Contraseña'), 'verde2026bici')
  await user.click(screen.getByRole('button', { name: 'Ingresar' }))
}
beforeEach(() => {
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
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Catálogo, carrito agrupado y checkout', () => {
  it('pagina 19 locales de nueve en nueve sin repetir la consulta y conserva el historial', async () => {
    restaurants = Array.from({ length: 19 }, (_, index) => ({
      ...restaurant,
      id: index + 1,
      name: `Local ${index + 1}`,
    }))
    const user = mount('/restaurantes')
    await screen.findByRole('link', { name: 'Local 1' })
    expect(screen.getAllByRole('article')).toHaveLength(9)
    expect(screen.getByText('Mostrando 1–9 de 19 restaurantes')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(screen.getByRole('link', { name: 'Local 10' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Historial atrás' }))
    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(cart().getByText('Tu carrito está vacío.')).toBeInTheDocument()
  })
  it.each(['abc', '-1', '0', '10000'])('corrige pagina=%s y vuelve al inicio al filtrar', async (page) => {
    restaurants = Array.from({ length: 10 }, (_, index) => ({
      ...restaurant,
      id: index + 1,
      name: `Local ${index + 1}`,
    }))
    const user = mount(`/restaurantes?pagina=${page}`)
    await screen.findByText(page === '10000' ? 'Página 2 de 2' : 'Página 1 de 2')
    await user.selectOptions(screen.getByLabelText('Categoría'), 'Bowls')
    expect(await screen.findByText('Página 1 de 2')).toBeInTheDocument()
    expect(screen.getByLabelText('URL actual')).not.toHaveTextContent('pagina=')
  })
  it.each([0, 9, 10])('maneja el límite de nueve con %i restaurantes', async (count) => {
    restaurants = Array.from({ length: count }, (_, index) => ({
      ...restaurant,
      id: index + 1,
      name: `Local ${index + 1}`,
    }))
    mount('/restaurantes')
    if (!count) await screen.findByText('No encontramos restaurantes con estos filtros.')
    else await screen.findByRole('link', { name: 'Local 1' })
    expect(screen.queryAllByRole('article')).toHaveLength(Math.min(9, count))
    expect(screen.queryByRole('navigation', { name: 'Paginación de restaurantes' }) !== null).toBe(count > 9)
  })
  it('mantiene la selección del mapa y permite recuperar el catálogo', async () => {
    const user = mount('/restaurantes?restaurante=2&origen=mapa')
    expect(await screen.findByRole('link', { name: 'Raíz Cocina' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Verde Bowl' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ver todos' }))
    expect(await screen.findByRole('link', { name: 'Verde Bowl' })).toBeInTheDocument()
    expect(screen.getByLabelText('URL actual')).toHaveTextContent('origen=mapa')
  })
  it.each(['999', '0', '-1', 'abc', '1.5', '9007199254740992', ''])(
    'maneja una selección inválida %s',
    async (id) => {
      mount(`/restaurantes?restaurante=${id}`)
      expect(await screen.findByText(/El restaurante seleccionado no está disponible/)).toBeInTheDocument()
    },
  )
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
  it('conserva el carrito en catálogo y otros menús y añade otro restaurante sin reemplazar nada', async () => {
    const user = mount('/restaurantes/1')
    await user.click(await screen.findByRole('button', { name: 'Agregar Bowl quinoa al pedido' }))
    await user.click(screen.getByRole('link', { name: 'Volver a restaurantes' }))
    await screen.findByRole('link', { name: 'Raíz Cocina' })
    expect(cart().getByText('Bowl quinoa')).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Raíz Cocina' }))
    await screen.findByRole('heading', { name: 'Raíz Cocina' })
    expect(cart().getByText('Bowl quinoa')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Agregar Bowl vegetal al pedido' }))
    expect(cartInputs(getOrders())).toHaveLength(2)
    expect(cart().getByRole('button', { name: /^Raíz Cocina/ })).toHaveAttribute('aria-expanded', 'true')
    await user.click(cart().getByRole('button', { name: /^Verde Bowl/ }))
    expect(cart().getByText('Bowl quinoa')).toBeVisible()
    expect(cart().getAllByRole('button', { name: 'Ir a pagar' })).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Ver carrito, 2 productos' })).toBeInTheDocument()
  })
  it('solicita login solo al ir a pagar y conserva los dos restaurantes', async () => {
    changeDraftQuantity(1, restaurant.name, 16, 2)
    changeDraftQuantity(2, second.name, 20, 1)
    const user = mount('/restaurantes')
    await user.click(await cart().findByRole('button', { name: 'Ir a pagar' }))
    await signIn(user)
    expect(await screen.findByText('2 × Bowl quinoa')).toBeInTheDocument()
    expect(screen.getByText('1 × Bowl vegetal')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar pedidos' })).toBeInTheDocument()
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/pedidos/grupos'))).toHaveLength(0)
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
    await user.click(cart().getByRole('button', { name: 'Ir a pagar' }))
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
  it('una confirmación crea el conjunto, vacía lo confirmado y muestra el resumen agrupado', async () => {
    changeDraftQuantity(1, restaurant.name, 16, 2)
    changeDraftQuantity(2, second.name, 20, 1)
    const user = mount('/checkout', true)
    await user.click(await screen.findByRole('button', { name: 'Confirmar pedidos' }))
    expect(await screen.findByRole('heading', { name: '¡Pedidos confirmados!' })).toBeInTheDocument()
    expect(cartInputs(getOrders())).toEqual([])
    expect(confirmations.size).toBe(1)
    expect(screen.getByRole('heading', { name: 'Verde Bowl' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Raíz Cocina' })).toBeInTheDocument()
  })
  it('recupera una respuesta perdida con el mismo identificador incluso después de recargar', async () => {
    lostResponse = true
    changeDraftQuantity(1, restaurant.name, 16, 2)
    const user = mount('/checkout', true)
    await user.click(await screen.findByRole('button', { name: 'Confirmar pedidos' }))
    await screen.findByRole('alert')
    const original = getOrders().pending!
    expect(original).not.toBeNull()
    cleanup()
    const reloaded = mount('/checkout', true)
    await reloaded.click(await screen.findByRole('button', { name: 'Recuperar confirmación' }))
    expect(await screen.findByRole('heading', { name: '¡Pedidos confirmados!' })).toBeInTheDocument()
    const requests = fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/pedidos/grupos'))
    expect(requests).toHaveLength(2)
    expect((requests[0]![1]!.headers as Record<string, string>)['Idempotency-Key']).toBe(
      (requests[1]![1]!.headers as Record<string, string>)['Idempotency-Key'],
    )
    expect(confirmations.size).toBe(1)
  })
  it('revisa precios cambiados antes de aceptar otra confirmación', async () => {
    changeDraftQuantity(1, restaurant.name, 16, 1)
    const user = mount('/checkout', true)
    await screen.findByText('1 × Bowl quinoa')
    menus[1]!.dishes[0] = { ...dish, price: 6000 }
    await user.click(screen.getByRole('button', { name: 'Confirmar pedidos' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Los precios cambiaron')
    expect(getOrders().pending).toBeNull()
    expect(confirmations.size).toBe(0)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Confirmar pedidos' })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: 'Confirmar pedidos' }))
    await screen.findByRole('heading', { name: '¡Pedidos confirmados!' })
  })
  it('retira productos no disponibles al actualizar el catálogo y mantiene el aviso', async () => {
    changeDraftQuantity(1, restaurant.name, 16, 1)
    menus[1]!.dishes = []
    mount('/restaurantes/1')
    await screen.findByText('Este restaurante todavía no tiene platos disponibles.')
    expect(cart().getByText('Tu carrito está vacío.')).toBeInTheDocument()
    expect(cart().getByText(/Quitamos platos que ya no están disponibles/)).toBeInTheDocument()
    expect(cart().getByRole('button', { name: 'Ir a pagar' })).toBeDisabled()
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
    await user.click(await screen.findByRole('button', { name: 'Confirmar pedidos' }))
    await screen.findByLabelText('Correo electrónico')
    expect(getOrders().drafts[1]?.items[16]).toBe(1)
    failure = 0
    await signIn(user)
    expect(await screen.findByText('1 × Bowl quinoa')).toBeInTheDocument()
  })
  it('la barra móvil abre el detalle y devuelve el foco al cerrarlo', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query.includes('max-width'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
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
    const user = mount('/restaurantes')
    const open = screen.getByRole('button', { name: 'Ver carrito' })
    await user.click(open)
    expect(screen.getByRole('dialog', { name: 'Tu carrito' })).toBeInTheDocument()
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
