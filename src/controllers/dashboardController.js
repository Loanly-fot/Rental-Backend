const User = require("../models/User");
const Equipment = require("../models/Equipment");
const Rental = require("../models/Rental");
const Delivery = require("../models/Delivery");

// Get admin dashboard statistics
exports.getAdminDashboard = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalEquipment = await Equipment.countDocuments();
    const totalRentals = await Rental.countDocuments();
    const activeRentals = await Rental.countDocuments({ status: "active" });
    const pendingRentals = await Rental.countDocuments({ status: "pending" });
    const pendingEquipment = await Equipment.countDocuments({
      approved: false,
    });

    // Get recent rentals
    const recentRentals = await Rental.find()
      .populate("equipmentId", "name category")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate total revenue
    const completedRentals = await Rental.find({ status: "completed" });
    const totalRevenue = completedRentals.reduce(
      (sum, rental) => sum + (rental.totalCost || 0),
      0
    );

    res.status(200).json({
      success: true,
      dashboard: {
        stats: {
          totalUsers,
          totalEquipment,
          totalRentals,
          activeRentals,
          pendingRentals,
          pendingEquipment,
          totalRevenue,
        },
        recentRentals: recentRentals.map((rental) => ({
          id: rental._id,
          equipmentName: rental.equipmentId?.name,
          customerName: rental.userId?.name,
          status: rental.status,
          startDate: rental.startDate,
          endDate: rental.endDate,
          totalCost: rental.totalCost,
          createdAt: rental.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Get admin dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin dashboard",
      error: error.message,
    });
  }
};

// Get user dashboard statistics
exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's rental counts
    const totalRentals = await Rental.countDocuments({ userId });
    const activeRentals = await Rental.countDocuments({
      userId,
      status: "active",
    });
    const completedRentals = await Rental.countDocuments({
      userId,
      status: "completed",
    });
    const pendingRentals = await Rental.countDocuments({
      userId,
      status: "pending",
    });

    // Get user's recent rentals
    const recentRentals = await Rental.find({ userId })
      .populate("equipmentId", "name category dailyRate")
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate total spent
    const userCompletedRentals = await Rental.find({
      userId,
      status: "completed",
    });
    const totalSpent = userCompletedRentals.reduce(
      (sum, rental) => sum + (rental.totalCost || 0),
      0
    );

    // Get available equipment count
    const availableEquipment = await Equipment.countDocuments({
      status: "available",
      approved: true,
    });

    res.status(200).json({
      success: true,
      dashboard: {
        stats: {
          totalRentals,
          activeRentals,
          completedRentals,
          pendingRentals,
          totalSpent,
          availableEquipment,
        },
        recentRentals: recentRentals.map((rental) => ({
          id: rental._id,
          equipmentName: rental.equipmentId?.name,
          status: rental.status,
          startDate: rental.startDate,
          endDate: rental.endDate,
          totalCost: rental.totalCost,
          createdAt: rental.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Get user dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user dashboard",
      error: error.message,
    });
  }
};

// Get delivery person dashboard
exports.getDeliveryDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get delivery counts
    const totalDeliveries = await Delivery.countDocuments({
      deliveryPersonId: userId,
    });
    const assignedDeliveries = await Delivery.countDocuments({
      deliveryPersonId: userId,
      status: "assigned",
    });
    const deliveredCount = await Delivery.countDocuments({
      deliveryPersonId: userId,
      status: "delivered",
    });
    const returnedCount = await Delivery.countDocuments({
      deliveryPersonId: userId,
      status: "returned",
    });

    // Get pending deliveries
    const pendingDeliveries = await Delivery.find({
      deliveryPersonId: userId,
      status: { $in: ["assigned", "delivered"] },
    })
      .populate({
        path: "rentalId",
        populate: [
          { path: "equipmentId", select: "name category" },
          { path: "userId", select: "name phone" },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      dashboard: {
        stats: {
          totalDeliveries,
          assignedDeliveries,
          deliveredCount,
          returnedCount,
        },
        pendingDeliveries: pendingDeliveries.map((delivery) => ({
          id: delivery._id,
          equipmentName: delivery.rentalId?.equipmentId?.name,
          customerName: delivery.rentalId?.userId?.name,
          customerPhone: delivery.rentalId?.userId?.phone,
          address: delivery.address,
          status: delivery.status,
          deliveredAt: delivery.deliveredAt,
          createdAt: delivery.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Get delivery dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching delivery dashboard",
      error: error.message,
    });
  }
};

module.exports = exports;
