import Product from "../models/Product.js";
import MainStock from "../models/MainStock.js";

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Product name is required" });
    }

    const cleanName = name.trim().toLowerCase();

    // Check if product with the same name already exists (case-insensitive)
    const existingProduct = await Product.findOne({
      name: { $regex: new RegExp(`^${cleanName}$`, "i") }
    });

    if (existingProduct) {
      return res
        .status(400)
        .json({ message: "Product with this name already exists" });
    }

    // Create product
    const product = await Product.create({ name: cleanName, description });

    // Ensure main stock exists
    const mainStock = await MainStock.findOne({ productId: product._id });
    if (!mainStock) {
      await MainStock.create({ productId: product._id, quantity: 0 });
    }

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Product name is required" });
    }

    const cleanName = name.trim().toLowerCase();

    // Check for duplicate name (case-insensitive, excluding current product)
    const duplicate = await Product.findOne({
      name: { $regex: new RegExp(`^${cleanName}$`, "i") },
      _id: { $ne: id }
    });

    if (duplicate) {
      return res
        .status(400)
        .json({ message: "Another product with this name already exists" });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { name: cleanName, description },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Also delete associated main stock
    await MainStock.findOneAndDelete({ productId: id });

    res.json({ message: "Product and associated stock deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
