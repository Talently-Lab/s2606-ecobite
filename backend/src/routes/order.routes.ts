import { Router } from "express";
import { autenticarUsuario } from "../middlewares/auth.middleware";
import { createOrder } from "../controllers/order.controller";

const router = Router();

router.post("/", autenticarUsuario, (req, res) =>
  createOrder(req, res)
);

export default router;
