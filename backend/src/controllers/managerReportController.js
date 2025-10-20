import Beneficiaries from "../models/Beneficiaries.js";
import Distribution from "../models/Distribution.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import MainStock from "../models/MainStock.js";
import Stock from "../models/Stock.js";
import MainStockTransaction from "../models/MainStockTransaction.js";
import DistributeToUmunyabuzima from "../models/DistributeToUmunyabuzima.js";

// Get comprehensive 6-month report
export const getComprehensiveReport = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      totalBeneficiaries,
      activeBeneficiaries,
      newBeneficiaries,
      totalDistributions,
      recentDistributions,
      totalProducts,
      totalUsers,
      totalMainStock,
      distributionTrends,
      beneficiaryTrends,
      stockTrends,
      childGenderStats
    ] = await Promise.all([
      Beneficiaries.countDocuments(),
      Beneficiaries.countDocuments({ status: "active" }),
      Beneficiaries.countDocuments({ createdAt: { $gte: sixMonthsAgo } }),
      Distribution.countDocuments(),
      Distribution.countDocuments({ distributionDate: { $gte: sixMonthsAgo } }),
      Product.countDocuments(),
      User.countDocuments(),
      MainStock.aggregate([{ $group: { _id: null, total: { $sum: "$totalStock" } } }]),
      // Monthly distribution trends
      Distribution.aggregate([
        { $match: { distributionDate: { $gte: sixMonthsAgo } } },
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
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
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
      // Stock transaction trends
      MainStockTransaction.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            transactions: { $sum: 1 },
            totalStockChange: {
              $sum: {
                $cond: {
                  if: { $eq: ["$type", "in"] },
                  then: "$totalStock",
                  else: { $multiply: ["$totalStock", -1] }
                }
              }
            }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      // Child gender statistics
      Beneficiaries.aggregate([
        { $match: { type: "child" } },
        {
          $group: {
            _id: "$gender",
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const mainStockTotal = totalMainStock[0]?.total || 0;

    // Process child gender stats
    const childGenderData = {};
    childGenderStats.forEach(stat => {
      childGenderData[stat._id] = stat.count;
    });
    const maleChildren = childGenderData.male || 0;
    const femaleChildren = childGenderData.female || 0;

    res.status(200).json({
      overview: {
        totalBeneficiaries,
        activeBeneficiaries,
        newBeneficiariesLast6Months: newBeneficiaries,
        totalDistributions,
        recentDistributionsLast6Months: recentDistributions,
        totalProducts,
        totalUsers,
        totalMainStock: mainStockTotal,
        maleChildren,
        femaleChildren
      },
      trends: {
        distributions: distributionTrends,
        beneficiaries: beneficiaryTrends,
        stockTransactions: stockTrends
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching comprehensive report", error: error.message });
  }
};

// Get beneficiary statistics by type and status
export const getBeneficiaryReport = async (req, res) => {
  try {
    const stats = await Beneficiaries.aggregate([
      {
        $group: {
          _id: { type: "$type", status: "$status" },
          count: { $sum: 1 },
          avgAttendanceRate: { $avg: "$attendanceRate" }
        }
      },
      {
        $group: {
          _id: "$_id.type",
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count",
              avgAttendanceRate: { $round: ["$avgAttendanceRate", 2] }
            }
          },
          totalCount: { $sum: "$count" }
        }
      }
    ]);

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching beneficiary report", error: error.message });
  }
};

// Get distribution statistics
export const getDistributionReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchStage = {};
    if (startDate && endDate) {
      matchStage.distributionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Distribution.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $group: {
          _id: {
            productId: "$productId",
            productName: { $arrayElemAt: ["$product.name", 0] },
            userId: "$userId",
            userName: { $arrayElemAt: ["$user.name", 0] }
          },
          totalQuantity: { $sum: "$quantityKg" },
          distributionCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.productId",
          productName: { $first: "$_id.productName" },
          distributions: {
            $push: {
              userId: "$_id.userId",
              userName: "$_id.userName",
              totalQuantity: "$totalQuantity",
              distributionCount: "$distributionCount"
            }
          },
          totalQuantity: { $sum: "$totalQuantity" },
          totalDistributions: { $sum: "$distributionCount" }
        }
      }
    ]);

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching distribution report", error: error.message });
  }
};

// Get stock levels report
export const getStockReport = async (req, res) => {
  try {
    const [mainStock, healthWorkerStock] = await Promise.all([
      MainStock.aggregate([
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "product"
          }
        },
        {
          $project: {
            productName: { $arrayElemAt: ["$product.name", 0] },
            totalStock: 1
          }
        }
      ]),
      Stock.aggregate([
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "product"
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $project: {
            productName: { $arrayElemAt: ["$product.name", 0] },
            userName: { $arrayElemAt: ["$user.name", 0] },
            totalStock: 1
          }
        }
      ])
    ]);

    res.status(200).json({
      mainStock,
      healthWorkerStock
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stock report", error: error.message });
  }
};

// Get user activity report
export const getUserActivityReport = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "beneficiaries",
          localField: "_id",
          foreignField: "userId",
          as: "beneficiaries"
        }
      },
      {
        $lookup: {
          from: "distributions",
          localField: "_id",
          foreignField: "userId",
          as: "distributions"
        }
      },
      {
        $lookup: {
          from: "stocks",
          localField: "_id",
          foreignField: "userId",
          as: "stocks"
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          beneficiaryCount: { $size: "$beneficiaries" },
          distributionCount: { $size: "$distributions" },
          stockItems: { $size: "$stocks" },
          totalStock: { $sum: "$stocks.totalStock" }
        }
      }
    ]);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user activity report", error: error.message });
  }
};

// Get main stock transaction history
export const getMainStockTransactionReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchStage = {};
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const transactions = await MainStockTransaction.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $project: {
          productName: { $arrayElemAt: ["$product.name", 0] },
          totalStock: 1,
          type: 1,
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching main stock transaction report", error: error.message });
  }
};