import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

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

app.listen(PORT, () => {
  console.log(`Servidor EcoBite corriendo en puerto ${PORT}`);
});
