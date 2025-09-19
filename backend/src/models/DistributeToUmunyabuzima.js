import mongoose from "mongoose";

const distributeToUmunyabuzimaSchema = new mongoose.Schema(
  {
    beneficiaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Beneficiaries",
      required: [true, "Please provide a beneficiary ID"],
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // Make sure you have a Product model
      required: [true, "Please provide a product ID"],
    },
    quantity: {
      type: Number,
      required: [true, "Please provide quantity"],
      min: [1, "Quantity must be at least 1"],
    },
  },
  { timestamps: true }
);

const DistributeToUmunyabuzima = mongoose.model(
  "DistributeToUmunyabuzima",
  distributeToUmunyabuzimaSchema
);

export default DistributeToUmunyabuzima;
