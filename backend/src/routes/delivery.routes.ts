import { Router } from "express";
import { deliveryRateLimit } from "../middlewares/delivery-rate-limit";
import {
  DeliveryError,
  estimateDelivery,
  searchAddresses,
} from "../services/delivery.service";
const router = Router();
router.use(deliveryRateLimit);
router.get("/addresses", async (req, res, next) => {
  try {
    res.json({ data: await searchAddresses(req.query.q) });
  } catch (error) {
    if (error instanceof DeliveryError)
      res
        .status(error.statusCode)
        .json({ message: error.message, code: error.code });
    else next(error);
  }
});
router.post("/estimate", async (req, res, next) => {
  try {
    res.json({
      data: await estimateDelivery(
        req.body?.restaurantId,
        req.body?.destination,
      ),
    });
  } catch (error) {
    if (error instanceof DeliveryError)
      res
        .status(error.statusCode)
        .json({ message: error.message, code: error.code });
    else next(error);
  }
});
export default router;
