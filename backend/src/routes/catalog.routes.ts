import { Router } from "express";
import { CatalogController } from "../controllers/catalog.controller";

const router = Router();
const catalogController = new CatalogController();

router.get("/", (req, res, next) =>
  catalogController.getRestaurants(req, res, next)
);

router.get("/:id", (req, res, next) =>
  catalogController.getRestaurantMenu(req, res, next)
);

export default router;
