import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider, GuestRoute, useAuth } from '@/features/auth'
import { ROUTES } from '@/shared/config/routes'

/** Página de inicio mínima para verificar redirecciones después de ingresar. */
function HomeProbe() {
  const { usuario } = useAuth()
  return <p>Inicio: {usuario?.nombre ?? 'sin sesión'}</p>
}

/** Renderiza una página dentro de los providers y las rutas reales de auth. */
export function renderAuthRoute(path: string, page: ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <Routes>
            <Route path={ROUTES.home} element={<HomeProbe />} />
            <Route element={<GuestRoute />}>
              <Route path={path} element={page} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    ),
  }
}
