import express from "express";
import {
  createDistribution,
  getDistributions,
  getDistribution,
  updateDistribution,
  deleteDistribution,
  getDistributionStats,
} from "../controllers/distributeToUmunyabuzimaController.js";

const router = express.Router();

// Distribution CRUD routes
router.post("/distribute-to-umunyabuzima", createDistribution);
router.get("/distribute-to-umunyabuzima", getDistributions);
router.get("/distribute-to-umunyabuzima/stats", getDistributionStats);
router.get("/distribute-to-umunyabuzima/user/:userId", getDistributions); // Get distributions by user ID
router.get("/distribute-to-umunyabuzima/:id", getDistribution);
router.put("/distribute-to-umunyabuzima/:id", updateDistribution);
router.delete("/distribute-to-umunyabuzima/:id", deleteDistribution);

export default router;