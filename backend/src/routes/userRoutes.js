import express from "express";
import {
  register,
  login,
  update,
  remove,
  getUsers,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../controllers/userController.js";

const router = express.Router();

// Register
router.post("/users/register", register);
router.post("/users/login", login);
router.put("/users/update/:id", update);
router.delete("/users/delete/:id", remove);
router.get("/users", getUsers);
router.post("/users/forgot-password", forgotPassword);
router.post("/users/verify-otp", verifyOtp); // optional
router.post("/users/reset-password", resetPassword);

export default router;
