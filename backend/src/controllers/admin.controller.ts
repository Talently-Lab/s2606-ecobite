import { NextFunction, Request, Response } from "express";
import { adminService } from "../services/admin.service";

export class AdminController {
  async getDashboard(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = await adminService.getDashboard();

      res.status(200).json({
        message: "Panel administrativo obtenido correctamente",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
