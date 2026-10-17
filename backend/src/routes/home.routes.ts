import { Router } from "express";
import { HomeController } from "../controllers/home.controller";

const router = Router();
const homeController = new HomeController();


router.get("/", (req, res, next) =>
  homeController.getHome(req, res, next)
);

export default router;
