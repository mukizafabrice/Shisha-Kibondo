import express from "express";
import {
  getStock,
  createStock,
  updateStock,
  deleteStock,
} from "../controllers/stockController.js";

const router = express.Router();

export default router;
// Create stock
router.post("/stocks", createStock);
// Get all stocks
router.get("/stocks", getStock);
// Get stock by user ID
router.get("/stocks/:userId", getStock);
// Update stock by ID
router.put("/stocks/:id", updateStock);
// Delete stock by ID
router.delete("/stocks/:id", deleteStock);
// Main stock route
