import type { Request, Response } from "express";
import {
  orderService,
  OrderServiceError,
  type CreateOrderInput,
} from "../services/order.service";
import { orderConfirmationService } from "../services/order-confirmation.service";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.usuario?.sub);
    const body: unknown = req.body;

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return res.status(400).json({
        message: "El cuerpo de la solicitud debe ser un objeto JSON",
        code: "INVALID_BODY",
      });
    }

    const payload = body as Record<string, unknown>;

    if (
      typeof payload.restaurantId !== "number" ||
      typeof payload.zone !== "string" ||
      !Array.isArray(payload.items)
    ) {
      return res.status(400).json({
        message: "restaurantId, zone e items son obligatorios y deben tener el formato correcto",
        code: "INVALID_BODY",
      });
    }

    const validItems = payload.items.every(
      (item: unknown) =>
        typeof item === "object" &&
        item !== null &&
        !Array.isArray(item) &&
        typeof (item as Record<string, unknown>).dishId === "number" &&
        typeof (item as Record<string, unknown>).quantity === "number"
    );

    if (!validItems) {
      return res.status(400).json({
        message: "Cada elemento de items debe incluir dishId y quantity numéricos",
        code: "INVALID_ITEMS",
      });
    }

    const input: CreateOrderInput = {
      restaurantId: payload.restaurantId,
      zone: payload.zone,
      items: payload.items as CreateOrderInput["items"],
    };

    const order = await orderService.createOrder(userId, input);

    const confirmation = await orderConfirmationService.getByOrderId(
      order.id_pedido,
      userId
    );

    if (!confirmation) {
      return res.status(500).json({
        message: "Error interno durante la creación del pedido o la generación de su confirmación",
        code: "ORDER_CONFIRMATION_FAILED",
      });
    }

    return res.status(201).json({
      message: "Pedido creado correctamente",
      data: confirmation,
    });
  } catch (error) {
    if (error instanceof OrderServiceError) {
      return res.status(error.statusCode).json({
        message: error.message,
        code: error.code,
      });
    }

    return res.status(500).json({
      message: "Error interno al crear el pedido",
      code: "ORDER_CREATION_FAILED",
    });
  }
};
