const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Equipment name is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Power Tools",
        "Hand Tools",
        "Outdoor Equipment",
        "Cleaning Equipment",
        "Safety Equipment",
        "Measuring Equipment",
        "Others",
      ],
      required: [true, "Category is required"],
    },
    customCategory: {
      type: String,
      trim: true,
      // Used when category is "Others"
    },
    description: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    dailyRate: {
      type: Number,
      min: [0, "Daily rate cannot be negative"],
      default: 0,
    },
    status: {
      type: String,
      enum: ["available", "maintenance", "retired"],
      default: "available",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvalNotes: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
      // Stores filename (e.g., "equipment-1234567890.jpg")
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for faster queries
equipmentSchema.index({ status: 1 });
equipmentSchema.index({ category: 1 });
equipmentSchema.index({ createdBy: 1 });
equipmentSchema.index({ approved: 1 });

const Equipment = mongoose.model("Equipment", equipmentSchema);

module.exports = Equipment;
