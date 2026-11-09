import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert } from '@/shared/components/ui'
import { ROUTES } from '@/shared/config/routes'
import type { FeaturedDish } from '../types'
import { DishCarousel } from './DishCarousel'

export function FeaturedDishes({
  dishes,
  loading,
  error,
}: {
  dishes: FeaturedDish[]
  loading: boolean
  error: string | null
}) {
  const names = new Set<string>()
  const selection = dishes
    .filter(({ name }) => {
      const key = name.trim().toLocaleLowerCase('es').replace(/\s+/g, ' ')
      if (names.has(key)) return false
      names.add(key)
      return true
    })
    .slice(0, 6)

  return (
    <section id="opciones" className="home-featured" aria-labelledby="featured-title" tabIndex={-1}>
      <div className="eco-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">OPCIONES PARA DESCUBRIR</span>
            <h2 id="featured-title">Tu próximo plato empieza acá.</h2>
            <p>Explorá opciones de los restaurantes de Ecobite.</p>
          </div>
        </div>
        {loading ? (
          <p role="status">Cargando platos…</p>
        ) : error ? (
          <Alert>{error}</Alert>
        ) : selection.length ? (
          <DishCarousel key={selection.map(({ id }) => id).join(',')} dishes={selection} />
        ) : (
          <p>No hay platos para mostrar en este momento. Podés consultar los restaurantes.</p>
        )}
        <Link className="text-link home-featured-link" to={ROUTES.restaurants}>
          Ver todos los restaurantes <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
