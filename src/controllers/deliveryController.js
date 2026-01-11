const Delivery = require("../models/Delivery");
const Rental = require("../models/Rental");
const Equipment = require("../models/Equipment");
const User = require("../models/User");
const Log = require("../models/Log");

// Get assigned deliveries (Delivery role)
exports.getAssigned = async (req, res) => {
  try {
    const userId = req.user.id;

    const deliveries = await Delivery.find({ deliveryPersonId: userId })
      .populate({
        path: "rentalId",
        populate: [
          { path: "equipmentId", select: "name category" },
          { path: "userId", select: "name email phone" },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: deliveries.length,
      deliveries: deliveries.map((delivery) => ({
        id: delivery._id,
        equipmentName: delivery.rentalId?.equipmentId?.name,
        customerName: delivery.rentalId?.userId?.name,
        address: delivery.address,
        status: delivery.status,
        rentalId: delivery.rentalId?._id,
        deliveryNotes: delivery.deliveryNotes,
        deliveredAt: delivery.deliveredAt,
        returnedAt: delivery.returnedAt,
        createdAt: delivery.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get assigned deliveries error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching assigned deliveries",
      error: error.message,
    });
  }
};

// Mark delivery as delivered (Delivery role)
exports.markDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { notes } = req.body;

    const delivery = await Delivery.findById(id);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    // Check if assigned to this delivery person
    if (delivery.deliveryPersonId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own assigned deliveries",
      });
    }

    // Check if already delivered or returned
    if (delivery.status !== "assigned") {
      return res.status(400).json({
        success: false,
        message: `Delivery already ${delivery.status}`,
      });
    }

    delivery.status = "delivered";
    delivery.deliveredAt = new Date();
    if (notes) {
      delivery.deliveryNotes = notes;
    }

    await delivery.save();

    // Update rental status to active
    await Rental.findByIdAndUpdate(delivery.rentalId, { status: "active" });

    // Log action
    await Log.create({
      userId,
      action: `Marked delivery ${id} as delivered`,
    });

    res.status(200).json({
      success: true,
      message: "Delivery marked as delivered successfully",
      delivery: {
        id: delivery._id,
        status: delivery.status,
        deliveredAt: delivery.deliveredAt,
      },
    });
  } catch (error) {
    console.error("Mark delivered error:", error);
    res.status(500).json({
      success: false,
      message: "Error marking delivery as delivered",
      error: error.message,
    });
  }
};

// Mark delivery as returned (Delivery role)
exports.markReturned = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { notes } = req.body;

    const delivery = await Delivery.findById(id);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    // Check if assigned to this delivery person
    if (delivery.deliveryPersonId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own assigned deliveries",
      });
    }

    // Check if not delivered yet
    if (delivery.status === "assigned") {
      return res.status(400).json({
        success: false,
        message: "Cannot mark as returned before delivery",
      });
    }

    // Check if already returned
    if (delivery.status === "returned") {
      return res.status(400).json({
        success: false,
        message: "Delivery already marked as returned",
      });
    }

    delivery.status = "returned";
    delivery.returnedAt = new Date();
    if (notes) {
      delivery.deliveryNotes = (delivery.deliveryNotes || "") + "\n" + notes;
    }

    await delivery.save();

    // Update rental status to completed
    await Rental.findByIdAndUpdate(delivery.rentalId, { status: "completed" });

    // Log action
    await Log.create({
      userId,
      action: `Marked delivery ${id} as returned`,
    });

    res.status(200).json({
      success: true,
      message: "Delivery marked as returned successfully",
      delivery: {
        id: delivery._id,
        status: delivery.status,
        returnedAt: delivery.returnedAt,
      },
    });
  } catch (error) {
    console.error("Mark returned error:", error);
    res.status(500).json({
      success: false,
      message: "Error marking delivery as returned",
      error: error.message,
    });
  }
};

// Create delivery (Admin) - Auto-assign to delivery personnel
exports.create = async (req, res) => {
  try {
    const { rentalId, address, deliveryPersonId } = req.body;
    const userId = req.user.id;

    if (!rentalId || !address) {
      return res.status(400).json({
        success: false,
        message: "Rental ID and address are required",
      });
    }

    // Check if rental exists
    const rental = await Rental.findById(rentalId);
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found",
      });
    }

    let assignedDeliveryPerson = deliveryPersonId;

    // Auto-assign if not provided
    if (!assignedDeliveryPerson) {
      const deliveryPerson = await User.findOne({ role: "delivery" });
      if (deliveryPerson) {
        assignedDeliveryPerson = deliveryPerson._id;
      }
    }

    // Create delivery
    const delivery = await Delivery.create({
      rentalId,
      deliveryPersonId: assignedDeliveryPerson,
      address,
      status: "assigned",
    });

    // Log action
    await Log.create({
      userId,
      action: `Created delivery for rental ${rentalId}`,
    });

    res.status(201).json({
      success: true,
      message: "Delivery created successfully",
      delivery: {
        id: delivery._id,
        rentalId: delivery.rentalId,
        address: delivery.address,
        status: delivery.status,
        deliveryPersonId: delivery.deliveryPersonId,
      },
    });
  } catch (error) {
    console.error("Create delivery error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating delivery",
      error: error.message,
    });
  }
};

// Get all deliveries (Admin)
exports.getAll = async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate({
        path: "rentalId",
        populate: [
          { path: "equipmentId", select: "name category" },
          { path: "userId", select: "name email" },
        ],
      })
      .populate("deliveryPersonId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: deliveries.length,
      deliveries: deliveries.map((delivery) => ({
        id: delivery._id,
        equipmentName: delivery.rentalId?.equipmentId?.name,
        customerName: delivery.rentalId?.userId?.name,
        deliveryPersonName: delivery.deliveryPersonId?.name,
        address: delivery.address,
        status: delivery.status,
        rentalId: delivery.rentalId?._id,
        deliveredAt: delivery.deliveredAt,
        returnedAt: delivery.returnedAt,
        createdAt: delivery.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get all deliveries error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching deliveries",
      error: error.message,
    });
  }
};

module.exports = exports;
