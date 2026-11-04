import { Prisma } from "@prisma/client";
import prisma from "../config/db";
import { ORDER_STATUS } from "../constants/order-status";
import {
  RestaurantRatingDto,
  RestaurantRatingsResponse,
} from "../types/ratings.types";

export interface CreateRestaurantRatingInput {
  score: number;
  comment?: string | null;
}

export class RatingsServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "RatingsServiceError";
  }
}

export class RatingsService {
  async getByRestaurantId(
  restaurantId: number
): Promise<RestaurantRatingsResponse | null> {
  const restaurant = await prisma.restaurantes.findUnique({
    where: {
      id_restaurante: restaurantId,
    },
    select: {
      id_restaurante: true,
    },
  });

  if (!restaurant) {
    return null;
  }

  const valoraciones = await prisma.valoraciones.findMany({
    where: {
      id_restaurante: restaurantId,
    },
    orderBy: {
      fecha_valoracion: "desc",
    },
    select: {
      id_valoracion: true,
      puntuacion: true,
      comentario: true,
      fecha_valoracion: true,
    },
  });

  const ratings: RestaurantRatingDto[] = valoraciones.map((valoracion) => ({
    id: valoracion.id_valoracion,
    score: valoracion.puntuacion,
    comment: valoracion.comentario,
    createdAt: valoracion.fecha_valoracion.toISOString(),
  }));

  const totalRatings = ratings.length;
  const averageScore =
    totalRatings === 0
      ? 0
      : Number(
          (
            ratings.reduce((total, rating) => total + rating.score, 0) /
            totalRatings
          ).toFixed(2)
        );

  return {
    averageScore,
    totalRatings,
    ratings,
  };
}
  async create(
    userId: number,
    restaurantId: number,
    input: CreateRestaurantRatingInput
  ): Promise<RestaurantRatingDto> {
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      throw new RatingsServiceError(
        401,
        "INVALID_TOKEN",
        "El usuario autenticado no es válido"
      );
    }

    if (!Number.isSafeInteger(restaurantId) || restaurantId <= 0) {
      throw new RatingsServiceError(
        400,
        "INVALID_RESTAURANT_ID",
        "El restaurante indicado no es válido"
      );
    }

    if (
      !Number.isInteger(input.score) ||
      input.score < 1 ||
      input.score > 5
    ) {
      throw new RatingsServiceError(
        400,
        "INVALID_RATING_SCORE",
        "La puntuación debe ser un número entero entre 1 y 5"
      );
    }

    if (
      input.comment !== undefined &&
      input.comment !== null &&
      typeof input.comment !== "string"
    ) {
      throw new RatingsServiceError(
        400,
        "INVALID_RATING_COMMENT",
        "El comentario debe ser un texto"
      );
    }

    const restaurant = await prisma.restaurantes.findUnique({
      where: {
        id_restaurante: restaurantId,
      },
      select: {
        id_restaurante: true,
      },
    });

    if (!restaurant) {
      throw new RatingsServiceError(
        404,
        "RESTAURANT_NOT_FOUND",
        "No se encontró el restaurante solicitado"
      );
    }

    const completedOrder = await prisma.pedidos.findFirst({
      where: {
        id_usuario_cliente: userId,
        id_restaurante: restaurantId,
        estado_simulado: ORDER_STATUS.COMPLETED,
      },
      select: {
        id_pedido: true,
      },
    });

    if (!completedOrder) {
      throw new RatingsServiceError(
        403,
        "COMPLETED_ORDER_REQUIRED",
        "Debes tener un pedido completado en este restaurante para valorarlo"
      );
    }

    const comment = input.comment === undefined
    ? undefined
    : input.comment?.trim() || null;

    try {
      const rating = await prisma.valoraciones.create({
        data: {
          id_usuario: userId,
          id_restaurante: restaurantId,
          puntuacion: input.score,
          comentario: comment,
        },
        select: {
          id_valoracion: true,
          puntuacion: true,
          comentario: true,
          fecha_valoracion: true,
        },
      });

      return {
        id: rating.id_valoracion,
        score: rating.puntuacion,
        comment: rating.comentario,
        createdAt: rating.fecha_valoracion.toISOString(),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new RatingsServiceError(
          409,
          "RATING_ALREADY_EXISTS",
          "Ya tienes una valoración para este restaurante"
        );
      }

      throw error;
    }
  }

  async update(
    userId: number,
    restaurantId: number,
    input: CreateRestaurantRatingInput
  ): Promise<RestaurantRatingDto> {
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      throw new RatingsServiceError(
        401,
        "INVALID_TOKEN",
        "El usuario autenticado no es válido"
      );
    }

    if (!Number.isSafeInteger(restaurantId) || restaurantId <= 0) {
      throw new RatingsServiceError(
        400,
        "INVALID_RESTAURANT_ID",
        "El restaurante indicado no es válido"
      );
    }

    if (
      !Number.isInteger(input.score) ||
      input.score < 1 ||
      input.score > 5
    ) {
      throw new RatingsServiceError(
        400,
        "INVALID_RATING_SCORE",
        "La puntuación debe ser un número entero entre 1 y 5"
      );
    }

    if (
      input.comment !== undefined &&
      input.comment !== null &&
      typeof input.comment !== "string"
    ) {
      throw new RatingsServiceError(
        400,
        "INVALID_RATING_COMMENT",
        "El comentario debe ser un texto"
      );
    }

    const existingRating = await prisma.valoraciones.findFirst({
      where: {
        id_usuario: userId,
        id_restaurante: restaurantId,
      },
      select: {
        id_valoracion: true,
      },
    });

    if (!existingRating) {
      throw new RatingsServiceError(
        404,
        "RATING_NOT_FOUND",
        "No tienes una valoración registrada para este restaurante"
      );
    }

    const rating = await prisma.valoraciones.update({
      where: {
        id_valoracion: existingRating.id_valoracion,
      },
      data: {
        puntuacion: input.score,
        comentario: input.comment?.trim() || null,
      },
      select: {
        id_valoracion: true,
        puntuacion: true,
        comentario: true,
        fecha_valoracion: true,
      },
    });

    return {
      id: rating.id_valoracion,
      score: rating.puntuacion,
      comment: rating.comentario,
      createdAt: rating.fecha_valoracion.toISOString(),
    };
  }

}

export const ratingsService = new RatingsService();
