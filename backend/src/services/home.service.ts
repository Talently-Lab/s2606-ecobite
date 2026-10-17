import prisma from "../config/db";

export class HomeService {
  async getHomeData() {
    const [restaurantes, platillos] = await Promise.all([
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
          disponible: true,
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
    ]);

    return {
      restaurantes,
      platillos,
    };
  }
}
