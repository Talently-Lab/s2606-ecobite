import prisma from "../config/db";
import { HomeResponse } from "../types/home.types";

export class HomeService {
  async getHomeData(userId?: number): Promise<HomeResponse> {
    const [restaurantes, platillos, metricas] = await Promise.all([
      prisma.restaurantes.findMany({
        where: {
          activo: true,
        },
        select: {
          id_restaurante: true,
          nombre: true,
          direccion: true,
          envase_biodegradable: true,
          indicador_eco: true,
        },
        orderBy: {
          nombre: "asc",
        },
      }),

      prisma.platillos.findMany({
        where: {
          disponible: true,
          restaurantes: {
            activo: true,
          },
        },
        select: {
          id_platillo: true,
          nombre: true,
          precio: true,
          co2_ahorrado_unit: true,
          restaurantes: {
            select: {
              id_restaurante: true,
              nombre: true,
              indicador_eco: true,
              envase_biodegradable: true,
            },
          },
        },
        orderBy: {
          nombre: "asc",
        },
      }),

      userId === undefined
        ? Promise.resolve([])
        : prisma.metricas_impacto.findMany({
            where: {
              id_usuario: userId,
              pedidos: {
                estado_simulado: "completed",
              },
            },
            select: {
              co2_evitado_kg: true,
            },
          }),
    ]);

    const nombresVistos = new Set<string>();
    const restaurantesVistos = new Set<number>();

    const platillosUnicos = platillos.filter((platillo) => {
      if (nombresVistos.has(platillo.nombre)) {
        return false;
      }

      nombresVistos.add(platillo.nombre);
      return true;
    });

    const platillosDestacados = [
      ...platillosUnicos.filter((platillo) => {
        const restauranteId = platillo.restaurantes.id_restaurante;

        if (restaurantesVistos.has(restauranteId)) {
          return false;
        }

        restaurantesVistos.add(restauranteId);
        return true;
      }),
      ...platillosUnicos.filter(
        (platillo) =>
          restaurantesVistos.has(platillo.restaurantes.id_restaurante) ===
          false
      ),
    ].slice(0, 6);


    const co2SavedKg =
      metricas.length === 0
        ? 0
        : metricas.reduce(
            (total, metrica) =>
              total + metrica.co2_evitado_kg.toNumber(),
            0
          );

    return {
      userImpact:
        userId === undefined
          ? null
          : {
              co2SavedKg: Number(co2SavedKg.toFixed(2)),
            },

      categories: [],

      restaurants: restaurantes.map((restaurante) => ({
        id: restaurante.id_restaurante,
        name: restaurante.nombre,
        address: restaurante.direccion,
        biodegradablePackaging: restaurante.envase_biodegradable,
        ecoIndicator: restaurante.indicador_eco
      })),

      featuredDishes: platillosDestacados.map((platillo) => ({
        id: platillo.id_platillo,
        name: platillo.nombre,
        price: platillo.precio.toNumber(),
        co2SavedPerUnit: platillo.co2_ahorrado_unit.toNumber(),
        restaurant: {
          id: platillo.restaurantes.id_restaurante,
          name: platillo.restaurantes.nombre,
          ecoIndicator: platillo.restaurantes.indicador_eco,
          biodegradablePackaging:
            platillo.restaurantes.envase_biodegradable,
        },
      })),

      howItWorks: [],
    };
  }
}
