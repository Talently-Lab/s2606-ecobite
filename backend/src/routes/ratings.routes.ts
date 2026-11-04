import { Router } from "express";
import { RatingsController } from "../controllers/ratings.controller";
import {
  autenticarUsuario,
  requireRole,
} from "../middlewares/auth.middleware";

const router = Router();
const ratingsController = new RatingsController();

router.get("/:id/valoraciones", (req, res, next) =>
  ratingsController.getByRestaurantId(req, res, next)
);

router.post(
  "/:id/valoraciones",
  autenticarUsuario,
  requireRole("cliente"),
  (req, res, next) => ratingsController.create(req, res, next)
);

router.put(
  "/:id/valoraciones",
  autenticarUsuario,
  requireRole("cliente"),
  (req, res, next) => ratingsController.update(req, res, next)
);

export default router;
