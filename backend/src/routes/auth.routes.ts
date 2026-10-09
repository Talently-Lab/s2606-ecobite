import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { autenticarUsuario } from "../middlewares/auth.middleware";
import { rateLimit } from "express-rate-limit";

const router = Router();
const authController = new AuthController();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Demasiados intentos. Inténtalo nuevamente más tarde.",
      fields: {},
    },
  },
});

router.post("/register", authLimiter, (req, res) =>
  authController.register(req, res)
);

router.post("/login", authLimiter, (req, res) =>
  authController.login(req, res)
);

router.get("/me", autenticarUsuario, (req, res) => {
  return res.status(200).json({
    message: "Usuario autenticado",
    user: req.usuario,
  });
});

export default router;