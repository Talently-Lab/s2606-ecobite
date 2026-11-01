import { request } from '@/shared/lib/http'
import type { AdminDashboard, ApiResult, CheckoutQuote, CheckoutRequest, ConfirmationData } from './types'

export const panelService = {
  quote: (payload: CheckoutRequest) =>
    request<ApiResult<CheckoutQuote>>('/checkout/cotizar', { method: 'POST', body: payload }),
  createOrder: (payload: CheckoutRequest) =>
    request<ApiResult<ConfirmationData>>('/pedidos', { method: 'POST', body: payload }),
  confirmation: (id: number) => request<ApiResult<ConfirmationData>>(`/pedidos/${id}/confirmacion`),
  dashboard: () => request<ApiResult<AdminDashboard>>('/admin/dashboard'),
}
