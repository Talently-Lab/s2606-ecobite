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

router.post("/register", authLimiter, (req, res, next) =>
  authController.register(req, res, next)
);

router.post("/login", authLimiter, (req, res, next) =>
  authController.login(req, res, next)
);

router.get("/me", autenticarUsuario, async (req, res, next) => {
  try {
    const userId = Number(req.usuario!.sub);
    const user = await authController.getPublicUser(userId);

    if (!user) {
      return res.status(401).json({
        error: {
          code: "INVALID_TOKEN",
          message: "El token no corresponde a un usuario activo",
          fields: {},
        },
      });
    }

    return res.status(200).json({ message: "Usuario autenticado", user });
  } catch (error) {
    next(error);
  }
});

export default router;
