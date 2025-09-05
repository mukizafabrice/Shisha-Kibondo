import Beneficiaries from "../models/Beneficiaries.js";
import ProgramDay from "../models/ProgramDay.js";
import mongoose from "mongoose";

// Create a new beneficiary
export const createBeneficiary = async (req, res) => {
  try {
    const { userId, nationalId, firstName, lastName, village, type } = req.body;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Check if beneficiary already exists
    const existingBeneficiary = await Beneficiaries.findOne({ nationalId });
    if (existingBeneficiary) {
      return res.status(400).json({
        success: false,
        message: "Beneficiary with this national ID already exists",
      });
    }

    const beneficiary = new Beneficiaries({
      userId,
      nationalId,
      firstName,
      lastName,
      village,
      type,
      status: "active",
    });

    await beneficiary.save();

    // Populate the assigned user information
    await beneficiary.populate("assignedUser", "name email role");

    res.status(201).json({
      success: true,
      message: "Beneficiary created successfully",
      data: beneficiary,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all beneficiaries
export const getBeneficiaries = async (req, res) => {
  try {
    const { status, type, village, userId, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (village) filter.village = new RegExp(village, "i");
    if (userId && mongoose.Types.ObjectId.isValid(userId))
      filter.userId = userId;

    const skip = (page - 1) * limit;

    const beneficiaries = await Beneficiaries.find(filter)
      .populate("programDays")
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Beneficiaries.countDocuments(filter);
    // console.log("Total beneficiaries found:", beneficiaries);
    // Update completion status for all beneficiaries
    // await Beneficiaries.updateCompletedStatuses();

    res.status(200).json({
      success: true,
      data: beneficiaries,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: beneficiaries.length,
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

// Get a single beneficiary by ID
export const getBeneficiary = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid beneficiary ID",
      });
    }

    const beneficiary = await Beneficiaries.findById(id)
      .populate("programDays")
      .populate("userId", "name email role");

    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: "Beneficiary not found",
      });
    }

    // Check and update completion status
    // beneficiary.checkProgramCompletion();
    // await beneficiary.save();

    res.status(200).json({
      success: true,
      data: beneficiary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a beneficiary
export const updateBeneficiary = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid beneficiary ID",
      });
    }

    const beneficiary = await Beneficiaries.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("assignedUser", "name email role");

    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: "Beneficiary not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Beneficiary updated successfully",
      data: beneficiary,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a beneficiary
export const deleteBeneficiary = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid beneficiary ID",
      });
    }

    // Delete all associated program days first
    await ProgramDay.deleteMany({ beneficiaryId: id });

    const beneficiary = await Beneficiaries.findByIdAndDelete(id);

    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: "Beneficiary not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Beneficiary deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add a program day for a beneficiary
export const addProgramDay = async (req, res) => {
  try {
    const { beneficiaryId } = req.params;
    const { dayNumber, date, activityType = "check-in", notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(beneficiaryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid beneficiary ID",
      });
    }

    const beneficiary = await Beneficiaries.findById(beneficiaryId);
    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: "Beneficiary not found",
      });
    }

    // Check if day already exists
    const existingDay = await ProgramDay.findOne({
      beneficiaryId,
      dayNumber,
    });

    if (existingDay) {
      return res.status(400).json({
        success: false,
        message: "Program day already exists for this beneficiary",
      });
    }

    const programDay = new ProgramDay({
      beneficiaryId,
      dayNumber,
      date: date || new Date(),
      activityType,
      notes,
    });

    await programDay.save();

    // Update beneficiary's total program days
    beneficiary.totalProgramDays += 1;
    await beneficiary.save();

    res.status(201).json({
      success: true,
      message: "Program day added successfully",
      data: programDay,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update program day attendance
export const updateProgramDayAttendance = async (req, res) => {
  try {
    const { beneficiaryId, dayId } = req.params;
    const { attended, notes } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(beneficiaryId) ||
      !mongoose.Types.ObjectId.isValid(dayId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid beneficiary or day ID",
      });
    }

    const programDay = await ProgramDay.findOne({
      _id: dayId,
      beneficiaryId,
    });

    if (!programDay) {
      return res.status(404).json({
        success: false,
        message: "Program day not found",
      });
    }

    const wasAttended = programDay.attended;
    programDay.attended = attended;
    if (notes !== undefined) programDay.notes = notes;

    await programDay.save();

    // Update beneficiary's completed days count
    const beneficiary = await Beneficiaries.findById(beneficiaryId);
    if (beneficiary) {
      if (attended && !wasAttended) {
        beneficiary.completedDays += 1;
      } else if (!attended && wasAttended) {
        beneficiary.completedDays = Math.max(0, beneficiary.completedDays - 1);
      }

      beneficiary.calculateAttendanceRate();
      await beneficiary.save();
    }

    res.status(200).json({
      success: true,
      message: "Program day attendance updated successfully",
      data: programDay,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get program days for a beneficiary
export const getProgramDays = async (req, res) => {
  try {
    const { beneficiaryId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(beneficiaryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid beneficiary ID",
      });
    }

    const skip = (page - 1) * limit;

    const programDays = await ProgramDay.find({ beneficiaryId })
      .sort({ dayNumber: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ProgramDay.countDocuments({ beneficiaryId });

    res.status(200).json({
      success: true,
      data: programDays,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: programDays.length,
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

// Remove a program day
export const removeProgramDay = async (req, res) => {
  try {
    const { beneficiaryId, dayId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(beneficiaryId) ||
      !mongoose.Types.ObjectId.isValid(dayId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid beneficiary or day ID",
      });
    }

    const programDay = await ProgramDay.findOne({
      _id: dayId,
      beneficiaryId,
    });

    if (!programDay) {
      return res.status(404).json({
        success: false,
        message: "Program day not found",
      });
    }

    const wasAttended = programDay.attended;
    await ProgramDay.findByIdAndDelete(dayId);

    // Update beneficiary's counts
    const beneficiary = await Beneficiaries.findById(beneficiaryId);
    if (beneficiary) {
      beneficiary.totalProgramDays = Math.max(
        0,
        beneficiary.totalProgramDays - 1
      );
      if (wasAttended) {
        beneficiary.completedDays = Math.max(0, beneficiary.completedDays - 1);
      }
      beneficiary.calculateAttendanceRate();
      await beneficiary.save();
    }

    res.status(200).json({
      success: true,
      message: "Program day removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get beneficiary statistics
export const getBeneficiaryStats = async (req, res) => {
  try {
    const stats = await Beneficiaries.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ["$status", "active"] }, 1, 0],
            },
          },
          inactive: {
            $sum: {
              $cond: [{ $eq: ["$status", "inactive"] }, 1, 0],
            },
          },
          pregnant: {
            $sum: {
              $cond: [{ $eq: ["$type", "pregnant"] }, 1, 0],
            },
          },
          breastfeeding: {
            $sum: {
              $cond: [{ $eq: ["$type", "breastfeeding"] }, 1, 0],
            },
          },
          child: {
            $sum: {
              $cond: [{ $eq: ["$type", "child"] }, 1, 0],
            },
          },
          averageAttendance: { $avg: "$attendanceRate" },
        },
      },
    ]);

    const result = stats[0] || {
      total: 0,
      active: 0,
      inactive: 0,
      pregnant: 0,
      breastfeeding: 0,
      child: 0,
      averageAttendance: 0,
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
