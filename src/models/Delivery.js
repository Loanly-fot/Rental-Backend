const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    rentalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rental",
      required: [true, "Rental ID is required"],
    },
    deliveryPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["assigned", "delivered", "returned"],
      default: "assigned",
    },
    address: {
      type: String,
      required: [true, "Delivery address is required"],
      trim: true,
    },
    deliveryNotes: {
      type: String,
      trim: true,
    },
    deliveredAt: {
      type: Date,
    },
    returnedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for faster queries
deliverySchema.index({ rentalId: 1 });
deliverySchema.index({ deliveryPersonId: 1 });
deliverySchema.index({ status: 1 });

const Delivery = mongoose.model("Delivery", deliverySchema);

module.exports = Delivery;
