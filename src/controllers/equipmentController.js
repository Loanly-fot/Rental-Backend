const Equipment = require("../models/Equipment");
const Log = require("../models/Log");
const {
  saveBase64Image,
  deleteImage,
  isBase64Image,
} = require("../utils/imageHandler");

// Get all equipment (with filtering)
exports.getAll = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};

    // Filter by status if provided
    if (status) {
      filter.status = status;
    }

    // Filter by category if provided
    if (category) {
      filter.category = category;
    }

    const equipment = await Equipment.find(filter)
      .populate("createdBy", "name email")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: equipment.length,
      equipment: equipment.map((item) => ({
        id: item._id,
        name: item.name,
        category: item.category,
        description: item.description,
        quantity: item.quantity,
        dailyRate: item.dailyRate,
        status: item.status,
        approved: item.approved,
        image: item.image,
        createdBy: item.createdBy
          ? {
              id: item.createdBy._id,
              name: item.createdBy.name,
            }
          : null,
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get all equipment error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching equipment",
      error: error.message,
    });
  }
};

// Get equipment by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findById(id)
      .populate("createdBy", "name email")
      .populate("approvedBy", "name");

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found",
      });
    }

    res.status(200).json({
      success: true,
      equipment: {
        id: equipment._id,
        name: equipment.name,
        category: equipment.category,
        description: equipment.description,
        quantity: equipment.quantity,
        dailyRate: equipment.dailyRate,
        status: equipment.status,
        approved: equipment.approved,
        approvalNotes: equipment.approvalNotes,
        image: equipment.image,
        createdBy: equipment.createdBy
          ? {
              id: equipment.createdBy._id,
              name: equipment.createdBy.name,
              email: equipment.createdBy.email,
            }
          : null,
        approvedBy: equipment.approvedBy
          ? {
              id: equipment.approvedBy._id,
              name: equipment.approvedBy.name,
            }
          : null,
        createdAt: equipment.createdAt,
        updatedAt: equipment.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get equipment by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching equipment",
      error: error.message,
    });
  }
};

// Create equipment (Admin/User)
exports.create = async (req, res) => {
  try {
    const { name, category, quantity, status, description, dailyRate, image } =
      req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate required fields
    if (!name || !category || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, category, and quantity are required",
      });
    }

    // Validate quantity
    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity cannot be negative",
      });
    }

    // Create equipment object
    const equipmentData = {
      name,
      category,
      quantity,
      description: description || "",
      dailyRate: dailyRate || 0,
      status: status || "available",
      createdBy: userId,
    };

    // Handle image upload (if base64 provided)
    if (image && isBase64Image(image)) {
      try {
        const filename = await saveBase64Image(image, "equipments");
        equipmentData.image = filename;
      } catch (err) {
        console.error("Image save error:", err);
        // Continue without image if upload fails
      }
    }

    // Auto-approve if admin creates it
    if (userRole === "admin") {
      equipmentData.approved = true;
      equipmentData.approvedBy = userId;
    }

    const equipment = await Equipment.create(equipmentData);

    // Log action
    await Log.create({
      userId,
      action: `Created equipment: ${name}`,
    });

    res.status(201).json({
      success: true,
      message: "Equipment created successfully",
      equipment: {
        id: equipment._id,
        name: equipment.name,
        category: equipment.category,
        quantity: equipment.quantity,
        status: equipment.status,
        approved: equipment.approved,
        image: equipment.image,
      },
    });
  } catch (error) {
    console.error("Create equipment error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating equipment",
      error: error.message,
    });
  }
};

// Update equipment (Admin or Owner)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, status, description, dailyRate, image } =
      req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const equipment = await Equipment.findById(id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found",
      });
    }

    // Check ownership: user can only update their own equipment, admin can update any
    if (userRole !== "admin" && equipment.createdBy?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update equipment you created",
      });
    }

    // Handle image update
    if (image && isBase64Image(image)) {
      try {
        // Delete old image if exists
        if (equipment.image) {
          await deleteImage(equipment.image, "equipments");
        }
        // Save new image
        const filename = await saveBase64Image(image, "equipments");
        equipment.image = filename;
      } catch (err) {
        console.error("Image update error:", err);
        // Continue without image update if fails
      }
    }

    // Update fields
    if (name) equipment.name = name;
    if (category) equipment.category = category;
    if (quantity !== undefined) equipment.quantity = quantity;
    if (status) equipment.status = status;
    if (description !== undefined) equipment.description = description;
    if (dailyRate !== undefined) equipment.dailyRate = dailyRate;

    await equipment.save();

    // Log action
    await Log.create({
      userId,
      action: `Updated equipment: ${equipment.name}`,
    });

    res.status(200).json({
      success: true,
      message: "Equipment updated successfully",
      equipment: {
        id: equipment._id,
        name: equipment.name,
        category: equipment.category,
        quantity: equipment.quantity,
        status: equipment.status,
        image: equipment.image,
      },
    });
  } catch (error) {
    console.error("Update equipment error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating equipment",
      error: error.message,
    });
  }
};

// Delete equipment (Admin only)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const equipment = await Equipment.findById(id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found",
      });
    }

    const equipmentName = equipment.name;
    await Equipment.findByIdAndDelete(id);

    // Log action
    await Log.create({
      userId,
      action: `Deleted equipment: ${equipmentName}`,
    });

    res.status(200).json({
      success: true,
      message: "Equipment deleted successfully",
    });
  } catch (error) {
    console.error("Delete equipment error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting equipment",
      error: error.message,
    });
  }
};

// Approve equipment (Admin only)
exports.approve = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { notes } = req.body;

    const equipment = await Equipment.findById(id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found",
      });
    }

    equipment.approved = true;
    equipment.approvedBy = userId;
    if (notes) {
      equipment.approvalNotes = notes;
    }

    await equipment.save();

    // Log action
    await Log.create({
      userId,
      action: `Approved equipment: ${equipment.name}`,
    });

    res.status(200).json({
      success: true,
      message: "Equipment approved successfully",
      equipment: {
        id: equipment._id,
        name: equipment.name,
        approved: equipment.approved,
      },
    });
  } catch (error) {
    console.error("Approve equipment error:", error);
    res.status(500).json({
      success: false,
      message: "Error approving equipment",
      error: error.message,
    });
  }
};
