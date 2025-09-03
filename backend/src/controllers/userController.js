import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ...existing code...
export const register = async (req, res) => {
  try {
    const { name, email, phone, nationalId, role } = req.body;

    // Check required fields
    if (!name || !email || !phone) {
      return res.status(400).json({ message: "Please provide name, email, and phone" });
    }

    // nationalId is optional for backward compatibility but recommended
    if (!nationalId) {
      return res.status(400).json({ message: "National ID is required for new registrations" });
    }

    // Set default role if not provided
    const userRole = role || "umunyabuzima"; // Default role

    // Check if user exists (email, phone, or nationalId)
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }, { nationalId }],
    });
    if (existingUser) {
      return res.status(400).json({
        message:
          "User with provided email, phone, or national ID already exists",
      });
    }

    // Hash password
    const password = "123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      nationalId,
      password: hashedPassword,
      role: userRole, // Always insert role
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        nationalId: user.nationalId,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user (by email or phone)
// ...existing code...
export const login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        nationalId: user.nationalId,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ...existing code...

// Update user
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      message: "User updated",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        nationalId: user.nationalId,
        role: user.role,
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user
export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Fetch all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // Exclude password for security
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
