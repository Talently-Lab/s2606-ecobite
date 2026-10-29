/** Rutas centralizadas de la aplicación. */
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/registro',
  restaurants: '/restaurantes',
  restaurantMenu: '/restaurantes/:id',
  checkout: '/checkout',
  methodology: '/como-calculamos-co2',
  join: '/suma-tu-local',
  contact: '/contacto',
} as const

export const restaurantMenuUrl = (id: number) => `${ROUTES.restaurants}/${id}`
