import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import {
  autenticarUsuario,
  requireRole,
} from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/dashboard",
  autenticarUsuario,
  requireRole("admin"),
  adminController.getDashboard.bind(adminController)
);

export default router;
