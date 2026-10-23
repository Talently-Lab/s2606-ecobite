import prisma from "../config/db";
import { CategoryDto, HomeResponse } from "../types/home.types";

const reglasCategorias: Array<{
  coincidencia: RegExp;
  categoria: CategoryDto;
}> = [
  {
    coincidencia: /\bbowl(s)?\b/i,
    categoria: { id: 1, name: "Bowls", slug: "bowls" },
  },
  {
    coincidencia: /\bwrap(s)?\b/i,
    categoria: { id: 2, name: "Wraps", slug: "wraps" },
  },
  {
    coincidencia: /\bensalada(s)?\b/i,
    categoria: { id: 3, name: "Ensaladas", slug: "ensaladas" },
  },
];

function clasificarPlatillo(nombre: string): CategoryDto | null {
  const regla = reglasCategorias.find(({ coincidencia }) =>
    coincidencia.test(nombre)
  );

  return regla?.categoria ?? null;
}

export class HomeService {
  async getHomeData(userId?: number): Promise<HomeResponse> {
    const [restaurantes, platillos, metricas] = await Promise.all([
      prisma.restaurantes.findMany({
        where: { activo: true },
        select: {
          id_restaurante: true,
          nombre: true,
          direccion: true,
          envase_biodegradable: true,
          indicador_eco: true,
        },
        orderBy: { nombre: "asc" },
      }),

      prisma.platillos.findMany({
        where: {
          disponible: true,
          restaurantes: { activo: true },
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
        orderBy: { nombre: "asc" },
      }),

      userId === undefined
        ? Promise.resolve([])
        : prisma.metricas_impacto.findMany({
            where: {
              id_usuario: userId,
              pedidos: { estado_simulado: "completed" },
            },
            select: { co2_evitado_kg: true },
          }),
    ]);

    const nombresVistos = new Set<string>();

    const platillosUnicos = platillos.filter((platillo) => {
      const nombreNormalizado = platillo.nombre.trim().toLowerCase();

      if (nombresVistos.has(nombreNormalizado)) {
        return false;
      }

      nombresVistos.add(nombreNormalizado);
      return true;
    });

    const restaurantesVistos = new Set<number>();
    const platillosDestacados: typeof platillosUnicos = [];

    for (const platillo of platillosUnicos) {
      if (platillosDestacados.length >= 6) break;

      const restauranteId = platillo.restaurantes.id_restaurante;

      if (restaurantesVistos.has(restauranteId)) continue;

      restaurantesVistos.add(restauranteId);
      platillosDestacados.push(platillo);
    }

      if (platillosDestacados.length < 6) {
        const idsSeleccionados = new Set(
          platillosDestacados.map((platillo) => platillo.id_platillo)
        );

        for (const platillo of platillosUnicos) {
          if (platillosDestacados.length >= 6) break;
          if (idsSeleccionados.has(platillo.id_platillo)) continue;

          idsSeleccionados.add(platillo.id_platillo);
          platillosDestacados.push(platillo);
        }
    }

          const categoriasPorPlatillo = new Map(
              platillos.map((platillo) => [
                platillo.id_platillo,
                clasificarPlatillo(platillo.nombre),
              ])
            );

          const categoriasVistas = new Map<number, CategoryDto>();

          for (const categoria of categoriasPorPlatillo.values()) {
            if (categoria) categoriasVistas.set(categoria.id, categoria);
          }

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
          : { co2SavedKg: Number(co2SavedKg.toFixed(2)) },

      categories: Array.from(categoriasVistas.values()),

      restaurants: restaurantes.map((restaurante) => ({
        id: restaurante.id_restaurante,
        name: restaurante.nombre,
        address: restaurante.direccion,
        biodegradablePackaging: restaurante.envase_biodegradable,
        ecoIndicator: restaurante.indicador_eco,
      })),

      featuredDishes: platillosDestacados.map((platillo) => ({
        id: platillo.id_platillo,
        name: platillo.nombre,
        price: platillo.precio.toNumber(),
        co2SavedPerUnit: platillo.co2_ahorrado_unit.toNumber(),
        category:
          categoriasPorPlatillo.get(platillo.id_platillo)?.name ?? "Otros",
        restaurant: {
          id: platillo.restaurantes.id_restaurante,
          name: platillo.restaurantes.nombre,
          ecoIndicator: platillo.restaurantes.indicador_eco,
          biodegradablePackaging:
            platillo.restaurantes.envase_biodegradable,
        },
      })),

      howItWorks: [
        {
          step: 1,
          title: "Elige tu comida",
          description:
            "Descubre restaurantes y platillos disponibles en EcoBite.",
        },
        {
          step: 2,
          title: "Disfruta tu pedido",
          description:
            "Elige tus platillos favoritos y disfruta tu comida.",
        },
        {
          step: 3,
          title: "Conoce tu impacto",
          description:
            "Consulta el CO₂ ahorrado según las reglas de cálculo de EcoBite.",
        }
      ],
    };
  }
}
