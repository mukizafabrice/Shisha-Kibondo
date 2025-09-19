import mongoose from "mongoose";

const beneficiariesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please assign a user (health worker)"],
    },
    nationalId: {
      type: String,
      required: [true, "Please add a national ID"],
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, "Please add a first name"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Please add a last name"],
      trim: true,
    },
    village: {
      type: String,
      required: [true, "Please add a village"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Please specify beneficiary type"],
      enum: ["pregnant", "breastfeeding", "child"],
    },
    status: {
      type: String,
      required: [true, "Please specify status"],
      enum: ["active", "inactive"],
      default: "active",
    },
    totalProgramDays: {
      type: Number,
      default: 0,
    },
    completedDays: {
      type: Number,
      default: 0,
    },
    attendanceRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ✅ New column to track admission
    admissionStatus: {
      type: String,
      enum: ["pending", "admitted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Virtuals & Methods remain unchanged
beneficiariesSchema.virtual("programDays", {
  ref: "ProgramDay",
  localField: "_id",
  foreignField: "beneficiaryId",
});

beneficiariesSchema.virtual("assignedUser", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

beneficiariesSchema.set("toJSON", { virtuals: true });
beneficiariesSchema.set("toObject", { virtuals: true });

beneficiariesSchema.methods.calculateAttendanceRate = function () {
  if (this.totalProgramDays === 0) {
    this.attendanceRate = 0;
  } else {
    this.attendanceRate = Math.round(
      (this.completedDays / this.totalProgramDays) * 100
    );
  }
  return this.attendanceRate;
};

const Beneficiaries = mongoose.model("Beneficiaries", beneficiariesSchema);

export default Beneficiaries;
