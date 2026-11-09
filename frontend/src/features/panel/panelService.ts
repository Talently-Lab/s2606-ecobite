import type { OrderInput } from '@/shared/lib/orderDraft'
import { request, type ApiResult } from '@/shared/lib/http'
import type { AdminDashboard, CheckoutQuote, ConfirmationData } from './types'

export const panelService = {
  quote: (order: OrderInput) =>
    request<ApiResult<CheckoutQuote>>('/checkout/cotizar', {
      method: 'POST',
      body: order,
      signal: AbortSignal.timeout(15000),
    }),
  createOrder: (order: OrderInput, reviewedQuote: CheckoutQuote) =>
    request<ApiResult<ConfirmationData>>('/pedidos', { method: 'POST', body: { ...order, reviewedQuote } }),
  confirmation: (id: number) => request<ApiResult<ConfirmationData>>(`/pedidos/${id}/confirmacion`),
  dashboard: () => request<ApiResult<AdminDashboard>>('/admin/dashboard'),
}
