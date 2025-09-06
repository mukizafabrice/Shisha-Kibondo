import mongoose from "mongoose";

const MainStockTransactionSchema = new mongoose.Schema(
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
    },
    type: {
      type: String,
      enum: ["IN", "OUT"],
      required: [true, "Transaction type is required"],
    },
  },
  { timestamps: true }
);

const MainStockTransaction = mongoose.model(
  "MainStockTransaction",
  MainStockTransactionSchema
);

export default MainStockTransaction;
