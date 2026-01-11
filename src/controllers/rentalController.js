const Rental = require("../models/Rental");
const Equipment = require("../models/Equipment");
const User = require("../models/User");
const Log = require("../models/Log");

// Get all rentals (Admin only)
exports.getAll = async (req, res) => {
  try {
    const { limit } = req.query;
    let query = Rental.find()
      .populate("equipmentId", "name category dailyRate")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const rentals = await query;

    res.status(200).json({
      success: true,
      count: rentals.length,
      rentals: rentals.map((rental) => ({
        id: rental._id,
        equipmentId: rental.equipmentId?._id,
        equipmentName: rental.equipmentId?.name,
        userId: rental.userId?._id,
        userName: rental.userId?.name,
        status: rental.status,
        startDate: rental.startDate,
        endDate: rental.endDate,
        quantity: rental.quantity,
        totalCost: rental.totalCost,
        notes: rental.notes,
        createdAt: rental.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get all rentals error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching rentals",
      error: error.message,
    });
  }
};

// Get current user's rentals
exports.getMyRentals = async (req, res) => {
  try {
    const userId = req.user.id;

    const rentals = await Rental.find({ userId })
      .populate("equipmentId", "name category dailyRate")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rentals.length,
      rentals: rentals.map((rental) => ({
        id: rental._id,
        equipmentName: rental.equipmentId?.name,
        status: rental.status,
        startDate: rental.startDate,
        endDate: rental.endDate,
        quantity: rental.quantity,
        totalCost: rental.totalCost,
        notes: rental.notes,
        createdAt: rental.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get my rentals error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching rentals",
      error: error.message,
    });
  }
};

// Get rental by ID
exports.getRentalById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    const rental = await Rental.findById(id)
      .populate("equipmentId", "name category description dailyRate")
      .populate("userId", "name email phone");

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found",
      });
    }

    // Check ownership
    if (!isAdmin && rental.userId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own rentals",
      });
    }

    res.status(200).json({
      success: true,
      rental: {
        id: rental._id,
        equipmentId: rental.equipmentId?._id,
        equipmentName: rental.equipmentId?.name,
        equipmentCategory: rental.equipmentId?.category,
        equipmentDescription: rental.equipmentId?.description,
        dailyRate: rental.equipmentId?.dailyRate,
        userId: rental.userId?._id,
        userName: rental.userId?.name,
        userEmail: rental.userId?.email,
        userPhone: rental.userId?.phone,
        status: rental.status,
        startDate: rental.startDate,
        endDate: rental.endDate,
        quantity: rental.quantity,
        totalCost: rental.totalCost,
        notes: rental.notes,
        createdAt: rental.createdAt,
        updatedAt: rental.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get rental by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching rental",
      error: error.message,
    });
  }
};

// Create a rental (User)
exports.createRental = async (req, res) => {
  try {
    const { equipmentId } = req.params;
    const { notes, startDate, endDate, quantity } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // Check if equipment exists and is available
    const equipment = await Equipment.findById(equipmentId);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found",
      });
    }

    if (equipment.status !== "available") {
      return res.status(400).json({
        success: false,
        message: `Equipment is not available (status: ${equipment.status})`,
      });
    }

    // Check if equipment has enough quantity
    const rentalQuantity = quantity || 1;
    if (equipment.quantity < rentalQuantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough equipment quantity available",
      });
    }

    // Calculate total cost
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalCost = days * equipment.dailyRate * rentalQuantity;

    // Create rental
    const rental = await Rental.create({
      equipmentId,
      userId,
      startDate: start,
      endDate: end,
      notes: notes || "",
      quantity: rentalQuantity,
      totalCost,
      status: "pending",
    });

    // Log action
    await Log.create({
      userId,
      action: `Created rental for equipment: ${equipment.name}`,
    });

    const populatedRental = await Rental.findById(rental._id)
      .populate("equipmentId", "name category")
      .populate("userId", "name email");

    res.status(201).json({
      success: true,
      message: "Rental created successfully",
      rental: {
        id: populatedRental._id,
        equipmentName: populatedRental.equipmentId?.name,
        status: populatedRental.status,
        startDate: populatedRental.startDate,
        endDate: populatedRental.endDate,
        quantity: populatedRental.quantity,
        totalCost: populatedRental.totalCost,
        notes: populatedRental.notes,
      },
    });
  } catch (error) {
    console.error("Create rental error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating rental",
      error: error.message,
    });
  }
};

// Update rental status (Admin)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const validStatuses = [
      "pending",
      "approved",
      "active",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const rental = await Rental.findById(id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found",
      });
    }

    rental.status = status;
    await rental.save();

    // Log action
    await Log.create({
      userId,
      action: `Updated rental ${id} status to ${status}`,
    });

    res.status(200).json({
      success: true,
      message: "Rental status updated successfully",
      rental: {
        id: rental._id,
        status: rental.status,
      },
    });
  } catch (error) {
    console.error("Update rental status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating rental status",
      error: error.message,
    });
  }
};

// Cancel rental (User can cancel their own)
exports.cancelRental = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const rental = await Rental.findById(id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found",
      });
    }

    // Check if user owns this rental (unless admin)
    if (userRole !== "admin" && rental.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own rentals",
      });
    }

    // Check if rental can be cancelled
    if (rental.status === "completed" || rental.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel rental with status: ${rental.status}`,
      });
    }

    rental.status = "cancelled";
    await rental.save();

    // Log action
    await Log.create({
      userId,
      action: `Cancelled rental ${id}`,
    });

    res.status(200).json({
      success: true,
      message: "Rental cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel rental error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling rental",
      error: error.message,
    });
  }
};
