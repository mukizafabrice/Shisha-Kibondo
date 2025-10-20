import express from "express";
import {
  getComprehensiveReport,
  getBeneficiaryReport,
  getDistributionReport,
  getStockReport,
  getUserActivityReport,
  getMainStockTransactionReport
} from "../controllers/managerReportController.js";

const router = express.Router();

// All routes require manager authentication (middleware should be added)
router.get("/comprehensive", getComprehensiveReport);
router.get("/beneficiaries", getBeneficiaryReport);
router.get("/distributions", getDistributionReport);
router.get("/stocks", getStockReport);
router.get("/user-activity", getUserActivityReport);
router.get("/main-stock-transactions", getMainStockTransactionReport);

export default router;