const Equipment = require("../models/Equipment");
const Log = require("../models/Log");

// Create equipment
exports.create = async (req, res) => {
  try {
    const { name, description, category, dailyRate, quantity, available } =
      req.body;

    // Validate input
    if (
      !name ||
      !category ||
      quantity === undefined ||
      available === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, category, quantity, and available are required",
      });
    }

    // Validate quantities
    if (available > quantity) {
      return res.status(400).json({
        success: false,
        message: "Available quantity cannot exceed total quantity",
      });
    }

    // Create equipment
    const equipmentId = await Equipment.create(
      name,
      description || "",
      category,
      dailyRate || 0,
      quantity,
      available
    );

    // Log action
    await Log.create(req.user?.id || null, `Created equipment: ${name}`);

    res.status(201).json({
      success: true,
      message: "Equipment created successfully",
      equipmentId,
      equipment: {
        id: equipmentId,
        name,
        description,
        category,
        dailyRate,
        quantity,
        available,
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

// Get all equipment
exports.getAll = async (req, res) => {
  try {
    const equipment = await Equipment.findAll();

    res.status(200).json({
      success: true,
      count: equipment.length,
      equipment,
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

    // Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Equipment ID is required",
      });
    }

    const equipment = await Equipment.findById(id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found",
      });
    }

    res.status(200).json({
      success: true,
      equipment,
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

// Get equipment by category
exports.getByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // Validate category
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const equipment = await Equipment.findByCategory(category);

    res.status(200).json({
      success: true,
      count: equipment.length,
      equipment,
    });
  } catch (error) {
    console.error("Get equipment by category error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching equipment",
      error: error.message,
    });
  }
};

// Update equipment
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, dailyRate, quantity, available } =
      req.body;

    // Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Equipment ID is required",
      });
    }

    // Validate input
    if (
      !name ||
      !category ||
      quantity === undefined ||
      available === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, category, quantity, and available are required",
      });
    }

    // Validate quantities
    if (available > quantity) {
      return res.status(400).json({
        success: false,
        message: "Available quantity cannot exceed total quantity",
      });
    }

    // Check if equipment exists
    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found",
      });
    }

    // Update equipment
    const updated = await Equipment.update(
      id,
      name,
      description || "",
      category,
      dailyRate || 0,
      quantity,
      available
    );

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "Failed to update equipment",
      });
    }

    // Log action
    await Log.create(req.user?.id || null, `Updated equipment: ${name}`);

    res.status(200).json({
      success: true,
      message: "Equipment updated successfully",
      equipment: {
        id,
        name,
        description,
        category,
        dailyRate,
        quantity,
        available,
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

// Delete equipment
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Equipment ID is required",
      });
    }

    // Check if equipment exists
    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found",
      });
    }

    // Delete equipment
    const deleted = await Equipment.delete(id);

    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: "Failed to delete equipment",
      });
    }

    // Log action
    await Log.create(
      req.user?.id || null,
      `Deleted equipment: ${equipment.name}`
    );

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

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Equipment.getCategories();

    res.status(200).json({
      success: true,
      count: categories.length,
      categories: categories.map((cat) => cat.category),
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

// Update available quantity
exports.updateAvailableQty = async (req, res) => {
  try {
    const { id } = req.params;
    const { qty_available } = req.body;

    // Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Equipment ID is required",
      });
    }

    // Validate quantity
    if (qty_available === undefined) {
      return res.status(400).json({
        success: false,
        message: "Available quantity is required",
      });
    }

    // Check if equipment exists
    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found",
      });
    }

    // Validate quantity doesn't exceed total
    if (qty_available > equipment.qty_total) {
      return res.status(400).json({
        success: false,
        message: "Available quantity cannot exceed total quantity",
      });
    }

    // Update available quantity
    const updated = await Equipment.updateAvailableQty(id, qty_available);

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "Failed to update available quantity",
      });
    }

    // Log action
    await Log.create(
      req.user?.id || null,
      `Updated quantity for equipment ID: ${id} to ${qty_available}`
    );

    res.status(200).json({
      success: true,
      message: "Available quantity updated successfully",
      equipment: {
        id,
        name: equipment.name,
        qty_available,
      },
    });
  } catch (error) {
    console.error("Update available quantity error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating available quantity",
      error: error.message,
    });
  }
};
