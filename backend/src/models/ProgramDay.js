import mongoose from "mongoose";

const programDaySchema = new mongoose.Schema(
  {
    beneficiaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Beneficiaries",
      required: [true, "Beneficiary ID is required"],
    },
    dayNumber: {
      type: Number,
      required: [true, "Day number is required"],
      min: 1,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    attended: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    activityType: {
      type: String,
      enum: ["check-in", "attendance", "activity", "assessment"],
      default: "check-in",
    },
  },
  { timestamps: true }
);

// Compound index to ensure unique day numbers per beneficiary
programDaySchema.index({ beneficiaryId: 1, dayNumber: 1 }, { unique: true });

// Index for efficient date-based queries
programDaySchema.index({ date: 1 });

const ProgramDay = mongoose.model("ProgramDay", programDaySchema);

export default ProgramDay;