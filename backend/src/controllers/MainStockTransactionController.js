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

//get single main stock transaction by userId
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
// Create a new main stock transaction
