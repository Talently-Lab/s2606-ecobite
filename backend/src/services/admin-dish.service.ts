import prisma from "../config/db";
import { AdminCrudError } from "./admin-crud.error";
import type {
  AdminDishDto,
  CreateAdminDishInput,
  UpdateAdminDishInput,
} from "../types/admin-dish.types";

const validarDatosPlatillo = (
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
      "INVALID_DISH_DATA",
      "Los datos del platillo deben enviarse como un objeto"
    );
  }

  const datos = input as Record<string, unknown>;
  const camposPermitidos = [
    "id_restaurante",
    "nombre",
    "precio",
    "co2_ahorrado_unit",
  ];

  const desconocidos = Object.keys(datos).filter(
    (campo) => !camposPermitidos.includes(campo)
  );

  if (desconocidos.length > 0) {
    throw new AdminCrudError(
      400,
      "UNKNOWN_DISH_FIELDS",
      `Campos no permitidos: ${desconocidos.join(", ")}`
    );
  }

  if (modo === "crear") {
    const obligatorios = [
      "id_restaurante",
      "nombre",
      "precio",
      "co2_ahorrado_unit",
    ];

    const faltantes = obligatorios.filter(
      (campo) => !Object.prototype.hasOwnProperty.call(datos, campo)
    );

    if (faltantes.length > 0) {
      throw new AdminCrudError(
        400,
        "MISSING_DISH_FIELDS",
        `Faltan campos obligatorios: ${faltantes.join(", ")}`
      );
    }
  } else if (Object.keys(datos).length === 0) {
    throw new AdminCrudError(
      400,
      "EMPTY_DISH_UPDATE",
      "Debes enviar al menos un campo para actualizar"
    );
  }

  const resultado: Record<string, unknown> = {};

  if ("id_restaurante" in datos) {
    if (
      !Number.isSafeInteger(datos.id_restaurante) ||
      (datos.id_restaurante as number) <= 0
    ) {
      throw new AdminCrudError(
        400,
        "INVALID_RESTAURANT_ID",
        "El ID del restaurante debe ser un entero positivo"
      );
    }

    resultado.id_restaurante = datos.id_restaurante;
  }

  if ("nombre" in datos) {
    if (
      typeof datos.nombre !== "string" ||
      datos.nombre.trim().length === 0 ||
      datos.nombre.trim().length > 100
    ) {
      throw new AdminCrudError(
        400,
        "INVALID_DISH_NAME",
        "El nombre debe ser un texto no vacío de máximo 100 caracteres"
      );
    }

    resultado.nombre = datos.nombre.trim();
  }

  const validarDecimal = (
    campo: "precio" | "co2_ahorrado_unit",
    minimo: number,
    maximo: number
  ): void => {
    if (!(campo in datos)) return;

    const valor = datos[campo];

    if (
      typeof valor !== "number" ||
      !Number.isFinite(valor) ||
      valor < minimo ||
      valor > maximo ||
      Math.abs(valor * 100 - Math.round(valor * 100)) > 1e-8
    ) {
      throw new AdminCrudError(
        400,
        campo === "precio" ? "INVALID_DISH_PRICE" : "INVALID_DISH_CO2",
        campo === "precio"
          ? "El precio debe ser mayor que cero, tener máximo dos decimales y no superar 99999999.99"
          : "El CO2 ahorrado debe ser igual o mayor que cero, tener máximo dos decimales y no superar 999999.99"
      );
    }

    resultado[campo] = valor;
  };

  validarDecimal("precio", 0.01, 99999999.99);
  validarDecimal("co2_ahorrado_unit", 0, 999999.99);

  return resultado;
};

const mapearPlatillo = (dish: {
  id_platillo: number;
  id_restaurante: number;
  nombre: string;
  precio: { toNumber(): number };
  co2_ahorrado_unit: { toNumber(): number };
  disponible: boolean;
}): AdminDishDto => ({
  id: dish.id_platillo,
  restaurantId: dish.id_restaurante,
  name: dish.nombre,
  price: dish.precio.toNumber(),
  co2SavedPerUnit: dish.co2_ahorrado_unit.toNumber(),
  available: dish.disponible,
});

const validarRestauranteActivo = async (
  restaurantId: number
): Promise<void> => {
  const restaurant = await prisma.restaurantes.findUnique({
    where: { id_restaurante: restaurantId },
    select: { activo: true },
  });

  if (!restaurant) {
    throw new AdminCrudError(
      404,
      "RESTAURANT_NOT_FOUND",
      "El restaurante no existe"
    );
  }

  if (!restaurant.activo) {
    throw new AdminCrudError(
      400,
      "INACTIVE_RESTAURANT",
      "No se pueden crear o asignar platillos a un restaurante inactivo"
    );
  }
};

export const adminDishService = {
  async getAll(): Promise<AdminDishDto[]> {
    const dishes = await prisma.platillos.findMany({
      orderBy: { id_platillo: "asc" },
    });

    return dishes.map(mapearPlatillo);
  },

  async getById(id: number): Promise<AdminDishDto> {
    const dish = await prisma.platillos.findUnique({
      where: { id_platillo: id },
    });

    if (!dish) {
      throw new AdminCrudError(
        404,
        "DISH_NOT_FOUND",
        "El platillo no existe"
      );
    }

    return mapearPlatillo(dish);
  },

  async create(
    input: CreateAdminDishInput
  ): Promise<AdminDishDto> {
    const datosValidados = validarDatosPlatillo(input, "crear");

    await validarRestauranteActivo(
      datosValidados.id_restaurante as number
    );

    const dish = await prisma.platillos.create({
      data: {
        ...(datosValidados as unknown as CreateAdminDishInput),
        disponible: true,
      },
    });

    return mapearPlatillo(dish);
  },

  async update(
    id: number,
    input: UpdateAdminDishInput
  ): Promise<AdminDishDto> {
    const datosValidados = validarDatosPlatillo(input, "actualizar");

    const existing = await prisma.platillos.findUnique({
      where: { id_platillo: id },
    });

    if (!existing) {
      throw new AdminCrudError(
        404,
        "DISH_NOT_FOUND",
        "El platillo no existe"
      );
    }

    if (
      datosValidados.id_restaurante !== undefined &&
      datosValidados.id_restaurante !== existing.id_restaurante
    ) {
      await validarRestauranteActivo(
        datosValidados.id_restaurante as number
      );
    }

    const dish = await prisma.platillos.update({
      where: { id_platillo: id },
      data: datosValidados as unknown as UpdateAdminDishInput,
    });

    return mapearPlatillo(dish);
  },

  async updateStatus(
    id: number,
    available: boolean
  ): Promise<AdminDishDto> {
    const existing = await prisma.platillos.findUnique({
      where: { id_platillo: id },
      select: { id_restaurante: true },
    });

    if (!existing) {
      throw new AdminCrudError(
        404,
        "DISH_NOT_FOUND",
        "El platillo no existe"
      );
    }

    if (available) {
      await validarRestauranteActivo(existing.id_restaurante);
    }

    const dish = await prisma.platillos.update({
      where: { id_platillo: id },
      data: { disponible: available },
    });

    return mapearPlatillo(dish);
  },
};
