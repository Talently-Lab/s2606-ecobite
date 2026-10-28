import { Router } from "express";
import { autenticarUsuario } from "../middlewares/auth.middleware";
import { orderConfirmationController } from "../controllers/order-confirmation.controller";

const router = Router();

router.get(
  "/:id/confirmacion",
  autenticarUsuario,
  (req, res, next) =>
    orderConfirmationController.getOrderConfirmation(req, res, next)
);

export default router;
