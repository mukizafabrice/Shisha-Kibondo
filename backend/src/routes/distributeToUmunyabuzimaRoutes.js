import express from "express";
import {
  createDistribution,
  getDistributions,
  getDistribution,
  updateDistribution,
  deleteDistribution,
} from "../controllers/distributeToUmunyabuzimaController.js";

const router = express.Router();

// Create new distribution
router.post("/", createDistribution);

// Get all distributions
router.get("/", getDistributions);

// Get single distribution by ID
router.get("/:id", getDistribution);

// Update distribution (adjusts stock accordingly)
router.put("/:id", updateDistribution);

// Delete distribution (restore stock accordingly)
router.delete("/:id", deleteDistribution);

export default router;
