import { Router } from "express";
import { CheckoutController } from "../controllers/checkout.controller";
import { autenticarUsuario } from "../middlewares/auth.middleware";

const router = Router();
const checkoutController = new CheckoutController();

router.post(
  "/cotizar",
  autenticarUsuario,
  (req, res, next) => checkoutController.quote(req, res, next)
);

export default router;
