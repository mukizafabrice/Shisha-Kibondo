import express from "express";
import {
  register,
  login,
  update,
  remove,
  getUsers,
} from "../controllers/userController.js";

const router = express.Router();

// Register
router.post("/users/register", register);
router.post("/users/login", login);
router.put("/users/update/:id", update);
router.delete("/users/delete/:id", remove);
router.get("/users", getUsers);

export default router;
