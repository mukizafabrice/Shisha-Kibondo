import Beneficiaries from "../models/Beneficiaries.js";
import Distribution from "../models/Distribution.js";
import Product from "../models/Product.js";
import ProgramDay from "../models/ProgramDay.js";

// Get comprehensive 6-month report for health worker
export const getComprehensiveReport = async (req, res) => {
  try {
    const userId = req.user.id; // User ID is now available from auth middleware
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      beneficiaryCount,
      activeBeneficiaries,
      newBeneficiaries,
      totalDistributions,
      recentDistributions,
      distributionTrends,
      beneficiaryTrends,
      attendanceStats,
      childGenderStats
    ] = await Promise.all([
      Beneficiaries.countDocuments({ userId }),
      Beneficiaries.countDocuments({ userId, status: "active" }),
      Beneficiaries.countDocuments({ userId, createdAt: { $gte: sixMonthsAgo } }),
      Distribution.countDocuments({ userId }),
      Distribution.countDocuments({ userId, distributionDate: { $gte: sixMonthsAgo } }),
      // Monthly distribution trends
      Distribution.aggregate([
        { $match: { userId: userId, distributionDate: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: "$distributionDate" },
              month: { $month: "$distributionDate" }
            },
            count: { $sum: 1 },
            totalQuantity: { $sum: "$quantityKg" }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      // Monthly beneficiary trends
      Beneficiaries.aggregate([
        { $match: { userId: userId, createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      // Attendance statistics based on distributions
      Distribution.aggregate([
        {
          $lookup: {
            from: "beneficiaries",
            localField: "beneficiaryId",
            foreignField: "_id",
            as: "beneficiary"
          }
        },
        {
          $match: {
            "beneficiary.userId": userId,
            distributionDate: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: null,
            totalDistributions: { $sum: 1 }
          }
        }
      ]),
      // Child gender statistics
      Beneficiaries.aggregate([
        { $match: { userId: userId, type: "child" } },
        {
          $group: {
            _id: "$gender",
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // No stock calculation needed since health worker stock is not used

    // Calculate attendance rate based on distributions
    const attendanceData = attendanceStats[0] || { totalDistributions: 0 };
    const attendanceRate = attendanceData.totalDistributions > 0 ?
      Math.round((attendanceData.totalDistributions / beneficiaryCount) * 100) : 0;

    // Process child gender stats
    const childGenderData = {};
    childGenderStats.forEach(stat => {
      childGenderData[stat._id] = stat.count;
    });
    const maleChildren = childGenderData.male || 0;
    const femaleChildren = childGenderData.female || 0;

    res.status(200).json({
      overview: {
        beneficiaryCount,
        activeBeneficiaries,
        newBeneficiariesLast6Months: newBeneficiaries,
        totalDistributions,
        recentDistributionsLast6Months: recentDistributions,
        attendanceRate,
        totalDistributions: attendanceData.totalDistributions,
        attendedDays: attendanceData.totalDistributions,
        maleChildren,
        femaleChildren
      },
      details: {
        distributionTrends,
        beneficiaryTrends
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching comprehensive report", error: error.message });
  }
};

// Get beneficiaries assigned to the health worker
export const getAssignedBeneficiaries = async (req, res) => {
  try {
    const userId = req.user.id;

    const beneficiaries = await Beneficiaries.find({ userId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(beneficiaries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assigned beneficiaries", error: error.message });
  }
};

// Get beneficiary details with program days
export const getBeneficiaryDetails = async (req, res) => {
  try {
    const { beneficiaryId } = req.params;
    const userId = req.user.id;

    // Verify the beneficiary belongs to this health worker
    const beneficiary = await Beneficiaries.findOne({ _id: beneficiaryId, userId });
    if (!beneficiary) {
      return res.status(404).json({ message: "Beneficiary not found or not assigned to you" });
    }

    const programDays = await ProgramDay.find({ beneficiaryId })
      .sort({ date: -1 });

    const distributions = await Distribution.find({ beneficiaryId })
      .populate('productId', 'name')
      .sort({ distributionDate: -1 });

    res.status(200).json({
      beneficiary,
      programDays,
      distributions
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching beneficiary details", error: error.message });
  }
};

// Get stock levels for the health worker - REMOVED: Health worker stock functionality no longer used

// Get distribution history for the health worker
export const getDistributionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, page = 1, limit = 20 } = req.query;

    let query = { userId };

    if (startDate && endDate) {
      query.distributionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const distributions = await Distribution.find(query)
      .populate('beneficiaryId', 'firstName lastName village type')
      .populate('productId', 'name')
      .sort({ distributionDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Distribution.countDocuments(query);

    res.status(200).json({
      distributions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching distribution history", error: error.message });
  }
};

// Get beneficiary attendance report
export const getBeneficiaryAttendanceReport = async (req, res) => {
  try {
    const userId = req.user.id;

    const beneficiaries = await Beneficiaries.find({ userId })
      .select('firstName lastName village type status attendanceRate totalProgramDays completedDays')
      .sort({ attendanceRate: -1 });

    const attendanceStats = {
      excellent: beneficiaries.filter(b => b.attendanceRate >= 90).length,
      good: beneficiaries.filter(b => b.attendanceRate >= 75 && b.attendanceRate < 90).length,
      needsImprovement: beneficiaries.filter(b => b.attendanceRate < 75).length
    };

    res.status(200).json({
      beneficiaries,
      attendanceStats
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance report", error: error.message });
  }
};

// Get program day summary
export const getProgramDaySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let matchStage = {};

    // First get beneficiaries assigned to this health worker
    const beneficiaryIds = await Beneficiaries.find({ userId }).select('_id');

    if (beneficiaryIds.length > 0) {
      matchStage.beneficiaryId = { $in: beneficiaryIds.map(b => b._id) };
    }

    if (startDate && endDate) {
      matchStage.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const programDays = await ProgramDay.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "beneficiaries",
          localField: "beneficiaryId",
          foreignField: "_id",
          as: "beneficiary"
        }
      },
      {
        $project: {
          beneficiaryName: {
            $concat: [
              { $arrayElemAt: ["$beneficiary.firstName", 0] },
              " ",
              { $arrayElemAt: ["$beneficiary.lastName", 0] }
            ]
          },
          village: { $arrayElemAt: ["$beneficiary.village", 0] },
          dayNumber: 1,
          date: 1,
          attended: 1,
          notes: 1,
          activityType: 1
        }
      },
      { $sort: { date: -1 } }
    ]);

    const summary = {
      totalDays: programDays.length,
      attendedDays: programDays.filter(day => day.attended).length,
      missedDays: programDays.filter(day => !day.attended).length,
      attendanceRate: programDays.length > 0 ?
        Math.round((programDays.filter(day => day.attended).length / programDays.length) * 100) : 0
    };

    res.status(200).json({
      summary,
      programDays
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching program day summary", error: error.message });
  }
};