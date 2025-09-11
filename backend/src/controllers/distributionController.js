import Distribution from "../models/Distribution.js";
import Stock from "../models/Stock.js";
import Beneficiaries from "../models/Beneficiaries.js"; // import model

export const createDistribution = async (req, res) => {
  try {
    const { beneficiaryId, productId, quantityKg, userId } = req.body;

    if (!beneficiaryId || !productId || !quantityKg || !userId) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    // Check stock availability
    const stock = await Stock.findOne({ productId });
    if (!stock)
      return res
        .status(400)
        .json({ message: "No stock available for this product." });
    if (stock.totalStock < quantityKg)
      return res.status(400).json({ message: "Not enough stock available." });

    // Subtract stock
    stock.totalStock -= quantityKg;
    await stock.save();

    // Create the distribution
    const distribution = await Distribution.create({
      beneficiaryId,
      productId,
      quantityKg,
      userId,
    });

    // Update beneficiary program progress
    // Update beneficiary program progress
    const beneficiary = await Beneficiaries.findById(beneficiaryId);
    if (beneficiary) {
      if (beneficiary.completedDays >= beneficiary.totalProgramDays) {
        return res.status(400).json({
          message:
            "Attendance exceeds total program days. Progress update blocked.",
        });
      }

      beneficiary.completedDays += 1;
      beneficiary.calculateAttendanceRate(); // updates attendanceRate
      await beneficiary.save();
    }

    res.status(201).json({
      message: "Distribution successful, beneficiary progress updated.",
      distribution,
      beneficiary,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all distributions with populated info
export const getAllDistributions = async (req, res) => {
  try {
    const distributions = await Distribution.find()
      .populate("beneficiaryId")
      .populate("productId", "name") // populate product name
      .populate("userId", "name email");

    res.status(200).json(distributions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get distributions by beneficiary
export const getDistributionsByBeneficiary = async (req, res) => {
  try {
    const { beneficiaryId } = req.params;
    const distributions = await Distribution.find({ beneficiaryId })
      .populate("beneficiaryId")
      .populate("productId", "name")
      .populate("userId", "name email");

    res.status(200).json(distributions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a distribution
export const updateDistribution = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedDistribution = await Distribution.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!updatedDistribution)
      return res.status(404).json({ message: "Distribution not found." });
    res.status(200).json(updatedDistribution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a distribution
export const deleteDistribution = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Distribution.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Distribution not found." });
    res.status(200).json({ message: "Distribution deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
