import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import testRoutes from "./routes/test";
import adminRoutes from "./routes/admin";
import questionsRoutes from "./routes/questions";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/test", testRoutes);
app.use("/admin", adminRoutes);
app.use("/questions", questionsRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => console.log(`✅ Backend rodando na porta ${PORT}`));
