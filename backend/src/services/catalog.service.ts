import prisma from "../config/db";
import type {
  CatalogDishDto,
  RestaurantCatalogDto,
  RestaurantCatalogQueryDto,
  RestaurantMenuDto,
} from "../types/catalog.types";

type CategoryInfo = {
  id: number;
  name: string;
  slug: string;
};

const clasificarPlatillo = (nombre: string): CategoryInfo | null => {
  if (/\bbowls?\b/i.test(nombre)) {
    return { id: 1, name: "Bowls", slug: "bowls" };
  }

  if (/\bwraps?\b/i.test(nombre)) {
    return { id: 2, name: "Wraps", slug: "wraps" };
  }

  if (/\bensaladas?\b/i.test(nombre)) {
    return { id: 3, name: "Ensaladas", slug: "ensaladas" };
  }

  return null;
};

const normalizarCategoria = (categoria: string): string =>
  categoria.trim().toLocaleLowerCase("es");

const obtenerResumenValoraciones = async (
  restaurantIds: number[]
): Promise<Map<number, { rating: number | null; totalRatings: number }>> => {
  if (restaurantIds.length === 0) {
    return new Map();
  }

  const valoraciones = await prisma.valoraciones.groupBy({
    by: ["id_restaurante"],
    where: {
      id_restaurante: { in: restaurantIds },
    },
    _avg: {
      puntuacion: true,
    },
    _count: {
      _all: true,
    },
  });

  return new Map(
    valoraciones.map((valoracion: {
      id_restaurante: number;
      _avg: { puntuacion: number | null };
      _count: { _all: number };
    }) => [
      valoracion.id_restaurante,
      {
        rating:
          valoracion._avg.puntuacion === null
            ? null
            : Number(valoracion._avg.puntuacion.toFixed(1)),
        totalRatings: valoracion._count._all,
      },
    ])
  );
};

const mapearRestaurante = (
  restaurante: {
    id_restaurante: number;
    nombre: string;
    direccion: string;
    latitud: { toNumber(): number } | null;
    longitud: { toNumber(): number } | null;
    envase_biodegradable: boolean;
    indicador_eco: string;
    platillos: { nombre: string }[];
  },
  valoracion: {
    rating: number | null;
    totalRatings: number;
  }
): RestaurantCatalogDto => {
  const categorias = [
    ...new Set(
      restaurante.platillos
        .map((platillo) => clasificarPlatillo(platillo.nombre)?.name)
        .filter((nombre): nombre is string => Boolean(nombre))
    ),
  ];

  return {
    id: restaurante.id_restaurante,
    name: restaurante.nombre,
    address: restaurante.direccion,
    biodegradablePackaging: restaurante.envase_biodegradable,
    ecoIndicator: restaurante.indicador_eco,
    imageUrl: process.env.IMAGES_BASE_URL
      ? `${process.env.IMAGES_BASE_URL.replace(/\/+$/, "")}/restaurants/${restaurante.id_restaurante}.jpg`
      : null,
    category: categorias.length === 1 ? categorias[0] : null,
    estimatedDeliveryMinutes: null,
    rating: valoracion.rating,
    totalRatings: valoracion.totalRatings,
    latitude: restaurante.latitud?.toNumber() ?? null,
    longitude: restaurante.longitud?.toNumber() ?? null,
  };
};

const mapearPlatillo = (
  platillo: {
    id_platillo: number;
    id_restaurante: number;
    nombre: string;
    precio: { toNumber(): number };
    co2_ahorrado_unit: { toNumber(): number };
    disponible: boolean;
    restaurantes: {
      id_restaurante: number;
      nombre: string;
      indicador_eco: string;
      envase_biodegradable: boolean;
    };
  }
): CatalogDishDto => {
  const categoria = clasificarPlatillo(platillo.nombre);

  return {
    id: platillo.id_platillo,
    name: platillo.nombre,
    price: platillo.precio.toNumber(),
    co2SavedPerUnit: platillo.co2_ahorrado_unit.toNumber(),
    category: categoria?.name ?? null,
    restaurantId: platillo.id_restaurante,
    imageUrl: process.env.IMAGES_BASE_URL
      ? `${process.env.IMAGES_BASE_URL.replace(/\/+$/, "")}/dishes/${platillo.id_platillo}.jpg`
      : null,
    available: platillo.disponible,
    restaurant: {
      id: platillo.restaurantes.id_restaurante,
      name: platillo.restaurantes.nombre,
      ecoIndicator: platillo.restaurantes.indicador_eco,
      biodegradablePackaging:
        platillo.restaurantes.envase_biodegradable,
    },
  };
};

export const getRestaurantCatalog = async (
  filters: RestaurantCatalogQueryDto = {}
): Promise<RestaurantCatalogDto[]> => {
  const restaurantes = await prisma.restaurantes.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
    select: {
      id_restaurante: true,
      nombre: true,
      direccion: true,
      latitud: true,
      longitud: true,
      envase_biodegradable: true,
      indicador_eco: true,
      platillos: {
        where: { disponible: true },
        select: { nombre: true },
      },
    },
  });

  const search = filters.search?.trim().toLocaleLowerCase("es");
  const categoria = filters.categoria
    ? normalizarCategoria(filters.categoria)
    : undefined;

  const restaurantesFiltrados = restaurantes.filter((restaurante) => {
    const nombre = restaurante.nombre.toLocaleLowerCase("es");
    const direccion = restaurante.direccion.toLocaleLowerCase("es");

    const coincideBusqueda =
      !search ||
      nombre.includes(search) ||
      direccion.includes(search);

    const coincideCategoria =
      !categoria ||
      restaurante.platillos.some((platillo) => {
        const categoriaPlatillo = clasificarPlatillo(
          platillo.nombre
        )?.name;

        return categoriaPlatillo?.toLocaleLowerCase("es") === categoria;
      });

    return coincideBusqueda && coincideCategoria;
  });

  const resumenes = await obtenerResumenValoraciones(
    restaurantesFiltrados.map((restaurante) => restaurante.id_restaurante)
  );

  return restaurantesFiltrados.map((restaurante) =>
    mapearRestaurante(
      restaurante,
      resumenes.get(restaurante.id_restaurante) ?? {
        rating: null,
        totalRatings: 0,
      }
    )
  );
};
export const getRestaurantMenu = async (
  restaurantId: number
): Promise<RestaurantMenuDto | null> => {
  const restaurante = await prisma.restaurantes.findFirst({
    where: {
      id_restaurante: restaurantId,
      activo: true,
    },
    select: {
      id_restaurante: true,
      nombre: true,
      direccion: true,
      latitud: true,
      longitud: true,
      envase_biodegradable: true,
      indicador_eco: true,
      platillos: {
        where: { disponible: true },
        orderBy: { nombre: "asc" },
        select: {
          id_platillo: true,
          id_restaurante: true,
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
      },
    },
  });

  if (!restaurante) {
    return null;
  }

  const resumenes = await obtenerResumenValoraciones([restaurantId]);

  return {
    restaurant: mapearRestaurante(
      restaurante,
      resumenes.get(restaurantId) ?? {
        rating: null,
        totalRatings: 0,
      }
    ),
    dishes: restaurante.platillos.map(mapearPlatillo),
  };
};
