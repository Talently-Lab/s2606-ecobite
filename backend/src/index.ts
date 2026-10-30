import express from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";
import authRoutes from "./routes/auth.routes";
import homeRoutes from "./routes/home.routes";
import catalogRoutes from "./routes/catalog.routes";
import orderConfirmationRoutes from "./routes/order-confirmation.routes";
import orderRoutes from "./routes/order.routes";
import swaggerUi from "swagger-ui-express";
import { getCurrentInvoke } from "@codegenie/serverless-express";
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

const swaggerHtml = swaggerUi.generateHTML(swaggerSpec);

app.get(["/api-docs", "/api-docs/"], (_req, res) => {
  const stage = getCurrentInvoke().event?.requestContext?.stage;
  const baseHref =
    typeof stage === "string" && stage.length > 0
      ? `/${stage}/api-docs/`
      : "/api-docs/";

  res
    .type("html")
    .send(swaggerHtml.replace("<head>", `<head><base href="${baseHref}">`));
});
app.use("/api-docs", swaggerUi.serveWithOptions({ redirect: false }));

app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/restaurantes", catalogRoutes);
app.use("/api/pedidos", orderRoutes);
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