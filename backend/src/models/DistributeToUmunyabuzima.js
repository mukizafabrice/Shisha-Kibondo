import mongoose from "mongoose";

const distributeToUmunyabuzimaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user ID"],
    },
    quantity: {
      type: Number,
      required: [true, "Please provide quantity"],
      min: [1, "Quantity must be at least 1"],
    },
  },
  { timestamps: true }
);

// Virtual field to get assigned user
distributeToUmunyabuzimaSchema.virtual('assignedUser', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
distributeToUmunyabuzimaSchema.set('toJSON', { virtuals: true });
distributeToUmunyabuzimaSchema.set('toObject', { virtuals: true });

const DistributeToUmunyabuzima = mongoose.model("DistributeToUmunyabuzima", distributeToUmunyabuzimaSchema);

export default DistributeToUmunyabuzima;