import express from "express";
import {
  createBeneficiary,
  getBeneficiaries,
  getBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
  addProgramDay,
  updateProgramDayAttendance,
  getProgramDays,
  removeProgramDay,
  getBeneficiaryStats,
} from "../controllers/beneficiaryController.js";

const router = express.Router();

// Beneficiary CRUD routes
router.post("/beneficiaries", createBeneficiary);
router.get("/beneficiaries", getBeneficiaries);
router.get("/beneficiaries/stats", getBeneficiaryStats);
router.get("/beneficiaries/user/:userId", getBeneficiaries); // Get beneficiaries by user ID
router.get("/beneficiaries/:id", getBeneficiary);
router.put("/beneficiaries/:id", updateBeneficiary);
router.delete("/beneficiaries/:id", deleteBeneficiary);

// Program day management routes
router.post("/beneficiaries/:beneficiaryId/days", addProgramDay);
router.get("/beneficiaries/:beneficiaryId/days", getProgramDays);
router.put("/beneficiaries/:beneficiaryId/days/:dayId", updateProgramDayAttendance);
router.delete("/beneficiaries/:beneficiaryId/days/:dayId", removeProgramDay);

export default router;