import isotipo from '@/shared/assets/logo-isotipo.png'
import wordmark from '@/shared/assets/logo-wordmark.png'

interface LogoProps {
  /** Muestra solo la hoja, sin el texto "ecobite". */
  compact?: boolean
  className?: string
}

/** Logo oficial (PNG de Assets de Marca). Decorativo: el link que lo contenga lleva el aria-label. */
export function Logo({ compact = false, className = '' }: LogoProps) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <img src={isotipo} alt="" className="h-10 w-auto" />
      {!compact && <img src={wordmark} alt="" className="h-6.5 w-auto" />}
    </span>
  )
}
