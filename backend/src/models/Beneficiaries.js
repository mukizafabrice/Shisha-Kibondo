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
  },
  { timestamps: true }
);

// Virtual field to get program days
beneficiariesSchema.virtual('programDays', {
  ref: 'ProgramDay',
  localField: '_id',
  foreignField: 'beneficiaryId'
});

// Virtual field to get assigned user
beneficiariesSchema.virtual('assignedUser', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
beneficiariesSchema.set('toJSON', { virtuals: true });
beneficiariesSchema.set('toObject', { virtuals: true });


// Method to check if program is completed based on duration
// Note: This method is disabled as ending_date is removed
// beneficiariesSchema.methods.checkProgramCompletion = function() {
//   const now = new Date();
//   const endDate = new Date(this.ending_date);

//   if (now >= endDate && this.status !== 'completed') {
//     this.status = 'completed';
//     return true;
//   }
//   return false;
// };

// Method to calculate attendance rate
beneficiariesSchema.methods.calculateAttendanceRate = function() {
  if (this.totalProgramDays === 0) {
    this.attendanceRate = 0;
  } else {
    this.attendanceRate = Math.round((this.completedDays / this.totalProgramDays) * 100);
  }
  return this.attendanceRate;
};

// Method to get days remaining in program
// Note: This method is disabled as ending_date is removed
// beneficiariesSchema.methods.getDaysRemaining = function() {
//   const now = new Date();
//   const endDate = new Date(this.ending_date);
//   const diffTime = endDate - now;
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   return Math.max(0, diffDays);
// };

// Static method to update all beneficiaries' status based on completion
beneficiariesSchema.statics.updateCompletedStatuses = async function() {
  const beneficiaries = await this.find({ status: { $ne: 'completed' } });
  const updates = [];
  
  for (const beneficiary of beneficiaries) {
    if (beneficiary.checkProgramCompletion()) {
      updates.push(beneficiary.save());
    }
  }
  
  return Promise.all(updates);
};

const Beneficiaries = mongoose.model("Beneficiaries", beneficiariesSchema);

export default Beneficiaries;