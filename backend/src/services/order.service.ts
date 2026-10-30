import prisma from "../config/db";
import { ZONE_DISTANCES_KM } from "../config/zone-distances";
import { ORDER_STATUS } from "../constants/order-status";


export interface CreateOrderInput {
  restaurantId: number;
  zone: string;
  items: Array<{
    dishId: number;
    quantity: number;
  }>;
}

export class OrderServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "OrderServiceError";
  }
}

const roundToTwo = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const orderService = {
  async createOrder(userId: number, input: CreateOrderInput) {
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      throw new OrderServiceError(
        401,
        "INVALID_TOKEN",
        "El usuario autenticado no es válido"
      );
    }

    if (
      !Number.isSafeInteger(input.restaurantId) ||
      input.restaurantId <= 0
    ) {
      throw new OrderServiceError(
        400,
        "INVALID_RESTAURANT_ID",
        "El restaurante indicado no es válido"
      );
    }

    const zone = input.zone?.trim().toLowerCase();

    if (!zone || zone.length > 50) {
      throw new OrderServiceError(
        400,
        "INVALID_ZONE",
        "La zona es obligatoria y debe tener como máximo 50 caracteres"
      );
    }

    if (
      !Array.isArray(input.items) ||
      input.items.length === 0 ||
      input.items.some(
        (item) =>
          !Number.isSafeInteger(item.dishId) ||
          item.dishId <= 0 ||
          !Number.isSafeInteger(item.quantity) ||
          item.quantity <= 0
      )
    ) {
      throw new OrderServiceError(
        400,
        "INVALID_ITEMS",
        "El pedido debe incluir platillos con identificadores y cantidades válidos"
      );
    }

    const dishIds = input.items.map((item) => item.dishId);

    if (new Set(dishIds).size !== dishIds.length) {
      throw new OrderServiceError(
        400,
        "DUPLICATE_ITEMS",
        "Cada platillo debe aparecer una sola vez en la lista"
      );
    }

    return prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurantes.findFirst({
        where: {
          id_restaurante: input.restaurantId,
          activo: true,
        },
        select: {
          id_restaurante: true,
          envase_biodegradable: true,
        },
      });

      if (!restaurant) {
        throw new OrderServiceError(
          404,
          "RESTAURANT_NOT_FOUND",
          "El restaurante no existe o no está disponible"
        );
      }

      const dishes = await tx.platillos.findMany({
        where: {
          id_platillo: { in: dishIds },
          id_restaurante: restaurant.id_restaurante,
          disponible: true,
        },
        select: {
          id_platillo: true,
          nombre: true,
          precio: true,
          co2_ahorrado_unit: true,
        },
      });

      if (dishes.length !== dishIds.length) {
        throw new OrderServiceError(
          400,
          "INVALID_DISHES",
          "Uno o más platillos no están disponibles o no pertenecen al restaurante"
        );
      }

      const averageDistance = ZONE_DISTANCES_KM[zone];

      if (averageDistance === undefined) {
        throw new OrderServiceError(
          400,
          "INVALID_ZONE",
          "La zona indicada no está configurada para la simulación"
        );
      }

      const dishesById = new Map(
        dishes.map((dish) => [dish.id_platillo, dish])
      );

      const items = input.items.map((item) => {
        const dish = dishesById.get(item.dishId);

        if (!dish) {
          throw new OrderServiceError(
            400,
            "INVALID_DISHES",
            "No se pudo validar uno de los platillos"
          );
        }

        const unitPrice = Number(dish.precio);
        const co2SavedPerUnit = Number(dish.co2_ahorrado_unit);

        if (!Number.isFinite(co2SavedPerUnit) || co2SavedPerUnit < 0) {
          throw new OrderServiceError(
            422,
            "INVALID_ENVIRONMENTAL_VALUE",
            "Uno de los platillos tiene un valor ambiental inválido"
          );
        }

        const co2SubtotalCents =
          Math.round(co2SavedPerUnit * 100) * item.quantity;

        return {
          id_platillo: dish.id_platillo,
          cantidad: item.quantity,
          precio_unitario: unitPrice,
          subtotalCents: Math.round(unitPrice * 100) * item.quantity,
          co2SubtotalCents,
        };
      });

      const totalCents = items.reduce(
        (sum, item) => sum + item.subtotalCents,
        0
      );

      const co2TotalCents = items.reduce(
        (sum, item) => sum + item.co2SubtotalCents,
        0
      );

      if (
          !Number.isSafeInteger(co2TotalCents) ||
          co2TotalCents > 99_999_999
      ) {
          throw new OrderServiceError(
            422,
            "INVALID_ENVIRONMENTAL_TOTAL",
            "El impacto ambiental total supera el límite permitido"
          );
        }

      const packagingType = restaurant.envase_biodegradable
            ? "biodegradable"
            : "plastico";

      const order = await tx.pedidos.create({
        data: {
          id_usuario_cliente: userId,
          id_restaurante: restaurant.id_restaurante,
          fecha_pedido: new Date(),
          estado_simulado: ORDER_STATUS.PENDING,
          total: roundToTwo(totalCents / 100),
          co2_total_ahorrado: 0,
          transporte_sin_emision: "bike",
          zona: zone,
          distancia_km: roundToTwo(Number(averageDistance)),
          detalle_pedidos: {
            create: items.map((item) => ({
              id_platillo: item.id_platillo,
              cantidad: item.cantidad,
              precio_unitario: item.precio_unitario,
              co2_subtotal: roundToTwo(item.co2SubtotalCents / 100),
              tipo_envase: packagingType,
            })),
          },
        },
        include: {
          detalle_pedidos: true,
        },
      });
      await tx.metricas_impacto.create({
        data: {
          id_pedido: order.id_pedido,
          id_usuario: userId,
          co2_evitado_kg: roundToTwo(co2TotalCents / 100),
          fecha_calculo: new Date(),
        },
      });
      const completedOrder = await tx.pedidos.update({
        where: {
          id_pedido: order.id_pedido,
        },
        data: {
          estado_simulado: ORDER_STATUS.COMPLETED,
          co2_total_ahorrado: roundToTwo(co2TotalCents / 100),
        },
        include: {
          detalle_pedidos: true,
        },
      });
      return completedOrder;
    });
  },
};
