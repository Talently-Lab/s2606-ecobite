import prisma from "../config/db";
import { AdminCrudError } from "./admin-crud.error";
import type {
  AdminRestaurantDto,
  CreateAdminRestaurantInput,
  UpdateAdminRestaurantInput,
} from "../types/admin-restaurant.types";

const validarDatosRestaurante = (
  input: unknown,
  modo: "crear" | "actualizar"
): Record<string, unknown> => {
  if (
    input === null ||
    typeof input !== "object" ||
    Array.isArray(input)
  ) {
    throw new AdminCrudError(
      400,
      "INVALID_RESTAURANT_DATA",
      "Los datos del restaurante deben enviarse como un objeto"
    );
  }

  const datos = input as Record<string, unknown>;
  const camposPermitidos = [
    "id_usuario_owner",
    "nombre",
    "direccion",
    "latitud",
    "longitud",
    "envase_biodegradable",
    "indicador_eco",
  ];

  const camposDesconocidos = Object.keys(datos).filter(
    (campo) => !camposPermitidos.includes(campo)
  );

  if (camposDesconocidos.length > 0) {
    throw new AdminCrudError(
      400,
      "UNKNOWN_RESTAURANT_FIELDS",
      `Campos no permitidos: ${camposDesconocidos.join(", ")}`
    );
  }

  if (modo === "crear") {
    const camposObligatorios = [
      "id_usuario_owner",
      "nombre",
      "direccion",
      "envase_biodegradable",
      "indicador_eco",
    ];

    const faltantes = camposObligatorios.filter(
      (campo) => !Object.prototype.hasOwnProperty.call(datos, campo)
    );

    if (faltantes.length > 0) {
      throw new AdminCrudError(
        400,
        "MISSING_RESTAURANT_FIELDS",
        `Faltan campos obligatorios: ${faltantes.join(", ")}`
      );
    }
  } else if (Object.keys(datos).length === 0) {
    throw new AdminCrudError(
      400,
      "EMPTY_RESTAURANT_UPDATE",
      "Debes enviar al menos un campo para actualizar"
    );
  }

  const resultado: Record<string, unknown> = {};

  if ("id_usuario_owner" in datos) {
    if (
      !Number.isSafeInteger(datos.id_usuario_owner) ||
      (datos.id_usuario_owner as number) <= 0
    ) {
      throw new AdminCrudError(
        400,
        "INVALID_OWNER_ID",
        "El ID del propietario debe ser un entero positivo"
      );
    }
    resultado.id_usuario_owner = datos.id_usuario_owner;
  }

  for (const campo of ["nombre", "direccion", "indicador_eco"]) {
    if (campo in datos) {
      const valor = datos[campo];

      if (typeof valor !== "string" || valor.trim().length === 0) {
        throw new AdminCrudError(
          400,
          "INVALID_RESTAURANT_FIELD",
          `El campo ${campo} debe ser un texto no vacío`
        );
      }

      const valorNormalizado = valor.trim();

      if (
        campo === "indicador_eco" &&
        !["A", "B", "C"].includes(valorNormalizado.toUpperCase())
      ) {
        throw new AdminCrudError(
          400,
          "INVALID_ECO_INDICATOR",
          "El indicador ecológico debe ser A, B o C"
        );
      }

      resultado[campo] =
        campo === "indicador_eco"
          ? valorNormalizado.toUpperCase()
          : valorNormalizado;
    }
  }

  for (const campo of ["latitud", "longitud"]) {
    if (campo in datos) {
      const valor = datos[campo];
      const limite = campo === "latitud" ? 90 : 180;

      if (
        valor !== null &&
        (typeof valor !== "number" ||
          !Number.isFinite(valor) ||
          Math.abs(valor) > limite)
      ) {
        throw new AdminCrudError(
          400,
          "INVALID_RESTAURANT_COORDINATE",
          `El campo ${campo} debe ser un número válido entre -${limite} y ${limite}, o null`
        );
      }

      resultado[campo] = valor;
    }
  }

  if ("envase_biodegradable" in datos) {
    if (typeof datos.envase_biodegradable !== "boolean") {
      throw new AdminCrudError(
        400,
        "INVALID_BIODEGRADABLE_PACKAGING",
        "El campo envase_biodegradable debe ser booleano"
      );
    }

    resultado.envase_biodegradable = datos.envase_biodegradable;
  }

  return resultado;
};

const mapearRestaurante = (restaurant: {
  id_restaurante: number;
  id_usuario_owner: number;
  nombre: string;
  direccion: string;
  latitud: { toNumber(): number } | null;
  longitud: { toNumber(): number } | null;
  envase_biodegradable: boolean;
  indicador_eco: string;
  activo: boolean;
}): AdminRestaurantDto => ({
  id: restaurant.id_restaurante,
  ownerId: restaurant.id_usuario_owner,
  name: restaurant.nombre,
  address: restaurant.direccion,
  latitude: restaurant.latitud?.toNumber() ?? null,
  longitude: restaurant.longitud?.toNumber() ?? null,
  biodegradablePackaging: restaurant.envase_biodegradable,
  ecoIndicator: restaurant.indicador_eco,
  active: restaurant.activo,
});

const validarPropietario = async (
  ownerId: number,
  restaurantId?: number
): Promise<void> => {
  const owner = await prisma.usuarios.findUnique({
    where: { id_usuario: ownerId },
    select: { rol: true },
  });

  if (!owner) {
    throw new AdminCrudError(
      404,
      "OWNER_NOT_FOUND",
      "El usuario propietario no existe"
    );
  }

  if (owner.rol !== "dueno") {
    throw new AdminCrudError(
      400,
      "INVALID_OWNER_ROLE",
      "El usuario asignado debe tener rol dueno"
    );
  }

  const assignedRestaurant = await prisma.restaurantes.findFirst({
    where: {
      id_usuario_owner: ownerId,
      ...(restaurantId !== undefined
        ? { id_restaurante: { not: restaurantId } }
        : {}),
    },
    select: { id_restaurante: true },
  });

  if (assignedRestaurant) {
    throw new AdminCrudError(
      409,
      "OWNER_ALREADY_ASSIGNED",
      "El usuario propietario ya tiene un restaurante asignado"
    );
  }
};

export const adminRestaurantService = {
  async getAll(): Promise<AdminRestaurantDto[]> {
    const restaurants = await prisma.restaurantes.findMany({
      orderBy: { id_restaurante: "asc" },
    });

    return restaurants.map(mapearRestaurante);
  },

  async getById(id: number): Promise<AdminRestaurantDto> {
    const restaurant = await prisma.restaurantes.findUnique({
      where: { id_restaurante: id },
    });

    if (!restaurant) {
      throw new AdminCrudError(
        404,
        "RESTAURANT_NOT_FOUND",
        "El restaurante no existe"
      );
    }

    return mapearRestaurante(restaurant);
  },

  async create(
    input: CreateAdminRestaurantInput
  ): Promise<AdminRestaurantDto> {
    const datosValidados = validarDatosRestaurante(input, "crear");

    await validarPropietario(
      datosValidados.id_usuario_owner as number
    );

    const restaurant = await prisma.restaurantes.create({
      data: {
        ...(datosValidados as unknown as CreateAdminRestaurantInput),
        activo: true,
      },
    });

    return mapearRestaurante(restaurant);
  },

  async update(
    id: number,
    input: UpdateAdminRestaurantInput
  ): Promise<AdminRestaurantDto> {
    const datosValidados = validarDatosRestaurante(input, "actualizar");

    const existing = await prisma.restaurantes.findUnique({
      where: { id_restaurante: id },
    });

    if (!existing) {
      throw new AdminCrudError(
        404,
        "RESTAURANT_NOT_FOUND",
        "El restaurante no existe"
      );
    }

    if (
      datosValidados.id_usuario_owner !== undefined &&
      datosValidados.id_usuario_owner !== existing.id_usuario_owner
    ) {
      await validarPropietario(datosValidados.id_usuario_owner as number, id);
    }

    const restaurant = await prisma.restaurantes.update({
      where: { id_restaurante: id },
      data: datosValidados as unknown as UpdateAdminRestaurantInput,
    });

    return mapearRestaurante(restaurant);
  },

  async updateStatus(
    id: number,
    active: boolean
  ): Promise<AdminRestaurantDto> {
    const existing = await prisma.restaurantes.findUnique({
      where: { id_restaurante: id },
      select: { id_restaurante: true },
    });

    if (!existing) {
      throw new AdminCrudError(
        404,
        "RESTAURANT_NOT_FOUND",
        "El restaurante no existe"
      );
    }

    if (!active) {
      return prisma.$transaction(async (tx) => {
        await tx.restaurantes.update({
          where: { id_restaurante: id },
          data: { activo: false },
        });

        await tx.platillos.updateMany({
          where: { id_restaurante: id },
          data: { disponible: false },
        });

        const restaurant = await tx.restaurantes.findUniqueOrThrow({
          where: { id_restaurante: id },
        });

        return mapearRestaurante(restaurant);
      });
    }

    const restaurant = await prisma.restaurantes.update({
      where: { id_restaurante: id },
      data: { activo: true },
    });

    return mapearRestaurante(restaurant);
  },
};
