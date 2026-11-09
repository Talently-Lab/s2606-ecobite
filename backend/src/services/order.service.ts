import prisma from "../config/db";
import { ORDER_STATUS } from "../constants/order-status";
import { CheckoutService, reviewedDelivery } from "./checkout.service";
import type { DeliveryDestination } from "./delivery.service";
import type { CheckoutQuoteDto } from "../types/checkout.types";

export interface CreateOrderInput {
  restaurantId: number;
  destination: DeliveryDestination;
  items: Array<{ dishId: number; quantity: number }>;
  reviewedQuote: CheckoutQuoteDto;
}
export class OrderServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly quote?: CheckoutQuoteDto,
  ) {
    super(message);
  }
}
export function assertReviewedQuote(
  reviewed: unknown,
  current: CheckoutQuoteDto,
) {
  const value = reviewed as CheckoutQuoteDto | null;
  if (
    !value ||
    value.restaurantId !== current.restaurantId ||
    value.subtotal !== current.subtotal ||
    value.total !== current.total ||
    value.deliveryFee !== current.deliveryFee ||
    value.distanceKm !== current.distanceKm ||
    value.environmentalImpact?.co2SavedKg !==
      current.environmentalImpact.co2SavedKg ||
    value.methodology !== current.methodology ||
    value.destination?.latitude !== current.destination.latitude ||
    value.destination?.longitude !== current.destination.longitude ||
    value.destination?.label !== current.destination.label ||
    !Array.isArray(value.items) ||
    value.items.length !== current.items.length ||
    current.items.some(
      (item) =>
        !value.items.some(
          (old) =>
            old?.dishId === item.dishId &&
            old.quantity === item.quantity &&
            old.unitPrice === item.unitPrice &&
            old.subtotal === item.subtotal,
        ),
    )
  ) {
    throw new OrderServiceError(
      409,
      "QUOTE_CHANGED",
      "La cotización cambió. Revisá los precios, la distancia y el impacto antes de confirmar.",
      current,
    );
  }
}
export const orderService = {
  async createOrder(userId: number, input: CreateOrderInput) {
    if (!Number.isSafeInteger(userId) || userId <= 0)
      throw new OrderServiceError(
        401,
        "INVALID_TOKEN",
        "El usuario autenticado no es válido",
      );
    const service = new CheckoutService();
    // All provider requests finish before opening the database transaction.
    const quote = await service.quote(input, prisma, reviewedDelivery(input));
    assertReviewedQuote(input.reviewedQuote, quote);
    return prisma.$transaction(
      async (tx) => {
        const current = await service.quote(input, tx, {
          distanceKm: quote.distanceKm,
          co2SavedKg: quote.environmentalImpact.co2SavedKg,
          methodology: quote.methodology,
        });
        assertReviewedQuote(input.reviewedQuote, current);
        const restaurant = await tx.restaurantes.findUniqueOrThrow({
          where: { id_restaurante: input.restaurantId },
        });
        const order = await tx.pedidos.create({
          data: {
            id_usuario_cliente: userId,
            id_restaurante: input.restaurantId,
            fecha_pedido: new Date(),
            estado_simulado: ORDER_STATUS.COMPLETED,
            total: current.total,
            co2_total_ahorrado: current.environmentalImpact.co2SavedKg,
            transporte_sin_emision: "bike",
            zona: "ruta",
            distancia_km: current.distanceKm,
            detalle_pedidos: {
              create: current.items.map((item) => ({
                id_platillo: item.dishId,
                cantidad: item.quantity,
                precio_unitario: item.unitPrice,
                co2_subtotal: 0,
                tipo_envase: restaurant.envase_biodegradable
                  ? "biodegradable"
                  : "plastico",
              })),
            },
            metricas_impacto: {
              create: {
                id_usuario: userId,
                co2_evitado_kg: current.environmentalImpact.co2SavedKg,
                fecha_calculo: new Date(),
              },
            },
          },
          include: { detalle_pedidos: true },
        });
        return order;
      },
      { isolationLevel: "Serializable" },
    );
  },
};
