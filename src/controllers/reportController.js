const Rental = require("../models/Rental");
const Equipment = require("../models/Equipment");
const User = require("../models/User");
const Log = require("../models/Log");
const { generateCSV, formatDataForCSV } = require("../utils/csvGenerator");

// Get admin reports
exports.getAdminReport = async (req, res) => {
  try {
    const { type } = req.query; // daily or monthly

    const now = new Date();
    let startDate;

    if (type === "monthly") {
      // First day of current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      // Start of today (default to daily)
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const rentals = await Rental.find({
      createdAt: { $gte: startDate },
    })
      .populate("equipmentId", "name dailyRate")
      .populate("userId", "name email");

    const report = {
      date: startDate,
      totalRentals: rentals.length,
      revenue: rentals.reduce(
        (sum, rental) => sum + (rental.totalCost || 0),
        0
      ),
      rentals: rentals.map((rental) => ({
        id: rental._id,
        equipmentName: rental.equipmentId?.name,
        customerName: rental.userId?.name,
        status: rental.status,
        startDate: rental.startDate,
        endDate: rental.endDate,
        totalCost: rental.totalCost,
      })),
    };

    res.status(200).json({
      success: true,
      type: type || "daily",
      report,
    });
  } catch (error) {
    console.error("Get admin report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating admin report",
      error: error.message,
    });
  }
};

// Get user reports
exports.getUserReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query; // daily or monthly

    const now = new Date();
    let startDate;

    if (type === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const rentals = await Rental.find({
      userId,
      createdAt: { $gte: startDate },
    }).populate("equipmentId", "name dailyRate");

    const report = {
      date: startDate,
      items: rentals.length,
      total: rentals.reduce((sum, rental) => sum + (rental.totalCost || 0), 0),
      rentals: rentals.map((rental) => ({
        equipmentName: rental.equipmentId?.name,
        status: rental.status,
        startDate: rental.startDate,
        endDate: rental.endDate,
        totalCost: rental.totalCost,
      })),
    };

    res.status(200).json({
      success: true,
      type: type || "daily",
      report,
    });
  } catch (error) {
    console.error("Get user report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating user report",
      error: error.message,
    });
  }
};

// Generate admin CSV report
exports.getAdminCSV = async (req, res) => {
  try {
    const { type } = req.query; // daily or monthly

    const now = new Date();
    let startDate;
    let filename;

    if (type === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      filename = `monthly_rentals_${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}.csv`;
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filename = `daily_rentals_${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}.csv`;
    }

    const rentals = await Rental.find({
      createdAt: { $gte: startDate },
    })
      .populate("equipmentId", "name category dailyRate")
      .populate("userId", "name email");

    const csvData = rentals.map((rental) => ({
      id: rental._id.toString(),
      equipmentName: rental.equipmentId?.name || "N/A",
      category: rental.equipmentId?.category || "N/A",
      customerName: rental.userId?.name || "N/A",
      customerEmail: rental.userId?.email || "N/A",
      status: rental.status,
      startDate: rental.startDate?.toISOString().split("T")[0] || "",
      endDate: rental.endDate?.toISOString().split("T")[0] || "",
      quantity: rental.quantity || 0,
      totalCost: rental.totalCost || 0,
      createdAt: rental.createdAt?.toISOString().split("T")[0] || "",
    }));

    const headers = [
      { id: "id", title: "ID" },
      { id: "equipmentName", title: "Equipment" },
      { id: "category", title: "Category" },
      { id: "customerName", title: "Customer" },
      { id: "customerEmail", title: "Email" },
      { id: "status", title: "Status" },
      { id: "startDate", title: "Start Date" },
      { id: "endDate", title: "End Date" },
      { id: "quantity", title: "Quantity" },
      { id: "totalCost", title: "Total Cost" },
      { id: "createdAt", title: "Created At" },
    ];

    const filepath = await generateCSV(csvData, headers, filename);

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error("Error sending CSV:", err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Error sending CSV file",
          });
        }
      }
    });
  } catch (error) {
    console.error("Get admin CSV error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating CSV report",
      error: error.message,
    });
  }
};

// Generate user CSV report
exports.getUserCSV = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query; // daily or monthly

    const now = new Date();
    let startDate;
    let filename;

    if (type === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      filename = `user_monthly_rentals_${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}.csv`;
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filename = `user_daily_rentals_${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}.csv`;
    }

    const rentals = await Rental.find({
      userId,
      createdAt: { $gte: startDate },
    }).populate("equipmentId", "name category dailyRate");

    const csvData = rentals.map((rental) => ({
      id: rental._id.toString(),
      equipmentName: rental.equipmentId?.name || "N/A",
      category: rental.equipmentId?.category || "N/A",
      status: rental.status,
      startDate: rental.startDate?.toISOString().split("T")[0] || "",
      endDate: rental.endDate?.toISOString().split("T")[0] || "",
      quantity: rental.quantity || 0,
      totalCost: rental.totalCost || 0,
      notes: rental.notes || "",
    }));

    const headers = [
      { id: "id", title: "ID" },
      { id: "equipmentName", title: "Equipment" },
      { id: "category", title: "Category" },
      { id: "status", title: "Status" },
      { id: "startDate", title: "Start Date" },
      { id: "endDate", title: "End Date" },
      { id: "quantity", title: "Quantity" },
      { id: "totalCost", title: "Total Cost" },
      { id: "notes", title: "Notes" },
    ];

    const filepath = await generateCSV(csvData, headers, filename);

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error("Error sending CSV:", err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Error sending CSV file",
          });
        }
      }
    });
  } catch (error) {
    console.error("Get user CSV error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating CSV report",
      error: error.message,
    });
  }
};

// Get activity logs (Admin only)
exports.getActivityLogs = async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const logs = await Log.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: logs.length,
      logs: logs.map((log) => ({
        id: log._id,
        userName: log.userId?.name || "System",
        userRole: log.userId?.role || "N/A",
        action: log.action,
        details: log.details,
        createdAt: log.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get activity logs error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching activity logs",
      error: error.message,
    });
  }
};

module.exports = exports;
