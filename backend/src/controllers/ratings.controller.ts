import { NextFunction, Request, Response } from "express";
import {
  ratingsService,
  RatingsServiceError,
  type CreateRestaurantRatingInput,
} from "../services/ratings.service";

export class RatingsController {
  async getByRestaurantId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const restaurantId = Number(req.params.id);

    if (!Number.isSafeInteger(restaurantId) || restaurantId <= 0)  {
      res.status(400).json({
        error: {
          code: "INVALID_RESTAURANT_ID",
          message: "El identificador del restaurante no es válido",
          fields: {
            id: "Debe ser un número entero positivo",
          },
        },
      });
      return;
    }

    try {
      const data = await ratingsService.getByRestaurantId(restaurantId);

      if (data === null) {
        res.status(404).json({
          error: {
            code: "RESTAURANT_NOT_FOUND",
            message: "No se encontró el restaurante solicitado",
            fields: {},
          },
        });
        return;
      }

      res.status(200).json({
        message: "Valoraciones obtenidas correctamente",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const restaurantId = Number(req.params.id);
    const userId = Number(req.usuario?.sub);

    if (!Number.isSafeInteger(restaurantId) || restaurantId <= 0) {
      res.status(400).json({
        message: "El identificador del restaurante no es válido",
        code: "INVALID_RESTAURANT_ID",
      });
      return;
    }

    const body: unknown = req.body;

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      res.status(400).json({
        message: "El cuerpo de la solicitud debe ser un objeto JSON",
        code: "INVALID_BODY",
      });
      return;
    }

    const payload = body as Record<string, unknown>;

    if (
      typeof payload.score !== "number" ||
      (payload.comment !== undefined &&
        payload.comment !== null &&
        typeof payload.comment !== "string")
    ) {
      res.status(400).json({
        message: "score es obligatorio y comment debe ser un texto opcional",
        code: "INVALID_BODY",
      });
      return;
    }

    const input: CreateRestaurantRatingInput = {
      score: payload.score,
      comment: payload.comment as string | null | undefined,
    };

    try {
      const data = await ratingsService.create(
        userId,
        restaurantId,
        input
      );

      res.status(201).json({
        message: "Valoración creada correctamente",
        data,
      });
    } catch (error) {
      if (error instanceof RatingsServiceError) {
        res.status(error.statusCode).json({
          message: error.message,
          code: error.code,
        });
        return;
      }

      next(error);
    }
  }

  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const restaurantId = Number(req.params.id);
    const userId = Number(req.usuario?.sub);

    if (!Number.isSafeInteger(restaurantId) || restaurantId <= 0) {
      res.status(400).json({
        message: "El identificador del restaurante no es válido",
        code: "INVALID_RESTAURANT_ID",
      });
      return;
    }

    const body: unknown = req.body;

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      res.status(400).json({
        message: "El cuerpo de la solicitud debe ser un objeto JSON",
        code: "INVALID_BODY",
      });
      return;
    }

    const payload = body as Record<string, unknown>;

    if (
      typeof payload.score !== "number" ||
      (payload.comment !== undefined &&
        payload.comment !== null &&
        typeof payload.comment !== "string")
    ) {
      res.status(400).json({
        message: "score es obligatorio y comment debe ser un texto opcional",
        code: "INVALID_BODY",
      });
      return;
    }

    const input: CreateRestaurantRatingInput = {
      score: payload.score,
      comment: payload.comment as string | null | undefined,
    };

    try {
      const data = await ratingsService.update(
        userId,
        restaurantId,
        input
      );

      res.status(200).json({
        message: "Valoración actualizada correctamente",
        data,
      });
    } catch (error) {
      if (error instanceof RatingsServiceError) {
        res.status(error.statusCode).json({
          message: error.message,
          code: error.code,
        });
        return;
      }

      next(error);
    }
  }
}
