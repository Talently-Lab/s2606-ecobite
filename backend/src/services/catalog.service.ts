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

const mapearRestaurante = (
  restaurante: {
    id_restaurante: number;
    nombre: string;
    direccion: string;
    envase_biodegradable: boolean;
    indicador_eco: string;
    platillos: { nombre: string }[];
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
    imageUrl: null,
    category: categorias.length === 1 ? categorias[0] : null,
    estimatedDeliveryMinutes: null,
    rating: null,
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
    imageUrl: null,
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

  return restaurantes
    .filter((restaurante) => {
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
    })
    .map(mapearRestaurante);
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

  return {
    restaurant: mapearRestaurante(restaurante),
    dishes: restaurante.platillos.map(mapearPlatillo),
  };
};
