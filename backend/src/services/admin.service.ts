import prisma from "../config/db";
import { ORDER_STATUS } from "../constants/order-status";
import { AdminDashboardDto } from "../types/admin.types";

export class AdminService {
  async getDashboard(): Promise<AdminDashboardDto> {
    const [
      ordersCount,
      activeRestaurantsCount,
      completedOrders,
      impact,
      recentOrders,
    ] = await Promise.all([
      prisma.pedidos.count(),
      prisma.restaurantes.count({
        where: { activo: true },
      }),
      prisma.pedidos.aggregate({
        where: { estado_simulado: ORDER_STATUS.COMPLETED },
        _avg: { total: true },
      }),
      prisma.metricas_impacto.aggregate({
        where: {
          pedidos: { estado_simulado: ORDER_STATUS.COMPLETED },
        },
        _sum: { co2_evitado_kg: true },
      }),
      prisma.pedidos.findMany({
        take: 10,
        orderBy: [
          { fecha_pedido: "desc" },
          { id_pedido: "desc" },
        ],
        select: {
          id_pedido: true,
          fecha_pedido: true,
          estado_simulado: true,
          total: true,
          zona: true,
          usuarios: {
            select: { nombre: true },
          },
          restaurantes: {
            select: { nombre: true },
          },
          metricas_impacto: {
            select: { co2_evitado_kg: true },
          },
        },
      }),
    ]);

    return {
      summary: {
        co2SavedKg: Number(
          (impact._sum.co2_evitado_kg?.toNumber() ?? 0).toFixed(2)
        ),
        ordersCount,
        activeRestaurantsCount,
        averageTicket: Number(
          (completedOrders._avg.total?.toNumber() ?? 0).toFixed(2)
        ),
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id_pedido,
        date: order.fecha_pedido.toISOString(),
        customer: order.usuarios.nombre,
        restaurant: order.restaurantes.nombre,
        zone: order.zona,
        total: order.total.toNumber(),
        co2SavedKg:
          order.metricas_impacto?.co2_evitado_kg.toNumber() ?? null,
        status: order.estado_simulado,
      })),
    };
  }
}

export const adminService = new AdminService();
