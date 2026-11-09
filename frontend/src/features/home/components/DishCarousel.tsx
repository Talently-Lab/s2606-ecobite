import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FoodImage, formatPrice } from '@/features/catalog'
import { restaurantMenuUrl } from '@/shared/config/routes'
import type { FeaturedDish } from '../types'

export function DishCarousel({ dishes }: { dishes: FeaturedDish[] }) {
  const [active, setActive] = useState(0)
  const reduceMotion = useReducedMotion()
  const selected = dishes[active]!
  const move = (direction: number) =>
    setActive((index) => (index + direction + dishes.length) % dishes.length)

  return (
    <div
      className="dish-carousel"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Platos para descubrir"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          event.currentTarget.focus({ preventScroll: true })
          move(event.key === 'ArrowLeft' ? -1 : 1)
        }
      }}
    >
      <motion.div
        className="dish-carousel-stage"
        drag={dishes.length > 1 ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        dragMomentum={false}
        onDragEnd={(_event, info) => {
          if (Math.abs(info.offset.x) > 40) move(info.offset.x < 0 ? 1 : -1)
        }}
      >
        {dishes.map((dish, index) => {
          let offset = (index - active + dishes.length) % dishes.length
          if (offset > dishes.length / 2) offset -= dishes.length
          const distance = Math.abs(offset)
          return (
            <motion.button
              key={dish.id}
              type="button"
              className="dish-carousel-slide"
              aria-label={`Mostrar ${dish.name}`}
              aria-pressed={index === active}
              aria-hidden={distance > 2}
              tabIndex={-1}
              onTap={() => setActive(index)}
              initial={false}
              style={{ zIndex: 10 - distance, pointerEvents: distance > 2 ? 'none' : 'auto' }}
              animate={{
                x: `${offset * 70}%`,
                rotateY: reduceMotion ? 0 : offset === 0 ? 0 : offset > 0 ? -40 : 40,
                scale: reduceMotion ? 1 : 1 - Math.min(distance, 3) * 0.14,
                opacity: distance > 2 ? 0 : distance === 2 ? 0.5 : 1,
              }}
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 240, damping: 28 }}
            >
              <FoodImage src={dish.imageUrl ?? null} alt={dish.name} />
            </motion.button>
          )
        })}
      </motion.div>
      <div className="dish-carousel-details" aria-live="polite" aria-atomic="true">
        <p>{selected.restaurant.name}</p>
        <h3>{selected.name}</h3>
        <div className="dish-carousel-actions">
          <strong>{formatPrice(selected.price)}</strong>
          <Link
            className="text-link"
            to={restaurantMenuUrl(selected.restaurant.id)}
            aria-label={`Ver menú de ${selected.restaurant.name}`}
          >
            Ver menú <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
      {dishes.length > 1 && (
        <div className="dish-carousel-controls">
          <button type="button" aria-label="Plato anterior" onClick={() => move(-1)}>
            <ArrowLeft size={20} aria-hidden="true" />
          </button>
          <span>
            {active + 1} de {dishes.length}
          </span>
          <button type="button" aria-label="Plato siguiente" onClick={() => move(1)}>
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
