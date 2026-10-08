import { Router } from "express";

import { AuthController } from "../controllers/auth.controller";

const router = Router();
const authController = new AuthController();

router.post("/register", (req, res) =>
  authController.register(req, res)
);

export default router;