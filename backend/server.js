import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./db.js";
import userRoutes from "./src/routes/userRoutes.js";
import beneficiaryRoutes from "./src/routes/beneficiaryRoutes.js";
import distributeToUmunyabuzimaRoutes from "./src/routes/distributeToUmunyabuzimaRoutes.js";
import stockRoutes from "./src/routes/stockRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import mainStockRoutes from "./src/routes/mainStockRoutes.js";
// All middleware imports and usage removed

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS middleware for specific origins
const allowedOrigins = ["http://172.20.10.2:8081", "http://localhost:5000"];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Server is running successfully!");
});

// Apply API routes
app.use("/api", userRoutes);
app.use("/api", beneficiaryRoutes);
app.use("/api/distibute-umunyabuzima", distributeToUmunyabuzimaRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/products", productRoutes);
app.use("/api/main-stock", mainStockRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server started on http://localhost:${PORT}`);
      console.log("🟢 MongoDB is running and connected!");
      // Removed scheduledStatusUpdate and related logs
    });
  })
  .catch(() => {
    console.log("❌ Failed to connect to MongoDB. Server not started.");
  });
