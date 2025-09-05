import mongoose from "mongoose";

const MainStockSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "crate stock must be linked to a product"],
    },
    totalStock: {
      type: Number,
      required: [true, "Please add total stock quantity"],
      min: [0, "Total stock cannot be negative"],
      default: 0,
    },
  },
  { timestamps: true }
);

const MainStock = mongoose.model("MainStock", MainStockSchema);

export default MainStock;
