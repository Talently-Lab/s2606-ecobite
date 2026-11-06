import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { adminRestaurantController } from "../controllers/admin-restaurant.controller";
import { adminDishController } from "../controllers/admin-dish.controller";
import {
  autenticarUsuario,
  requireRole,
} from "../middlewares/auth.middleware";

const router = Router();

router.use(autenticarUsuario, requireRole("admin"));

// Dashboard
router.get(
  "/dashboard",
  adminController.getDashboard.bind(adminController)
);

// CRUD de restaurantes
router.get(
  "/restaurantes",
  adminRestaurantController.getAll.bind(adminRestaurantController)
);

router.get(
  "/restaurantes/:id",
  adminRestaurantController.getById.bind(adminRestaurantController)
);

router.post(
  "/restaurantes",
  adminRestaurantController.create.bind(adminRestaurantController)
);

router.put(
  "/restaurantes/:id",
  adminRestaurantController.update.bind(adminRestaurantController)
);

router.patch(
  "/restaurantes/:id/estado",
  adminRestaurantController.updateStatus.bind(adminRestaurantController)
);

// CRUD de platillos
router.get(
  "/platillos",
  adminDishController.getAll.bind(adminDishController)
);

router.get(
  "/platillos/:id",
  adminDishController.getById.bind(adminDishController)
);

router.post(
  "/platillos",
  adminDishController.create.bind(adminDishController)
);

router.put(
  "/platillos/:id",
  adminDishController.update.bind(adminDishController)
);

router.patch(
  "/platillos/:id/estado",
  adminDishController.updateStatus.bind(adminDishController)
);

export default router;
