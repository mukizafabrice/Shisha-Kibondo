import express from "express";
import {
  getMainStockTransactions,
  getMainStockTransactionByUserId,
  createMainStockTransaction,
} from "../controllers/MainStockTransactionController.js";

const router = express.Router();

// Get all transactions
router.get("/", getMainStockTransactions);
// Get transactions by userId
router.get("/:userId", getMainStockTransactionByUserId);
// Create new transaction
router.post("/", createMainStockTransaction);

export default router;
