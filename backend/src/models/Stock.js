import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    totalStock: {
      type: Number,
      required: [true, "Please add total stock quantity"],
      min: [0, "Total stock cannot be negative"],
      default: 0,
    },
  },
  { timestamps: true }
);

const Stock = mongoose.model("Stock", stockSchema);

export default Stock;