const Rental = require("../models/Rental");
const Equipment = require("../models/Equipment");
const User = require("../models/User");
const Log = require("../models/Log");

// Checkout equipment
exports.checkout = async (req, res) => {
  try {
    const { equipment_id, return_date, quantity = 1 } = req.body; // optional quantity
    const user_id = req.user?.id;

    if (!equipment_id || !return_date) {
      return res.status(400).json({ success: false, message: "Equipment ID and return date are required" });
    }

    if (!user_id) {
      return res.status(401).json({ success: false, message: "User authentication required" });
    }

    const equipment = await Equipment.findById(equipment_id);
    if (!equipment) return res.status(404).json({ success: false, message: "Equipment not found" });

    if (equipment.qty_available < quantity) {
      return res.status(400).json({ success: false, message: "Not enough equipment available" });
    }

    const checkout_date = new Date();
    const returnDateObj = new Date(return_date);
    if (returnDateObj <= checkout_date) {
      return res.status(400).json({ success: false, message: "Return date must be in the future" });
    }

    const timeDiff = returnDateObj.getTime() - checkout_date.getTime();
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // number of days
    const totalCost = equipment.daily_rate * days * quantity;

    // Create rental record
    const rental = await Rental.create(
      user_id,
      equipment_id,
      checkout_date,
      return_date,
      "active",
      quantity,
      totalCost
    );

    await Equipment.updateAvailableQty(equipment_id, equipment.qty_available - quantity);

    await Log.create(user_id, `Checked out equipment: ${equipment.name} (ID: ${equipment_id})`);

    res.status(201).json({
      success: true,
      message: "Equipment checked out successfully",
      rental: {
        id: rental.id, // assuming Rental.create returns the object
        equipment_id,
        equipment_name: equipment.name,
        startDate: checkout_date,
        endDate: return_date,
        status: "active",
        quantity,
        totalCost, // fixed
        customerName: req.user?.name,
        customerEmail: req.user?.email,
      },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ success: false, message: "Error checking out equipment", error: error.message });
  }
};



// Return equipment
exports.returnEquipment = async (req, res) => {
  try {
    const { rental_id } = req.body;
    const user_id = req.user?.id;

    if (!rental_id) {
      return res.status(400).json({ success: false, message: "Rental ID is required" });
    }

    if (!user_id) {
      return res.status(401).json({ success: false, message: "User authentication required" });
    }

    const rental = await Rental.findById(rental_id);
    if (!rental) {
      return res.status(404).json({ success: false, message: "Rental not found" });
    }

    if (rental.user_id !== user_id && req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "You do not have permission to return this rental" });
    }

    if (rental.status === "returned") {
      return res.status(400).json({ success: false, message: "Equipment has already been returned" });
    }

    const equipment = await Equipment.findById(rental.equipment_id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: "Equipment not found" });
    }

    const updated = await Rental.updateStatus(rental_id, "returned");
    if (!updated) {
      return res.status(400).json({ success: false, message: "Failed to return equipment" });
    }

    // Add back the rented quantity
    await Equipment.updateAvailableQty(rental.equipment_id, equipment.qty_available + rental.quantity);

    const returnDateObj = new Date(rental.return_date);
    const today = new Date();
    const isOverdue = today > returnDateObj;

    await Log.create(
      user_id,
      `Returned equipment: ${equipment.name} (ID: ${rental.equipment_id})${isOverdue ? " - OVERDUE" : ""}`
    );

    res.status(200).json({
      success: true,
      message: "Equipment returned successfully",
      rental: {
        id: rental_id,
        equipment_id: rental.equipment_id,
        equipment_name: equipment.name,
        startDate: rental.checkout_date,
        endDate: rental.return_date,
        status: "returned",
        quantity: rental.quantity,
        totalCost: rental.total_cost,
        isOverdue,
      },
    });
  } catch (error) {
    console.error("Return equipment error:", error);
    res.status(500).json({ success: false, message: "Error returning equipment", error: error.message });
  }
};


// Get all rentals
exports.getAll = async (req, res) => {
  try {
    const rentals = await Rental.findAllWithDetails();

    res.status(200).json({
      success: true,
      count: rentals.length,
      rentals,
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

// Get rental by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Rental ID is required",
      });
    }

    const rental = await Rental.findById(id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found",
      });
    }

    res.status(200).json({
      success: true,
      rental,
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

// Get active rentals
exports.getActive = async (req, res) => {
  try {
    const rentals = await Rental.findActive();

    res.status(200).json({
      success: true,
      count: rentals.length,
      rentals,
    });
  } catch (error) {
    console.error("Get active rentals error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching active rentals",
      error: error.message,
    });
  }
};

// Get user's rentals
exports.getUserRentals = async (req, res) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const rentals = await Rental.findByUserId(user_id);

    res.status(200).json({
      success: true,
      count: rentals.length,
      rentals,
    });
  } catch (error) {
    console.error("Get user rentals error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user rentals",
      error: error.message,
    });
  }
};

// Get user's active rentals
exports.getUserActiveRentals = async (req, res) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const rentals = await Rental.findActiveByUserId(user_id);

    res.status(200).json({
      success: true,
      count: rentals.length,
      rentals,
    });
  } catch (error) {
    console.error("Get user active rentals error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user active rentals",
      error: error.message,
    });
  }
};

// Get overdue rentals
exports.getOverdue = async (req, res) => {
  try {
    const rentals = await Rental.findOverdue();

    res.status(200).json({
      success: true,
      count: rentals.length,
      rentals,
    });
  } catch (error) {
    console.error("Get overdue rentals error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching overdue rentals",
      error: error.message,
    });
  }
};

// Get rentals by equipment ID
exports.getByEquipmentId = async (req, res) => {
  try {
    const { equipment_id } = req.params;

    if (!equipment_id) {
      return res.status(400).json({
        success: false,
        message: "Equipment ID is required",
      });
    }

    const rentals = await Rental.findByEquipmentId(equipment_id);

    res.status(200).json({
      success: true,
      count: rentals.length,
      rentals,
    });
  } catch (error) {
    console.error("Get rentals by equipment ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching rentals",
      error: error.message,
    });
  }
};

// Get rentals by user ID (admin only)
exports.getByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const rentals = await Rental.findByUserId(user_id);

    res.status(200).json({
      success: true,
      count: rentals.length,
      rentals,
    });
  } catch (error) {
    console.error("Get rentals by user ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching rentals",
      error: error.message,
    });
  }
};
