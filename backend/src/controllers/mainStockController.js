import MainStock from "../models/MainStock.js";

import User from "../models/User.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

// Create main stock
export const createMainStock = async (req, res) => {
  try {
    const { productId, totalStock } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Valid productId is required" });
    }

    if (totalStock == null || totalStock < 0) {
      return res
        .status(400)
        .json({ message: "Total stock is required and cannot be negative" });
    }

    // Ensure product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const mainStock = await MainStock.create({ productId, totalStock });
    res.status(201).json(mainStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all main stock with product details
export const getMainStocks = async (req, res) => {
  try {
    const mainStock = await MainStock.find()
      .populate("productId", "name description") // populate product fields
      .sort({ createdAt: -1 });

    if (!mainStock || mainStock.length === 0) {
      return res.status(404).json({ message: "No main stock found" });
    }

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
