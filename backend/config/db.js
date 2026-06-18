import mongoose from "mongoose";
import env from "./env.js";
import { logger } from "./logger.js";

let cachedDBConnection = null;

export default async function connectDB() {
  mongoose.set("strictQuery", true);
  try {
    // Check if a connection is already established
    if (cachedDBConnection) {
      console.log("Using cached database connection");
      return cachedDBConnection;
    }

    const conn = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    logger.info(
      `✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}:${conn.connection.port}`,
    );

    cachedDBConnection = conn;
    return conn;
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    throw err;
  }
}

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});
