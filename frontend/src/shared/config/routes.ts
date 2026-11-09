/** Rutas centralizadas de la aplicación. */
export const ROUTES = {
  home: '/',
  map: '/mapa',
  login: '/login',
  register: '/registro',
  restaurants: '/restaurantes',
  restaurantMenu: '/restaurantes/:id',
  checkout: '/checkout',
  orderConfirmation: '/pedidos/:id/confirmacion',
  impact: '/impacto',
  admin: '/admin',
  methodology: '/como-calculamos-co2',
  join: '/suma-tu-local',
  contact: '/contacto',
} as const

export const restaurantMenuUrl = (id: number) => `${ROUTES.restaurants}/${id}`

export const selectedRestaurantUrl = (id: number) => `${ROUTES.restaurants}?restaurante=${id}`

export const checkoutUrl = (restaurantId: number) => `${ROUTES.checkout}?restaurante=${restaurantId}`
