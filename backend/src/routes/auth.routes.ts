import { Router } from "express";

import { AuthController } from "../controllers/auth.controller";
import { autenticarUsuario } from "../middlewares/auth.middleware";     

const router = Router();
const authController = new AuthController();

router.post("/register", (req, res) =>
  authController.register(req, res)
);

router.post("/login", (req, res) =>
  authController.login(req, res)
);

router.get("/me", autenticarUsuario, (req, res) => {
  return res.status(200).json({
    message: "Usuario autenticado",
    user: req.usuario,
  });
});

export default router;