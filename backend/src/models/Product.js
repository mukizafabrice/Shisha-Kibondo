import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a product name"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

productSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;

  const productId = doc._id;

  try {
    await Promise.all([
      mongoose.model("MainStock").deleteMany({ productId }),
      mongoose.model("MainStockTransaction").deleteMany({ productId }),
      mongoose.model("Distribution").deleteMany({ productId }),
      mongoose.model("DistributeToUmunyabuzima").deleteMany({ productId }),
    ]);
  } catch (err) {
    console.error(`Error during cascading delete for user ${productId}:`, err);
  }
});
const Product = mongoose.model("Product", productSchema);
export default Product;
