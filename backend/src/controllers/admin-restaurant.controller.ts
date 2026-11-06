import { NextFunction, Request, Response } from "express";
import { adminRestaurantService } from "../services/admin-restaurant.service";
import { AdminCrudError } from "../services/admin-crud.error";

export class AdminRestaurantController {
  async getAll(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = await adminRestaurantService.getAll();

      res.status(200).json({
        message: "Restaurantes obtenidos correctamente",
        data,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({
        message: "El ID del restaurante no es válido",
        code: "INVALID_RESTAURANT_ID",
      });
      return;
    }

    try {
      const data = await adminRestaurantService.getById(id);

      res.status(200).json({
        message: "Restaurante obtenido correctamente",
        data,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = await adminRestaurantService.create(
        req.body as Parameters<typeof adminRestaurantService.create>[0]
      );

      res.status(201).json({
        message: "Restaurante creado correctamente",
        data,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({
        message: "El ID del restaurante no es válido",
        code: "INVALID_RESTAURANT_ID",
      });
      return;
    }

    try {
      const data = await adminRestaurantService.update(
        id,
        req.body as Parameters<typeof adminRestaurantService.update>[1]
      );

      res.status(200).json({
        message: "Restaurante actualizado correctamente",
        data,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async updateStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const id = Number(req.params.id);
    const { activo } = req.body as { activo?: unknown };

    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({
        message: "El ID del restaurante no es válido",
        code: "INVALID_RESTAURANT_ID",
      });
      return;
    }

    if (typeof activo !== "boolean") {
      res.status(400).json({
        message: "El campo activo debe ser booleano",
        code: "INVALID_RESTAURANT_STATUS",
      });
      return;
    }

    try {
      const data = await adminRestaurantService.updateStatus(id, activo);

      res.status(200).json({
        message: "Estado del restaurante actualizado correctamente",
        data,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  private handleError(
    error: unknown,
    res: Response,
    next: NextFunction
  ): void {
    if (error instanceof AdminCrudError) {
      res.status(error.statusCode).json({
        message: error.message,
        code: error.code,
      });
      return;
    }

    next(error);
  }
}

export const adminRestaurantController = new AdminRestaurantController();
