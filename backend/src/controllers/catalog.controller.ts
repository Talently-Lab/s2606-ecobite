import { NextFunction, Request, Response } from "express";
import {
  getRestaurantCatalog,
  getRestaurantMenu,
} from "../services/catalog.service";

export class CatalogController {
  async getRestaurants(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const search =
        typeof req.query.search === "string"
          ? req.query.search
          : undefined;

      const categoria =
        typeof req.query.categoria === "string"
          ? req.query.categoria
          : undefined;

      const data = await getRestaurantCatalog({ search, categoria });

      res.status(200).json({
        message: "Catálogo obtenido correctamente",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRestaurantMenu(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const restaurantId = Number(req.params.id);

    if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
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
      const data = await getRestaurantMenu(restaurantId);

      if (!data) {
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
        message: "Menú obtenido correctamente",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
