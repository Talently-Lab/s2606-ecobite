import express from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";
import authRoutes from "./routes/auth.routes";
import homeRoutes from "./routes/home.routes";
import catalogRoutes from "./routes/catalog.routes";
import orderConfirmationRoutes from "./routes/order-confirmation.routes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

const corsOrigin = process.env.CORS_ORIGIN;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === corsOrigin) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
  })
);

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/restaurantes", catalogRoutes);
app.use("/api/pedidos", orderConfirmationRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "EcoBite API funcionando",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ecobite-api",
  });
});

app.use(errorMiddleware);


if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor EcoBite corriendo en puerto ${PORT}`);
  });
}
export default app;