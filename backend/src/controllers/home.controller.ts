import { NextFunction, Request, Response } from "express";
import { HomeService } from "../services/home.service";

const homeService = new HomeService();

export class HomeController {
  async getHome(
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> {
    try {
      const data = await homeService.getHomeData();

      res.status(200).json({
        message: "Datos obtenidos correctamente",
        data,
      }
    );
    } catch (error) {
      next(error);
    }
  }
}