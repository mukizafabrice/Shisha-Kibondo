import DistributeToUmunyabuzima from "../models/DistributeToUmunyabuzima.js";
import MainStock from "../models/MainStock.js";
import MainStockTransaction from "../models/MainStockTransaction.js";
import mongoose from "mongoose";

// Create a new distribution record
export const createDistribution = async (req, res) => {
  try {
    const { beneficiaryId, productId, quantity } = req.body;

    // Validate beneficiaryId
    if (!mongoose.Types.ObjectId.isValid(beneficiaryId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid beneficiary ID" });
    }

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    if (!quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be positive" });
    }

    // Check MainStock availability
    const mainStock = await MainStock.findOne({ productId });
    if (!mainStock || mainStock.totalStock < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough stock in main stock" });
    }

    // Subtract from MainStock
    mainStock.totalStock -= quantity;
    await mainStock.save();

    // Create distribution record
    const distribution = new DistributeToUmunyabuzima({
      beneficiaryId,
      productId,
      quantity,
    });
    await distribution.save();

    // Track stock transaction
    await MainStockTransaction.create({
      productId,
      totalStock: quantity,
      type: "OUT",
    });

    res.status(201).json({
      success: true,
      message: "Distribution created and stock updated successfully",
      data: distribution,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all distribution records
export const getDistributions = async (req, res) => {
  try {
    const { beneficiaryId, productId, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (beneficiaryId && mongoose.Types.ObjectId.isValid(beneficiaryId)) {
      filter.beneficiaryId = beneficiaryId;
    }
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      filter.productId = productId;
    }

    const skip = (page - 1) * limit;

    const distributions = await DistributeToUmunyabuzima.find(filter)
      .populate("beneficiaryId", "firstName lastName type")
      .populate("productId", "name description")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DistributeToUmunyabuzima.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: distributions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: distributions.length,
        totalRecords: total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single distribution record by ID
export const getDistribution = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid distribution ID" });
    }

    const distribution = await DistributeToUmunyabuzima.findById(id)
      .populate("beneficiaryId", "firstName lastName type")
      .populate("productId", "name description");

    if (!distribution) {
      return res
        .status(404)
        .json({ success: false, message: "Distribution record not found" });
    }

    res.status(200).json({ success: true, data: distribution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a distribution record
export const updateDistribution = async (req, res) => {
  try {
    const { id } = req.params;
    const { beneficiaryId, productId, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid distribution ID" });
    }

    const updates = {};
    if (beneficiaryId && mongoose.Types.ObjectId.isValid(beneficiaryId)) {
      updates.beneficiaryId = beneficiaryId;
    }
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      updates.productId = productId;
    }
    if (quantity) {
      updates.quantity = quantity;
    }

    const distribution = await DistributeToUmunyabuzima.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate("beneficiaryId", "firstName lastName type")
      .populate("productId", "name description");

    if (!distribution) {
      return res
        .status(404)
        .json({ success: false, message: "Distribution record not found" });
    }

    res.status(200).json({
      success: true,
      message: "Distribution record updated successfully",
      data: distribution,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a distribution record
export const deleteDistribution = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid distribution ID" });
    }

    const distribution = await DistributeToUmunyabuzima.findByIdAndDelete(id);

    if (!distribution) {
      return res
        .status(404)
        .json({ success: false, message: "Distribution record not found" });
    }

    res.status(200).json({
      success: true,
      message: "Distribution record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get distribution statistics
export const getDistributionStats = async (req, res) => {
  try {
    const stats = await DistributeToUmunyabuzima.aggregate([
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          averageQuantity: { $avg: "$quantity" },
          maxQuantity: { $max: "$quantity" },
          minQuantity: { $min: "$quantity" },
        },
      },
    ]);

    const result = stats[0] || {
      totalRecords: 0,
      totalQuantity: 0,
      averageQuantity: 0,
      maxQuantity: 0,
      minQuantity: 0,
    };

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
