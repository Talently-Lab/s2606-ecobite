import { useRef, useState } from 'react'
import { Button, TextField } from '@/shared/components/ui'
import { formatPrice } from '@/features/catalog'
import paypalLogo from './assets/paypal.png'
import visaLogo from './assets/visa.svg'
import mastercardLogo from './assets/mastercard.svg'

export type PaymentMethod = 'card' | 'paypal'

export function PaymentForm({
  amount,
  restaurantName,
  submitting,
  loading = false,
  loadingLabel = 'Actualizando precios…',
  onPay,
}: {
  amount: number
  restaurantName: string
  submitting: boolean
  loading?: boolean
  loadingLabel?: string
  onPay: (method: PaymentMethod) => void
}) {
  const [method, setMethod] = useState<PaymentMethod>('card')
  const paypalDialog = useRef<HTMLDialogElement>(null)
  const form = useRef<HTMLFormElement>(null)

  return (
    <section className="space-y-5 rounded-2xl border border-borde bg-white p-6">
      <h2 className="font-display text-xl font-semibold">Método de pago</h2>
      <p className="text-sm text-musgo">Demo · No se realizan cobros. Usá datos ficticios.</p>
      <form
        ref={form}
        noValidate
        autoComplete="off"
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault()
          if (submitting || loading) return
          if (method === 'paypal') paypalDialog.current?.showModal()
          else onPay('card')
        }}
      >
        <fieldset disabled={submitting || loading} className="space-y-4">
          <legend className="sr-only">Elegí cómo pagar</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex min-h-20 cursor-pointer flex-wrap items-center gap-3 rounded-xl border border-borde p-4 has-checked:border-bosque has-checked:bg-niebla">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={method === 'card'}
                onChange={() => setMethod('card')}
                className="size-4 accent-bosque"
              />
              <span className="font-semibold">Tarjeta</span>
              <span className="ml-auto flex items-center gap-3" aria-hidden="true">
                <img src={visaLogo} alt="" className="h-5 w-12 object-contain" />
                <img src={mastercardLogo} alt="" className="h-7 w-10 object-contain" />
              </span>
            </label>
            <label className="flex min-h-20 cursor-pointer items-center gap-3 rounded-xl border border-borde p-4 has-checked:border-bosque has-checked:bg-niebla">
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={method === 'paypal'}
                onChange={() => setMethod('paypal')}
                className="size-4 accent-bosque"
                aria-label="PayPal"
              />
              <img src={paypalLogo} alt="" className="h-7 w-28 object-contain" />
            </label>
          </div>
          {method === 'card' ? (
            <div className="space-y-4">
              {/* shortcut: campos decorativos sin validación ni lectura; sustituir por campos del proveedor al integrar pagos reales. */}
              <TextField label="Número de tarjeta" placeholder="1234 5678 9012 3456" />
              <div className="grid grid-cols-2 gap-4">
                <TextField label="Vencimiento" placeholder="MM/AA" />
                <TextField label="Código de seguridad" type="password" placeholder="123" />
              </div>
              <TextField label="Nombre del titular" placeholder="Como aparece en la tarjeta" />
            </div>
          ) : (
            <p className="text-sm text-musgo">Autorizá el pago en la ventana de demostración de PayPal.</p>
          )}
        </fieldset>
        <Button
          type="submit"
          loading={submitting}
          disabled={loading}
          className="w-full"
          style={method === 'paypal' ? { backgroundColor: '#ffc439', color: '#003087' } : undefined}
        >
          {loading
            ? loadingLabel
            : submitting
              ? 'Procesando pago…'
              : method === 'card'
                ? `Pagar ${formatPrice(amount)}`
                : 'Continuar con PayPal'}
        </Button>
      </form>
      <dialog
        ref={paypalDialog}
        aria-labelledby="paypal-title"
        className="m-auto w-[calc(100%_-_2rem)] max-w-md space-y-6 rounded-3xl bg-white p-6 text-tinta backdrop:bg-black/40"
        onClose={() => form.current?.querySelector<HTMLButtonElement>('button[type="submit"]')?.focus()}
      >
        <img src={paypalLogo} alt="PayPal" className="mx-auto h-8 w-32 object-contain" />
        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold text-musgo">MODO DEMOSTRACIÓN</p>
          <h2 id="paypal-title" className="text-xl font-semibold">
            Autorizá tu pago a EcoBite
          </h2>
          <p>{restaurantName}</p>
          <p className="text-3xl font-semibold">{formatPrice(amount)} ARS</p>
          <p className="text-sm text-musgo">No se solicitarán credenciales ni se realizará un cobro.</p>
        </div>
        <Button
          type="button"
          className="w-full"
          style={{ backgroundColor: '#ffc439', color: '#003087' }}
          disabled={submitting}
          onClick={() => {
            paypalDialog.current?.close()
            onPay('paypal')
          }}
        >
          Autorizar pago
        </Button>
        <button
          type="button"
          className="min-h-11 w-full text-sm underline"
          onClick={() => paypalDialog.current?.close()}
        >
          Volver al pedido
        </button>
      </dialog>
    </section>
  )
}
