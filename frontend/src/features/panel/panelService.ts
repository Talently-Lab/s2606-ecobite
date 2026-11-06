import type { OrderInput, PendingConfirmation } from '@/shared/lib/orderDraft'
import { request, type ApiResult } from '@/shared/lib/http'
import type { AdminDashboard, GroupQuote, GroupConfirmation, ConfirmationData } from './types'

export const panelService = {
  quoteGroup: (orders: OrderInput[]) =>
    request<ApiResult<GroupQuote>>('/checkout/cotizar-grupo', { method: 'POST', body: { orders } }),
  createGroup: ({ key, orders, expectedSubtotalCents }: PendingConfirmation) =>
    request<ApiResult<GroupConfirmation>>('/pedidos/grupos', {
      method: 'POST',
      body: { orders, expectedSubtotalCents },
      idempotencyKey: key,
    }),
  groupConfirmation: (id: string) =>
    request<ApiResult<GroupConfirmation>>(`/pedidos/grupos/${encodeURIComponent(id)}/confirmacion`),
  confirmation: (id: number) => request<ApiResult<ConfirmationData>>(`/pedidos/${id}/confirmacion`),
  dashboard: () => request<ApiResult<AdminDashboard>>('/admin/dashboard'),
}
