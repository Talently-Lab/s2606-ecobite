import { Router } from "express";
import { HomeController } from "../controllers/home.controller";
import { autenticarUsuarioOpcional } from "../middlewares/optional-auth.middleware";

const router = Router();
const homeController = new HomeController();

router.get(
  "/",
  autenticarUsuarioOpcional,
  (req, res, next) => homeController.getHome(req, res, next)
);

export default router;
