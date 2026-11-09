import { rateLimit } from "express-rate-limit";
// shortcut: per-instance limits; configure API Gateway/WAF quotas across workers.
export const deliveryRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
