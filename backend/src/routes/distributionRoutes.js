import express from "express";
import {
  createDistribution,
  getAllDistributions,
  getDistributionsByBeneficiary,
  updateDistribution,
  deleteDistribution,
} from "../controllers/distributionController.js";

const router = express.Router();

// Create a new distribution (will also subtract from stock)
router.post("/", createDistribution);

// Get all distributions with populated info
router.get("/", getAllDistributions);

// Get distributions for a specific beneficiary
router.get("/beneficiary/:beneficiaryId", getDistributionsByBeneficiary);

// Update a distribution (optional: you may adjust stock here as well)
router.put("/:id", updateDistribution);

// Delete a distribution (optional: you may add back the quantity to stock)
router.delete("/:id", deleteDistribution);

export default router;
