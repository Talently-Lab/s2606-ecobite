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
    const [restaurantes, platillos, metricas, impactoComunitario] = await Promise.all([
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

      prisma.metricas_impacto.aggregate({
        where: {
          pedidos: { estado_simulado: "completed" },
        },
        _sum: { co2_evitado_kg: true },
      }),
    ]);

    const restaurantesVistos = new Set<number>();
    const idsSeleccionados = new Set<number>();
    const categoriasDestacadas = new Set<number>();
    const platillosDestacados: typeof platillos = [];

    function seleccionarPlatillo(
      platillo: (typeof platillos)[number],
      exigirRestauranteNuevo: boolean,
      exigirCategoriaNueva: boolean
    ): boolean {
      const idPlatillo = platillo.id_platillo;
      const idRestaurante = platillo.restaurantes.id_restaurante;
      const categoria = clasificarPlatillo(platillo.nombre);

    if (idsSeleccionados.has(idPlatillo)) return false;
    if (exigirRestauranteNuevo && restaurantesVistos.has(idRestaurante)) {
      return false;
      }
    if (
      exigirCategoriaNueva &&
      (!categoria || categoriasDestacadas.has(categoria.id))
    ) {
      return false;
    }

    idsSeleccionados.add(idPlatillo);
    restaurantesVistos.add(idRestaurante);
    if (categoria) categoriasDestacadas.add(categoria.id);
    platillosDestacados.push(platillo);

      return true;
    }

    // Primera pasada: categorías distintas y restaurantes distintos.
    for (const platillo of platillos) {
      if (platillosDestacados.length >= 6) break;
      seleccionarPlatillo(platillo, true, true);
      }

    // Segunda pasada: categorías nuevas, aunque se repita restaurante.
    for (const platillo of platillos) {
      if (platillosDestacados.length >= 6) break;
      seleccionarPlatillo(platillo, false, true);
      }

    // Tercera pasada: completar con otras ofertas reales.
    for (const platillo of platillos) {
      if (platillosDestacados.length >= 6) break;
      seleccionarPlatillo(platillo, false, false);
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

      communityImpact: {
        co2SavedKg: Number(
          (impactoComunitario._sum.co2_evitado_kg?.toNumber() ?? 0).toFixed(2)
        ),
      },

      categories: Array.from(categoriasVistas.values()),

      restaurants: restaurantes.map((restaurante) => ({
        id: restaurante.id_restaurante,
        name: restaurante.nombre,
        address: restaurante.direccion,
        imageUrl: null,
        biodegradablePackaging: restaurante.envase_biodegradable,
        ecoIndicator: restaurante.indicador_eco,
      })),

      featuredDishes: platillosDestacados.map((platillo) => ({
        id: platillo.id_platillo,
        name: platillo.nombre,
        imageUrl: null,
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
