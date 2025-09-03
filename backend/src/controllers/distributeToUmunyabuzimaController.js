import DistributeToUmunyabuzima from "../models/DistributeToUmunyabuzima.js";
import mongoose from "mongoose";

// Create a new distribution record
export const createDistribution = async (req, res) => {
  try {
    const { userId, quantity } = req.body;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const distribution = new DistributeToUmunyabuzima({
      userId,
      quantity,
    });

    await distribution.save();

    // Populate the assigned user information
    await distribution.populate('assignedUser', 'name email role');

    res.status(201).json({
      success: true,
      message: "Distribution record created successfully",
      data: distribution,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all distribution records
export const getDistributions = async (req, res) => {
  try {
    const { userId, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = {};
    if (userId && mongoose.Types.ObjectId.isValid(userId)) filter.userId = userId;

    const skip = (page - 1) * limit;

    const distributions = await DistributeToUmunyabuzima.find(filter)
      .populate('assignedUser', 'name email role')
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single distribution record by ID
export const getDistribution = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid distribution ID",
      });
    }

    const distribution = await DistributeToUmunyabuzima.findById(id)
      .populate('assignedUser', 'name email role');

    if (!distribution) {
      return res.status(404).json({
        success: false,
        message: "Distribution record not found",
      });
    }

    res.status(200).json({
      success: true,
      data: distribution,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a distribution record
export const updateDistribution = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid distribution ID",
      });
    }

    const distribution = await DistributeToUmunyabuzima.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('assignedUser', 'name email role');

    if (!distribution) {
      return res.status(404).json({
        success: false,
        message: "Distribution record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Distribution record updated successfully",
      data: distribution,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a distribution record
export const deleteDistribution = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid distribution ID",
      });
    }

    const distribution = await DistributeToUmunyabuzima.findByIdAndDelete(id);

    if (!distribution) {
      return res.status(404).json({
        success: false,
        message: "Distribution record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Distribution record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
        }
      }
    ]);

    const result = stats[0] || {
      totalRecords: 0,
      totalQuantity: 0,
      averageQuantity: 0,
      maxQuantity: 0,
      minQuantity: 0,
    };

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};