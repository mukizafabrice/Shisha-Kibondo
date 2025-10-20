import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getComprehensiveReport,
  getAssignedBeneficiaries,
  getBeneficiaryDetails,
  getDistributionHistory,
  getBeneficiaryAttendanceReport,
  getProgramDaySummary
} from "../controllers/healthWorkerReportController.js";

const router = express.Router();

// All routes require health worker authentication
router.use(protect);
router.get("/comprehensive", getComprehensiveReport);
router.get("/beneficiaries", getAssignedBeneficiaries);
router.get("/beneficiaries/:beneficiaryId/details", getBeneficiaryDetails);
router.get("/distributions", getDistributionHistory);
router.get("/attendance", getBeneficiaryAttendanceReport);
router.get("/program-days", getProgramDaySummary);

export default router;