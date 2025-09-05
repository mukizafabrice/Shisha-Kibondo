import express from "express";
import {
  createMainStock,
  getMainStocks,
  updateMainStock,
  deleteMainStock,
} from "../controllers/mainStockController.js";

const router = express.Router();

// Create new stock
router.post("/", createMainStock);

// Get all stocks (with product populated)
router.get("/", getMainStocks);

// Update stock by ID
router.put("/:id", updateMainStock);

// Delete stock by ID
router.delete("/:id", deleteMainStock);

export default router;
