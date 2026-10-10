import { Check } from 'lucide-react'

const BENEFITS = [
  'Historial de pedidos con su impacto',
  'Tus datos de entrega listos para el próximo pedido',
  'Tu total de CO₂ ahorrado',
]

export function RegisterBenefits() {
  return (
    <ul className="flex flex-col gap-3 pt-2 text-[15px]">
      {BENEFITS.map((text) => (
        <li key={text} className="flex items-center gap-2.5">
          <span className="flex size-8 flex-none items-center justify-center rounded-full bg-brote text-noche">
            <Check className="size-4" strokeWidth={2.5} aria-hidden="true" />
          </span>
          {text}
        </li>
      ))}
    </ul>
  )
}
