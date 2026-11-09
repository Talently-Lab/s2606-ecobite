import { lazy, Suspense, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, ArrowDown, ArrowUpRight, Bike, Leaf } from 'lucide-react'
import { SiteHeader } from '@/shared/components/SiteHeader'
import { SiteFooter } from '@/shared/components/SiteFooter'
import { ROUTES } from '@/shared/config/routes'
import bowl from '@/shared/assets/hero-bowl.webp'
import avocado from '@/shared/assets/ingredient-avocado.webp'
import tomato from '@/shared/assets/ingredient-tomato.webp'
import leaf from '@/shared/assets/ingredient-leaf.webp'
import { useHome } from '../hooks/useHome'
import { FeaturedDishes } from '../components/FeaturedDishes'

const HomeMotion = lazy(() => import('../homeMotion').catch(() => ({ default: () => null })))

export function HomePage() {
  const { data, loading, error } = useHome()
  const scope = useRef<HTMLDivElement>(null)
  return (
    <div ref={scope}>
      <Suspense fallback={null}>
        <HomeMotion scope={scope} />
      </Suspense>
      <SiteHeader />
      <main>
        <div className="home-discovery">
          <section className="home-hero" aria-labelledby="hero-title">
            <div className="hero-inner">
              <div className="hero-copy">
                <h1 id="hero-title" className="hero-enter">
                  Encontrá dónde comer.
                </h1>
                <p className="hero-enter">
                  Elegí restaurantes con delivery sustentable y conocé el CO₂ estimado que evitás con cada
                  pedido.
                </p>
                <div className="hero-actions hero-enter">
                  <a href="#opciones" className="eco-button" data-discover-link>
                    Ver opciones <ArrowDown size={20} aria-hidden="true" />
                  </a>
                  <Link to={ROUTES.map} className="eco-button hero-map-button">
                    Explorar el mapa <MapPin size={20} aria-hidden="true" />
                  </Link>
                </div>
              </div>
              <div className="hero-art">
                <div className="hero-orbit" aria-hidden="true" />
                <span className="hero-art-label" aria-hidden="true">
                  BUENA COMIDA, BUENAS DECISIONES
                </span>
                <img
                  className="hero-bowl"
                  src={bowl}
                  alt="Bowl de vegetales frescos, quinoa y palta, imagen de marca Ecobite"
                  width="900"
                  height="900"
                  fetchPriority="high"
                />
                <img
                  className="ingredient ingredient-avocado"
                  src={avocado}
                  alt=""
                  width="200"
                  height="200"
                />
                <img className="ingredient ingredient-tomato" src={tomato} alt="" width="160" height="160" />
                <img className="ingredient ingredient-leaf" src={leaf} alt="" width="160" height="160" />
                <span className="hero-stamp">
                  Mucho sabor.
                  <br />
                  <em>Mejor elección.</em>
                  <Leaf size={24} aria-hidden="true" />
                </span>
              </div>
            </div>
          </section>
          <FeaturedDishes dishes={data?.featuredDishes ?? []} loading={loading} error={error} />
        </div>
        <section className="home-impact" aria-labelledby="home-impact-title">
          <div className="eco-section">
            <div className="section-heading">
              <h2 id="home-impact-title">Qué cambia con tu pedido</h2>
            </div>
            <div className="home-impact-grid">
              <article>
                <Leaf size={28} aria-hidden="true" />
                <h3>Envases identificados por local</h3>
                <p>En cada restaurante podés consultar si utiliza envases biodegradables antes de elegir.</p>
              </article>
              <article>
                <Bike size={28} aria-hidden="true" />
                <h3>Una estimación del transporte</h3>
                <p>
                  Al confirmar tu destino, estimamos el CO₂ del traslado en bici frente a un auto a nafta. No
                  representa la huella total de la comida ni confirma la cobertura de entrega.
                </p>
              </article>
            </div>
            <Link to={ROUTES.methodology} className="text-link">
              Conocé cómo lo calculamos <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
