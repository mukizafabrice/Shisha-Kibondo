import MainStockTransaction from "../models/MainStockTransaction.js";

// Get all main stock transactions
export const getMainStockTransactions = async (req, res) => {
  try {
    const transactions = await MainStockTransaction.find().sort({
      createdAt: -1,
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get transactions by userId
export const getMainStockTransactionByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await MainStockTransaction.find({ userId }).sort({
      createdAt: -1,
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new transaction
export const createMainStockTransaction = async (req, res) => {
  try {
    const { productId, totalStock, userId, type } = req.body;

    if (!productId || !totalStock) {
      return res
        .status(400)
        .json({ message: "Product ID and total stock are required" });
    }

    const transaction = await MainStockTransaction.create({
      productId,
      totalStock,
      userId,
      type,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
