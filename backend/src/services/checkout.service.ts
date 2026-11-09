import { estimateDelivery, validateDestination } from "./delivery.service";
import type { Prisma } from "@prisma/client";
import prisma from "../config/db";
import jwt from "jsonwebtoken";
import type {
  CheckoutQuoteDto,
  CheckoutItemDto,
} from "../types/checkout.types";

const MAX_DISTINCT_DISHES = 20;
const MAX_QUANTITY_PER_DISH = 20;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class CheckoutError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

function deliverySigningKey() {
  const key = process.env.JWT_SECRET;
  if (!key || Buffer.byteLength(key, "utf8") < 32)
    throw new Error("JWT_SECRET debe tener al menos 32 bytes");
  return key;
}

export function reviewedDelivery(input: {
  restaurantId: number;
  destination: unknown;
  reviewedQuote: CheckoutQuoteDto;
}) {
  const token = input.reviewedQuote?.deliveryToken;
  // Older clients can still obtain a fresh route through the provider.
  if (!token) return undefined;
  const key = deliverySigningKey();
  try {
    const value = jwt.verify(token, key, {
      algorithms: ["HS256"],
      audience: "checkout-delivery",
    });
    const destination = validateDestination(input.destination);
    if (
      typeof value === "string" ||
      value.restaurantId !== input.restaurantId ||
      value.destination?.latitude !== destination.latitude ||
      value.destination?.longitude !== destination.longitude ||
      value.destination?.label !== destination.label
    )
      throw new Error("Mismatched delivery");
    return {
      distanceKm: value.distanceKm as number,
      co2SavedKg: value.co2SavedKg as number,
      methodology: value.methodology as string,
    };
  } catch {
    throw new CheckoutError(
      409,
      "DELIVERY_QUOTE_EXPIRED",
      "El cálculo de entrega venció o no es válido. Volvé a calcularlo antes de confirmar.",
    );
  }
}

export class CheckoutService {
  async quote(
    input: unknown,
    db: Pick<Prisma.TransactionClient, "restaurantes" | "platillos"> = prisma,
    delivery?: Pick<
      Awaited<ReturnType<typeof estimateDelivery>>,
      "distanceKm" | "co2SavedKg" | "methodology"
    >,
  ): Promise<CheckoutQuoteDto> {
    if (!isRecord(input)) {
      throw new CheckoutError(
        400,
        "INVALID_BODY",
        "El cuerpo de la solicitud debe ser un objeto JSON",
        { body: "Envía un objeto JSON válido" },
      );
    }

    if (
      typeof input.restaurantId !== "number" ||
      !Number.isSafeInteger(input.restaurantId) ||
      input.restaurantId <= 0
    ) {
      throw new CheckoutError(
        400,
        "INVALID_RESTAURANT_ID",
        "El restaurante indicado no es válido",
        { restaurantId: "Debe ser un entero positivo" },
      );
    }

    const destination = validateDestination(input.destination);

    if (!Array.isArray(input.items) || input.items.length === 0) {
      throw new CheckoutError(
        400,
        "EMPTY_CART",
        "El carrito debe contener al menos un producto",
        { items: "Agrega al menos un producto" },
      );
    }

    if (input.items.length > MAX_DISTINCT_DISHES) {
      throw new CheckoutError(
        400,
        "CART_LIMIT_EXCEEDED",
        `El carrito admite como máximo ${MAX_DISTINCT_DISHES} productos distintos`,
        { items: `Máximo ${MAX_DISTINCT_DISHES} productos distintos` },
      );
    }

    const seenDishIds = new Set<number>();

    for (const [index, item] of input.items.entries()) {
      if (!isRecord(item)) {
        throw new CheckoutError(
          400,
          "INVALID_CART_ITEM",
          "Hay un elemento del carrito con formato inválido",
          { [`items.${index}`]: "Debe ser un objeto con dishId y quantity" },
        );
      }

      if (
        typeof item.dishId !== "number" ||
        !Number.isSafeInteger(item.dishId) ||
        item.dishId <= 0
      ) {
        throw new CheckoutError(
          400,
          "INVALID_DISH_ID",
          "Hay un producto con identificador inválido",
          { [`items.${index}.dishId`]: "Debe ser un entero positivo" },
        );
      }

      if (
        typeof item.quantity !== "number" ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity <= 0 ||
        item.quantity > MAX_QUANTITY_PER_DISH
      ) {
        throw new CheckoutError(
          400,
          "INVALID_QUANTITY",
          `La cantidad debe estar entre 1 y ${MAX_QUANTITY_PER_DISH}`,
          {
            [`items.${index}.quantity`]: `Debe ser un entero entre 1 y ${MAX_QUANTITY_PER_DISH}`,
          },
        );
      }

      if (seenDishIds.has(item.dishId)) {
        throw new CheckoutError(
          400,
          "DUPLICATE_DISH",
          "Envía cada producto una sola vez e indica su cantidad",
          { [`items.${index}.dishId`]: "El producto está repetido" },
        );
      }

      seenDishIds.add(item.dishId);
    }

    const restaurant = await db.restaurantes.findFirst({
      where: {
        id_restaurante: input.restaurantId,
        activo: true,
      },
      select: {
        id_restaurante: true,
        nombre: true,
      },
    });

    if (!restaurant) {
      throw new CheckoutError(
        404,
        "RESTAURANT_NOT_AVAILABLE",
        "El restaurante no existe o no está disponible",
        { restaurantId: "Selecciona un restaurante disponible" },
      );
    }

    const dishes = await db.platillos.findMany({
      where: {
        id_platillo: { in: input.items.map((item) => item.dishId) },
        id_restaurante: restaurant.id_restaurante,
        disponible: true,
      },
      select: {
        id_platillo: true,
        nombre: true,
        precio: true,
      },
    });

    if (dishes.length !== input.items.length) {
      throw new CheckoutError(
        400,
        "DISH_UNAVAILABLE",
        "Uno o más productos no están disponibles o no pertenecen al restaurante seleccionado",
        { items: "Revisa los productos del carrito" },
      );
    }

    const dishById = new Map(dishes.map((dish) => [dish.id_platillo, dish]));

    const items: CheckoutItemDto[] = input.items.map((item) => {
      const dish = dishById.get(item.dishId);

      if (!dish) {
        throw new CheckoutError(
          400,
          "DISH_UNAVAILABLE",
          "Uno de los productos ya no está disponible",
        );
      }

      const unitPrice = Number(dish.precio);

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        throw new CheckoutError(
          500,
          "INVALID_CATALOG_PRICE",
          "El catálogo contiene un precio inválido",
        );
      }

      const rawSubtotal = unitPrice * item.quantity;

      if (!Number.isFinite(rawSubtotal)) {
        throw new CheckoutError(
          500,
          "INVALID_CART_SUBTOTAL",
          "El subtotal del producto no es válido",
        );
      }

      const subtotal = Math.round(rawSubtotal * 100) / 100;

      if (!Number.isFinite(subtotal)) {
        throw new CheckoutError(
          500,
          "INVALID_CART_SUBTOTAL",
          "El subtotal del producto no es válido",
        );
      }

      return {
        dishId: dish.id_platillo,
        name: dish.nombre,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      };
    });

    const rawCartSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

    if (!Number.isFinite(rawCartSubtotal)) {
      throw new CheckoutError(
        500,
        "INVALID_CART_SUBTOTAL",
        "No se pudo calcular el subtotal del carrito",
      );
    }

    const subtotal = Math.round(rawCartSubtotal * 100) / 100;

    if (!Number.isFinite(subtotal)) {
      throw new CheckoutError(
        500,
        "INVALID_CART_SUBTOTAL",
        "El subtotal calculado no es válido",
      );
    }

    const route =
      delivery ?? (await estimateDelivery(input.restaurantId, destination));
    if (route.distanceKm <= 0) {
      throw new CheckoutError(
        422,
        "DELIVERY_DISTANCE_TOO_SHORT",
        "El recorrido de entrega debe ser mayor a cero. Revisá el destino antes de confirmar.",
      );
    }
    return {
      deliveryToken: jwt.sign(
        {
          restaurantId: restaurant.id_restaurante,
          destination,
          distanceKm: route.distanceKm,
          co2SavedKg: route.co2SavedKg,
          methodology: route.methodology,
        },
        deliverySigningKey(),
        { algorithm: "HS256", audience: "checkout-delivery", expiresIn: "15m" },
      ),
      destination,
      distanceKm: route.distanceKm,
      methodology: route.methodology,
      restaurantId: restaurant.id_restaurante,
      restaurantName: restaurant.nombre,
      zone: "ruta",
      items,
      subtotal,
      deliveryFee: 0,
      total: subtotal,
      environmentalImpact: { co2SavedKg: route.co2SavedKg },
      requiresEnvironmentalRules: false,
    };
  }
}
