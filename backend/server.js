import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // Import cors
import { connectDB } from "./db.js";
import userRoutes from "./src/routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS middleware for specific origins
const allowedOrigins = ["http://192.168.1.95:8081", "http://localhost"];
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
app.use("/api/users", userRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server started on http://localhost:${PORT}`);
      console.log("🟢 MongoDB is running and connected!");
    });
  })
  .catch(() => {
    console.log("❌ Failed to connect to MongoDB. Server not started.");
  });
