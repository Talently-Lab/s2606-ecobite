import { NextFunction, Request, Response } from "express";
import {
  CheckoutError,
  CheckoutService,
} from "../services/checkout.service";

const checkoutService = new CheckoutService();

export class CheckoutController {
  async quote(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await checkoutService.quote(
        req.body
      );

      res.status(200).json({
        message: "Cotización calculada correctamente",
        data: result,
      });
    } catch (error) {
      if (error instanceof CheckoutError) {
        res.status(error.statusCode).json({
          error: {
            code: error.code,
            message: error.message,
            fields: error.fields,
          },
        });
        return;
      }

      next(error);
    }
  }
}
