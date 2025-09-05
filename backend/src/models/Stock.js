  import mongoose from "mongoose";

  const stockSchema = new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Please assign a user (health worker)"],
      },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Please assign a user (health worker)"],
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

  const Stock = mongoose.model("Stock", stockSchema);

  export default Stock;
