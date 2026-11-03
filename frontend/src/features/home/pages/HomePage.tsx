import { lazy, Suspense, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUpRight, Bike, Leaf, ShoppingBag } from 'lucide-react'
import { SiteHeader } from '@/shared/components/SiteHeader'
import { SiteFooter } from '@/shared/components/SiteFooter'
import { ROUTES } from '@/shared/config/routes'
import bowl from '@/shared/assets/hero-bowl.webp'
import avocado from '@/shared/assets/ingredient-avocado.webp'
import tomato from '@/shared/assets/ingredient-tomato.webp'
import leaf from '@/shared/assets/ingredient-leaf.webp'
import { useHome } from '../hooks/useHome'
import { RestaurantMap } from '../components/RestaurantMap'

const HomeMotion = lazy(() => import('../homeMotion').catch(() => ({ default: () => null })))

export function HomePage() {
  const { data, loading, error } = useHome()
  const scope = useRef<HTMLDivElement>(null)
  const restaurants = data?.restaurants ?? []
  const steps = [
    {
      title: 'Elegí un local eco',
      description: 'Explorá los restaurantes disponibles y conocé sus opciones.',
      icon: ShoppingBag,
    },
    {
      title: 'Pedí como siempre',
      description: 'Armá tu pedido y confirmalo en un par de clics.',
      icon: Bike,
    },
    { title: 'Mirá tu impacto', description: 'Conocé el CO₂ ahorrado con tus pedidos.', icon: Leaf },
  ]
  return (
    <div ref={scope}>
      <Suspense fallback={null}>
        <HomeMotion scope={scope} />
      </Suspense>
      <SiteHeader />
      <main>
        <div className="home-portal" tabIndex={-1}>
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
                  <Link to={ROUTES.restaurants} className="eco-button">
                    Ver restaurantes <ArrowUpRight size={20} aria-hidden="true" />
                  </Link>
                  <a href="#mapa" className="eco-button hero-map-button" data-map-link>
                    Explorar el mapa <ArrowDown size={20} aria-hidden="true" />
                  </a>
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
          <section id="mapa" className="portal-map" tabIndex={-1} aria-label="Mapa de restaurantes">
            <RestaurantMap restaurants={restaurants} loading={loading} error={error} />
          </section>
        </div>
        <div className="values-strip" aria-label="Nuestra propuesta">
          <span>COMIDA CON PROPÓSITO</span>
          <Leaf aria-hidden="true" />
          <span>SABOR QUE SUMA</span>
          <Leaf aria-hidden="true" />
          <span>PEQUEÑAS DECISIONES, GRAN CAMBIO</span>
        </div>
        <section className="how-section">
          <div className="eco-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">ASÍ DE SIMPLE</span>
                <h2>Pedir rico y cuidar el planeta es igual de fácil</h2>
              </div>
            </div>
            <div className="steps-grid">
              {steps.map((step, index) => (
                <article className="step-card" key={step.title}>
                  <div className="step-top">
                    <span>0{index + 1}</span>
                    <step.icon size={30} aria-hidden="true" />
                  </div>
                  <h3>
                    {index + 1}. {step.title}
                  </h3>
                  <p>{data?.howItWorks[index]?.description ?? step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        {typeof data?.communityImpact?.co2SavedKg === 'number' && (
          <section className="community-banner">
            <Leaf size={36} aria-hidden="true" />
            <span className="eyebrow">CADA ELECCIÓN SUMA</span>
            <h2>{data.communityImpact.co2SavedKg.toLocaleString('es-AR')} kg de CO₂</h2>
            <p>Ahorrados entre quienes elegimos Ecobite.</p>
            <Link to={ROUTES.methodology} className="eco-button">
              Conocé cómo lo calculamos <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
