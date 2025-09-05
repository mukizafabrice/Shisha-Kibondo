import Stock from "../models/Stock.js";
import mongoose from "mongoose";

// Create stock
export const createStock = async (req, res) => {
  try {
    const { userId, productId, totalStock } = req.body;

    if (!userId || !productId) {
      return res
        .status(400)
        .json({ message: "User ID and Product ID are required" });
    }
    if (totalStock == null || totalStock < 0) {
      return res
        .status(400)
        .json({ message: "Total stock is required and cannot be negative" });
    }

    // Check if stock for this user & product already exists
    const existingStock = await Stock.findOne({ userId, productId });
    if (existingStock) {
      return res
        .status(400)
        .json({ message: "Stock for this user and product already exists" });
    }

    const stock = await Stock.create({ userId, productId, totalStock });
    res.status(201).json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all stocks (optionally filter by userId)
export const getStock = async (req, res) => {
  const { userId } = req.query;
  try {
    const filter = userId ? { userId } : {};
    const stocks = await Stock.find(filter)
      .populate("userId", "name email phone role")
      .populate("productId", "name description"); // Populate product details

    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update stock
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid stock ID" });
    }

    const { totalStock } = req.body;
    if (totalStock == null || totalStock < 0) {
      return res
        .status(400)
        .json({ message: "Total stock is required and cannot be negative" });
    }

    const stock = await Stock.findByIdAndUpdate(
      id,
      { totalStock },
      { new: true, runValidators: true }
    )
      .populate("userId", "name email phone role")
      .populate("productId", "name description");

    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete stock
export const deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid stock ID" });
    }

    const stock = await Stock.findByIdAndDelete(id);
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }
    res.json({ message: "Stock deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
