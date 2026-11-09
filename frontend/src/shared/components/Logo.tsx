import isotipo from '@/shared/assets/logo-isotipo.webp'
import wordmark from '@/shared/assets/logo-wordmark.webp'

interface LogoProps {
  /** Muestra solo la hoja, sin el texto "ecobite". */
  compact?: boolean
  className?: string
}

/** Logo oficial optimizado. Decorativo: el link que lo contenga lleva el aria-label. */
export function Logo({ compact = false, className = '' }: LogoProps) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <img src={isotipo} alt="" width="104" height="120" className="h-10 w-auto" />
      {!compact && <img src={wordmark} alt="" width="365" height="78" className="h-6.5 w-auto" />}
    </span>
  )
}
