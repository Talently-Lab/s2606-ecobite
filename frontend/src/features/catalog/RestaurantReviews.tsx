import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { Alert, Button } from '@/shared/components/ui'
import { ApiError } from '@/shared/lib/http'
import { restaurantMenuUrl, ROUTES } from '@/shared/config/routes'
import { catalogService } from './catalogService'
import type { RestaurantRatings } from './types'
import './restaurant-reviews.css'

export function RestaurantReviews({ restaurantId }: { restaurantId: number }) {
  const { usuario, loading } = useAuth()
  const [result, setResult] = useState<{ data?: RestaurantRatings; error?: string } | null>(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    catalogService.ratings(restaurantId).then(
      ({ data }) => {
        if (active) setResult({ data })
      },
      (reason: unknown) => {
        if (active)
          setResult({ error: reason instanceof Error ? reason.message : 'No pudimos cargar las reseñas.' })
      },
    )
    return () => {
      active = false
    }
  }, [restaurantId, attempt])

  return (
    <section id="valoraciones" aria-labelledby="reviews-title" className="restaurant-reviews">
      <header>
        <h2 id="reviews-title" className="font-display text-2xl font-semibold">
          Valoraciones y reseñas
        </h2>
        {result?.data && (
          <p className="rating-summary">
            <Star size={20} aria-hidden="true" />
            {result.data.totalRatings
              ? `${result.data.averageScore.toLocaleString('es-AR', { maximumFractionDigits: 1 })} de 5 · ${result.data.totalRatings} ${result.data.totalRatings === 1 ? 'valoración' : 'valoraciones'}`
              : 'Todavía no hay valoraciones.'}
          </p>
        )}
      </header>
      {!result && <p role="status">Cargando reseñas…</p>}
      {result?.error && (
        <div className="space-y-3">
          <Alert>{result.error}</Alert>
          <Button
            type="button"
            onClick={() => {
              setResult(null)
              setAttempt((value) => value + 1)
            }}
          >
            Reintentar reseñas
          </Button>
        </div>
      )}
      {!!result?.data?.ratings.length && (
        <ul className="restaurant-review-list">
          {result.data.ratings.map((rating) => (
            <li key={rating.id}>
              <p className="rating-summary">
                <Star size={16} aria-hidden="true" />
                <strong>{rating.score} de 5</strong>
                <time dateTime={rating.createdAt}>
                  {new Date(rating.createdAt).toLocaleDateString('es-AR')}
                </time>
              </p>
              {rating.comment && <p className="whitespace-pre-wrap break-words">{rating.comment}</p>}
            </li>
          ))}
        </ul>
      )}
      {!loading && (!usuario || usuario.rol === 'cliente') && (
        <details className="review-composer">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold text-bosque">
            Escribir reseña
          </summary>
          {!usuario ? (
            <p>
              <Link
                className="underline"
                to={ROUTES.login}
                state={{ from: `${restaurantMenuUrl(restaurantId)}#valoraciones` }}
              >
                Iniciá sesión
              </Link>{' '}
              para valorar después de completar un pedido en este restaurante.
            </p>
          ) : (
            <RatingForm
              key={usuario.id_usuario}
              restaurantId={restaurantId}
              onCreated={() => setAttempt((value) => value + 1)}
            />
          )}
        </details>
      )}
    </section>
  )
}

function RatingForm({ restaurantId, onCreated }: { restaurantId: number; onCreated: () => void }) {
  const [score, setScore] = useState(0)
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [existing, setExisting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const busy = useRef(false)

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy.current || score < 1 || score > 5 || done || existing) return
    busy.current = true
    setSending(true)
    setError(null)
    try {
      await catalogService.createRating(restaurantId, { score, comment: comment.trim() || null })
      setDone(true)
      onCreated()
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 409) setExisting(true)
      setError(reason instanceof Error ? reason.message : 'No pudimos guardar tu valoración.')
    } finally {
      busy.current = false
      setSending(false)
    }
  }

  if (done)
    return (
      <p role="status" className="rounded-xl bg-niebla p-4">
        ¡Gracias! Tu valoración se guardó.
      </p>
    )
  return (
    <form onSubmit={(event) => void submit(event)} className="rating-form">
      <p>Podés dejar una reseña después de completar un pedido en este restaurante.</p>
      <fieldset disabled={sending || existing}>
        <legend className="font-semibold">Tu puntuación</legend>
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value}>
              <input
                className="sr-only"
                type="radio"
                name="score"
                value={value}
                checked={score === value}
                onChange={() => setScore(value)}
                required
              />
              <Star size={28} fill={value <= score ? 'currentColor' : 'none'} aria-hidden="true" />
              <span className="sr-only">
                {value} {value === 1 ? 'estrella' : 'estrellas'}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="grid gap-2">
        Comentario (opcional)
        <textarea
          className="rounded-xl border border-borde bg-white p-3"
          rows={3}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          disabled={sending || existing}
        />
      </label>
      {error && <Alert>{error}</Alert>}
      <Button type="submit" disabled={!score || sending || existing}>
        {sending ? 'Guardando valoración…' : 'Publicar valoración'}
      </Button>
    </form>
  )
}
