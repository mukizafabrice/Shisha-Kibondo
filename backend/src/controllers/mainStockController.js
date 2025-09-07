import MainStock from "../models/MainStock.js";
import MainStockTransaction from "../models/MainStockTransaction.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

/**
 * @desc Creates or updates a main stock record for a product and logs the transaction.
 * @route POST /api/main-stock
 * @access Private (assuming authentication middleware is used)
 */
export const createMainStock = async (req, res) => {
  try {
    let { productId, totalStock } = req.body;

    // 1. Input Validation
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Valid productId is required" });
    }

    // Convert totalStock to a number and validate it
    totalStock = Number(totalStock);
    if (isNaN(totalStock) || totalStock <= 0) {
      return res
        .status(400)
        .json({ message: "Total stock must be a positive number" });
    }

    // 2. Product Existence Check
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 3. Find and Update/Create Main Stock
    // Find the existing main stock record for the product
    let mainStock = await MainStock.findOne({ productId });

    if (mainStock) {
      // If a record exists, update the total stock by adding the new quantity
      mainStock.totalStock += totalStock;
      await mainStock.save();
    } else {
      // If no record exists, create a new one
      mainStock = await MainStock.create({ productId, totalStock });
    }
    const transaction = await MainStockTransaction.create({
      productId: productId,
      totalStock: totalStock, // Uses the amount of stock being added
      type: "IN", // "IN" signifies a stock inflow
    });
    console.log("Transaction created successfully:", transaction);

    // 5. Respond to Client
    console.log("Sending response with transaction:", transaction);
    res.status(201).json({
      message: "Stock updated successfully",
      mainStock,
      transaction, // Return both documents for confirmation
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      console.error("Validation Error:", errors);
      return res.status(400).json({ message: "Validation failed", errors });
    }
    console.error("Server Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export default createMainStock;

// Get all main stock with product details
export const getMainStocks = async (req, res) => {
  try {
    const mainStock = await MainStock.find()
      .populate("productId", "name description") // populate product fields
      .sort({ createdAt: -1 });

    res.json(mainStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update main stock
export const updateMainStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId, totalStock } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid stock ID" });
    }

    if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    if (totalStock == null || totalStock < 0) {
      return res
        .status(400)
        .json({ message: "Total stock is required and cannot be negative" });
    }

    // Ensure product exists if updating productId
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
    }

    const mainStock = await MainStock.findByIdAndUpdate(
      id,
      { productId, totalStock },
      { new: true, runValidators: true }
    ).populate("productId", "name description");

    if (!mainStock) {
      return res.status(404).json({ message: "Main stock not found" });
    }

    res.json(mainStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete main stock
export const deleteMainStock = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid stock ID" });
    }

    const mainStock = await MainStock.findByIdAndDelete(id);
    if (!mainStock) {
      return res.status(404).json({ message: "Main stock not found" });
    }

    res.json({ message: "Main stock deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
