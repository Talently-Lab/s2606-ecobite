import { NextFunction, Request, Response } from "express";
import { adminDishService } from "../services/admin-dish.service";
import { AdminCrudError } from "../services/admin-crud.error";

export class AdminDishController {
  async getAll(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = await adminDishService.getAll();

      res.status(200).json({
        message: "Platillos obtenidos correctamente",
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
        message: "El ID del platillo no es válido",
        code: "INVALID_DISH_ID",
      });
      return;
    }

    try {
      const data = await adminDishService.getById(id);

      res.status(200).json({
        message: "Platillo obtenido correctamente",
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
      const data = await adminDishService.create(
        req.body as Parameters<typeof adminDishService.create>[0]
      );

      res.status(201).json({
        message: "Platillo creado correctamente",
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
        message: "El ID del platillo no es válido",
        code: "INVALID_DISH_ID",
      });
      return;
    }

    try {
      const data = await adminDishService.update(
        id,
        req.body as Parameters<typeof adminDishService.update>[1]
      );

      res.status(200).json({
        message: "Platillo actualizado correctamente",
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
    const { disponible } = req.body as { disponible?: unknown };

    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({
        message: "El ID del platillo no es válido",
        code: "INVALID_DISH_ID",
      });
      return;
    }

    if (typeof disponible !== "boolean") {
      res.status(400).json({
        message: "El campo disponible debe ser booleano",
        code: "INVALID_DISH_STATUS",
      });
      return;
    }

    try {
      const data = await adminDishService.updateStatus(id, disponible);

      res.status(200).json({
        message: "Estado del platillo actualizado correctamente",
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

export const adminDishController = new AdminDishController();
