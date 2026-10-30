import prisma from "../config/db";
import {
  MyImpactDto,
  OrderConfirmationDto,
} from "../types/order-confirmation.types";
import { ORDER_STATUS } from "../constants/order-status";

interface OrderConfirmationResult {
  order: OrderConfirmationDto;
  myImpact: MyImpactDto;
}

export class OrderConfirmationService {
  async getByOrderId(
    orderId: number,
    userId: number
  ): Promise<OrderConfirmationResult | null> {
    const order = await prisma.pedidos.findFirst({
      where: {
        id_pedido: orderId,
        id_usuario_cliente: userId,
      },
      select: {
        id_pedido: true,
        fecha_pedido: true,
        estado_simulado: true,
        total: true,
        zona: true,
        restaurantes: {
          select: {
            id_restaurante: true,
            nombre: true,
          },
        },
        detalle_pedidos: {
          select: {
            id_platillo: true,
            cantidad: true,
            precio_unitario: true,
            co2_subtotal: true,
            tipo_envase: true,
            platillos: {
              select: {
                nombre: true,
              },
            },
          },
        },
        metricas_impacto: {
          select: {
            co2_evitado_kg: true,
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    const metricasUsuario = await prisma.metricas_impacto.findMany({
      where: {
        id_usuario: userId,
        pedidos: { estado_simulado: ORDER_STATUS.COMPLETED },
      },
      select: {
        co2_evitado_kg: true,
      },
    });

    const impactoAcumulado = metricasUsuario.reduce(
      (total, metrica) => total + metrica.co2_evitado_kg.toNumber(),
      0
    );

    const environmentalImpact = order.metricas_impacto
      ? {
          co2SavedKg: order.metricas_impacto.co2_evitado_kg.toNumber(),
        }
      : null;

    return {
      order: {
        id: order.id_pedido,
        date: order.fecha_pedido.toISOString(),
        status: order.estado_simulado,
        total: order.total.toNumber(),
        zone: order.zona,
        restaurant: {
          id: order.restaurantes.id_restaurante,
          name: order.restaurantes.nombre,
        },
        items: order.detalle_pedidos.map((item) => ({
          dishId: item.id_platillo,
          name: item.platillos.nombre,
          quantity: item.cantidad,
          unitPrice: item.precio_unitario.toNumber(),
          subtotal: item.precio_unitario.toNumber() * item.cantidad,
          co2SavedKg: item.co2_subtotal.toNumber(),
          packagingType: item.tipo_envase,
        })),
        environmentalImpact,
      },
      myImpact: {
        co2SavedKg: Number(impactoAcumulado.toFixed(2)),
        ordersCount: metricasUsuario.length,
      },
    };
  }
}

export const orderConfirmationService = new OrderConfirmationService();
