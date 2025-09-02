import express from "express";
import {
  register,
  login,
  update,
  remove,
} from "../controllers/userController.js";

const router = express.Router();

// Register
router.post("/register", register);
router.post("/login", login);
router.put("/update/:id", update);
router.delete("/delete/:id", remove);

export default router;
