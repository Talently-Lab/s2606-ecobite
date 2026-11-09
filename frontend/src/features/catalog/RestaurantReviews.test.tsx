import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '@/features/auth'
import { ApiError } from '@/shared/lib/http'
import { catalogService } from './catalogService'
import { RestaurantReviews } from './RestaurantReviews'

vi.mock('@/features/auth', () => ({ useAuth: vi.fn() }))
const usuario = { id_usuario: 1, nombre: 'Lucía', email: 'lucia@example.com', rol: 'cliente' as const }
const rating = { id: 1, score: 4, comment: 'Buena comida', createdAt: '2026-11-06T12:00:00Z' }
const summary = { averageScore: 4, totalRatings: 1, ratings: [rating] }

function mount(authenticated = true, role: 'cliente' | 'admin' = 'cliente') {
  vi.mocked(useAuth).mockReturnValue({
    usuario: authenticated ? { ...usuario, rol: role } : null,
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  })
  render(
    <MemoryRouter>
      <RestaurantReviews restaurantId={2} />
    </MemoryRouter>,
  )
  return userEvent.setup()
}

beforeEach(() => {
  vi.spyOn(catalogService, 'ratings').mockResolvedValue({ message: 'OK', data: summary })
  vi.spyOn(catalogService, 'createRating').mockResolvedValue({ message: 'OK', data: rating })
})
afterEach(() => vi.restoreAllMocks())

describe('RestaurantReviews', () => {
  it('muestra reseñas públicas y pide sesión antes de mostrar el formulario', async () => {
    const user = mount(false)
    expect(await screen.findByText('Buena comida')).toBeInTheDocument()
    expect(screen.getByText('4 de 5 · 1 valoración')).toBeInTheDocument()
    expect(screen.getByText('Escribir reseña').closest('details')).not.toHaveAttribute('open')
    await user.click(screen.getByText('Escribir reseña'))
    expect(screen.getByText('Escribir reseña').closest('details')).toHaveAttribute('open')
    expect(screen.getByRole('link', { name: 'Iniciá sesión' })).toHaveAttribute('href', '/login')
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(catalogService.createRating).not.toHaveBeenCalled()
  })

  it('envía estrellas y comentario una sola vez y actualiza el listado al guardar', async () => {
    let resolve: (value: { message: string; data: typeof rating }) => void = () => {}
    vi.mocked(catalogService.createRating).mockReturnValue(
      new Promise((done) => {
        resolve = done
      }),
    )
    const user = mount()
    await screen.findByText('Buena comida')
    expect(screen.getByText('Escribir reseña').closest('details')).not.toHaveAttribute('open')
    await user.click(screen.getByText('Escribir reseña'))
    expect(screen.getByRole('button', { name: 'Publicar valoración' })).toBeDisabled()
    await user.click(screen.getByRole('radio', { name: '4 estrellas' }))
    await user.type(screen.getByLabelText('Comentario (opcional)'), '  Buena comida  ')
    await user.click(screen.getByRole('button', { name: 'Publicar valoración' }))
    expect(screen.getByRole('button', { name: 'Guardando valoración…' })).toBeDisabled()
    expect(catalogService.createRating).toHaveBeenCalledExactlyOnceWith(2, {
      score: 4,
      comment: 'Buena comida',
    })
    await act(async () => {
      resolve({ message: 'OK', data: rating })
    })
    expect(await screen.findByText('¡Gracias! Tu valoración se guardó.')).toBeInTheDocument()
    await waitFor(() => expect(catalogService.ratings).toHaveBeenCalledTimes(2))
  })

  it('muestra el rechazo de la API si no hay pedido completado y conserva lo escrito', async () => {
    vi.mocked(catalogService.createRating).mockRejectedValue(
      new ApiError(403, 'Debes tener un pedido completado en este restaurante para valorarlo'),
    )
    const user = mount()
    await user.click(screen.getByText('Escribir reseña'))
    await user.click(screen.getByRole('radio', { name: '3 estrellas' }))
    await user.type(screen.getByLabelText('Comentario (opcional)'), 'Mi reseña')
    await user.click(screen.getByRole('button', { name: 'Publicar valoración' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('pedido completado')
    expect(screen.getByLabelText('Comentario (opcional)')).toHaveValue('Mi reseña')
    expect(screen.getByRole('radio', { name: '3 estrellas' })).toBeChecked()
    expect(screen.queryByText('¡Gracias! Tu valoración se guardó.')).not.toBeInTheDocument()
  })

  it('no intenta editar ni precargar una valoración que ya existe', async () => {
    vi.mocked(catalogService.createRating).mockRejectedValue(
      new ApiError(409, 'Ya tienes una valoración para este restaurante'),
    )
    const user = mount()
    await user.click(screen.getByText('Escribir reseña'))
    await user.click(screen.getByRole('radio', { name: '5 estrellas' }))
    await user.click(screen.getByRole('button', { name: 'Publicar valoración' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Ya tienes una valoración')
    expect(screen.getByRole('button', { name: 'Publicar valoración' })).toBeDisabled()
    expect(catalogService.createRating).toHaveBeenCalledExactlyOnceWith(2, { score: 5, comment: null })
  })

  it('muestra un estado vacío breve sin restricciones internas para otros roles', async () => {
    vi.mocked(catalogService.ratings).mockResolvedValue({
      message: 'OK',
      data: { averageScore: 0, totalRatings: 0, ratings: [] },
    })
    mount(true, 'admin')
    await screen.findByText('Todavía no hay valoraciones.')
    expect(screen.queryByText('Escribir reseña')).not.toBeInTheDocument()
    expect(screen.queryByText(/cuentas de cliente/)).not.toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('permite reintentar la consulta de reseñas sin bloquear los platos', async () => {
    vi.mocked(catalogService.ratings).mockRejectedValueOnce(new Error('No pudimos cargar las reseñas.'))
    const user = mount(false)
    await user.click(await screen.findByRole('button', { name: 'Reintentar reseñas' }))
    expect(await screen.findByText('Buena comida')).toBeInTheDocument()
  })
})
