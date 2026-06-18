import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import { env, port } from "./config/env.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import applicationRoutes from "./routes/applications.js";
import { logger, morganStream } from "./config/logger.js";

const app = express();
const PORT = port;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan(env.isProd ? "combined" : "dev", { stream: morganStream }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);

// Health check
app.get("/", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
async function start() {
  try {
    await connectDB();
    // console.info("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

start();
