const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema(
  {
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: [true, "Equipment ID is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "active", "completed", "cancelled"],
      default: "pending",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    notes: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, "Quantity must be at least 1"],
    },
    totalCost: {
      type: Number,
      default: 0,
      min: [0, "Total cost cannot be negative"],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for faster queries
rentalSchema.index({ userId: 1 });
rentalSchema.index({ equipmentId: 1 });
rentalSchema.index({ status: 1 });
rentalSchema.index({ startDate: 1 });
rentalSchema.index({ endDate: 1 });

// Validate that endDate is after startDate
rentalSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error("End date must be after start date"));
  } else {
    next();
  }
});

const Rental = mongoose.model("Rental", rentalSchema);

module.exports = Rental;
