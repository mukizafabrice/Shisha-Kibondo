import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Please add a phone number"],
      unique: true,
      trim: true,
    },
    nationalId: {
      type: String,
      required: function () {
        // Only require nationalId for new users, not for existing ones
        return this.isNew;
      },
      unique: true,
      sparse: true, // Allow null values for unique index
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["manager", "umunyabuzima"],
      default: "umunyabuzima",
    },

    // 🔑 Reset password fields``t11  11``5`````
    resetPasswordToken: {
      type: String, // store OTP as string (numeric but easier to handle as string)
      required: false,
    },
    resetPasswordExpires: {
      type: Date, // expiry time
      required: false,
    },
    resetPasswordVerified: {
      type: Boolean, // optional: mark OTP as used
      default: false,
    },
  },
  { timestamps: true }
);

// Post-delete hook to remove related documents
userSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;

  const userId = doc._id;

  try {
    await Promise.all([
      mongoose.model("Beneficiaries").deleteMany({ userId }),
      mongoose.model("Stock").deleteMany({ userId }),
    ]);
  } catch (err) {
    console.error(`Error during cascading delete for user ${userId}:`, err);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
