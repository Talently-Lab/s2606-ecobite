import { NextFunction, Request, Response } from "express";
import { orderConfirmationService } from "../services/order-confirmation.service";

export class OrderConfirmationController {
  async getOrderConfirmation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const orderId = Number(req.params.id);
    const userId = Number(req.usuario?.sub);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      res.status(400).json({
        error: {
          code: "INVALID_ORDER_ID",
          message: "El identificador del pedido no es válido",
          fields: {
            id: "Debe ser un número entero positivo",
          },
        },
      });
      return;
    }

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      res.status(401).json({
        error: {
          code: "INVALID_TOKEN",
          message: "El usuario autenticado no es válido",
          fields: {},
        },
      });
      return;
    }

    try {
      const data = await orderConfirmationService.getByOrderId(
        orderId,
        userId
      );

      if (!data) {
        res.status(404).json({
          error: {
            code: "ORDER_NOT_FOUND",
            message: "No se encontró el pedido solicitado",
            fields: {},
          },
        });
        return;
      }

      res.status(200).json({
        message: "Confirmación del pedido obtenida correctamente",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const orderConfirmationController = new OrderConfirmationController();
