const Rental = require("../models/Rental");
const Equipment = require("../models/Equipment");
const User = require("../models/User");
const Log = require("../models/Log");
const Delivery = require("../models/Delivery");
const Payment = require("../models/Payment");
const { generateCSV, formatDataForCSV } = require("../utils/csvGenerator");

// Get admin reports
exports.getAdminReport = async (req, res) => {
  try {
    const { type } = req.query; // daily or monthly

    const now = new Date();
    let startDate;
    let endDate = new Date();

    if (type === "monthly") {
      // First day of current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      // Start of today (default to daily)
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const rentals = await Rental.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate("equipmentId", "name dailyRate category")
      .populate("userId", "name email phone");

    // Calculate statistics
    const statusCounts = rentals.reduce((acc, rental) => {
      acc[rental.status] = (acc[rental.status] || 0) + 1;
      return acc;
    }, {});

    const totalRevenue = rentals.reduce(
      (sum, rental) => sum + (rental.totalCost || 0),
      0
    );

    const report = {
      period: type || "daily",
      startDate: startDate,
      endDate: endDate,
      totalRentals: rentals.length,
      totalRevenue: totalRevenue,
      averageRevenue: rentals.length > 0 ? totalRevenue / rentals.length : 0,
      statistics: {
        pending: statusCounts["pending"] || 0,
        approved: statusCounts["approved"] || 0,
        active: statusCounts["active"] || 0,
        completed: statusCounts["completed"] || 0,
        cancelled: statusCounts["cancelled"] || 0,
      },
      rentals: rentals.map((rental) => ({
        id: rental._id,
        equipmentName: rental.equipmentId?.name || "N/A",
        equipmentCategory: rental.equipmentId?.category || "N/A",
        customerName: rental.userId?.name || "N/A",
        customerEmail: rental.userId?.email || "N/A",
        customerPhone: rental.userId?.phone || "N/A",
        status: rental.status,
        quantity: rental.quantity,
        startDate: rental.startDate,
        endDate: rental.endDate,
        totalCost: rental.totalCost,
        createdAt: rental.createdAt,
      })),
    };

    res.status(200).json({
      success: true,
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

// Get daily admin report
exports.getAdminDailyReport = async (req, res) => {
  try {
    req.query.type = "daily";
    return exports.getAdminReport(req, res);
  } catch (error) {
    console.error("Get admin daily report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating daily report",
      error: error.message,
    });
  }
};

// Get monthly admin report
exports.getAdminMonthlyReport = async (req, res) => {
  try {
    req.query.type = "monthly";
    return exports.getAdminReport(req, res);
  } catch (error) {
    console.error("Get admin monthly report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating monthly report",
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
    let endDate = new Date();

    if (type === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const rentals = await Rental.find({
      userId,
      createdAt: { $gte: startDate, $lte: endDate },
    }).populate("equipmentId", "name dailyRate category");

    // Calculate statistics
    const statusCounts = rentals.reduce((acc, rental) => {
      acc[rental.status] = (acc[rental.status] || 0) + 1;
      return acc;
    }, {});

    const totalCost = rentals.reduce(
      (sum, rental) => sum + (rental.totalCost || 0),
      0
    );

    const report = {
      period: type || "daily",
      startDate: startDate,
      endDate: endDate,
      totalRentals: rentals.length,
      totalCost: totalCost,
      averageCost: rentals.length > 0 ? totalCost / rentals.length : 0,
      statistics: {
        pending: statusCounts["pending"] || 0,
        approved: statusCounts["approved"] || 0,
        active: statusCounts["active"] || 0,
        completed: statusCounts["completed"] || 0,
        cancelled: statusCounts["cancelled"] || 0,
      },
      rentals: rentals.map((rental) => ({
        id: rental._id,
        equipmentName: rental.equipmentId?.name || "N/A",
        equipmentCategory: rental.equipmentId?.category || "N/A",
        status: rental.status,
        quantity: rental.quantity,
        startDate: rental.startDate,
        endDate: rental.endDate,
        totalCost: rental.totalCost,
        notes: rental.notes,
        createdAt: rental.createdAt,
      })),
    };

    res.status(200).json({
      success: true,
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

// Get daily user report
exports.getUserDailyReport = async (req, res) => {
  try {
    req.query.type = "daily";
    return exports.getUserReport(req, res);
  } catch (error) {
    console.error("Get user daily report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating daily report",
      error: error.message,
    });
  }
};

// Get monthly user report
exports.getUserMonthlyReport = async (req, res) => {
  try {
    req.query.type = "monthly";
    return exports.getUserReport(req, res);
  } catch (error) {
    console.error("Get user monthly report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating monthly report",
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

// Get equipment report (Admin only)
exports.getEquipmentReport = async (req, res) => {
  try {
    const { type } = req.query; // daily or monthly

    const now = new Date();
    let startDate;
    let endDate = new Date();

    if (type === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const equipment = await Equipment.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const allEquipment = await Equipment.find();

    // Status breakdown
    const statusCounts = allEquipment.reduce((acc, eq) => {
      acc[eq.status] = (acc[eq.status] || 0) + 1;
      return acc;
    }, {});

    // Category breakdown
    const categoryBreakdown = allEquipment.reduce((acc, eq) => {
      if (!acc[eq.category]) {
        acc[eq.category] = { count: 0, totalValue: 0 };
      }
      acc[eq.category].count += 1;
      acc[eq.category].totalValue += eq.dailyRate * 30; // Monthly estimate
      return acc;
    }, {});

    const report = {
      period: type || "daily",
      startDate: startDate,
      endDate: endDate,
      newEquipment: equipment.length,
      totalEquipment: allEquipment.length,
      statistics: {
        available: statusCounts["available"] || 0,
        rented: statusCounts["rented"] || 0,
        maintenance: statusCounts["maintenance"] || 0,
      },
      categoryBreakdown: Object.entries(categoryBreakdown).map(
        ([category, data]) => ({
          category,
          count: data.count,
          estimatedMonthlyValue: data.totalValue,
        })
      ),
      equipment: equipment.map((eq) => ({
        id: eq._id,
        name: eq.name,
        category: eq.category,
        dailyRate: eq.dailyRate,
        status: eq.status,
        quantity: eq.quantity,
        createdAt: eq.createdAt,
      })),
    };

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Get equipment report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating equipment report",
      error: error.message,
    });
  }
};

// Get equipment CSV report (Admin only)
exports.getEquipmentCSV = async (req, res) => {
  try {
    const { type } = req.query;
    const now = new Date();
    let startDate;
    let filename;

    if (type === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      filename = `equipment_monthly_${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}.csv`;
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filename = `equipment_daily_${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}.csv`;
    }

    const equipment = await Equipment.find({
      createdAt: { $gte: startDate },
    });

    const csvData = equipment.map((eq) => ({
      id: eq._id.toString(),
      name: eq.name,
      category: eq.category,
      dailyRate: eq.dailyRate,
      status: eq.status,
      quantity: eq.quantity,
      description: eq.description || "",
      createdAt: eq.createdAt?.toISOString().split("T")[0] || "",
    }));

    const headers = [
      { id: "id", title: "ID" },
      { id: "name", title: "Name" },
      { id: "category", title: "Category" },
      { id: "dailyRate", title: "Daily Rate" },
      { id: "status", title: "Status" },
      { id: "quantity", title: "Quantity" },
      { id: "description", title: "Description" },
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
    console.error("Get equipment CSV error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating CSV report",
      error: error.message,
    });
  }
};

// Get deliveries report (Admin only)
exports.getDeliveriesReport = async (req, res) => {
  try {
    const { type } = req.query;

    const now = new Date();
    let startDate;
    let endDate = new Date();

    if (type === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const deliveries = await Delivery.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate("rentalId", "totalCost")
      .populate("deliveryPersonId", "name email phone");

    const statusCounts = deliveries.reduce((acc, delivery) => {
      acc[delivery.status] = (acc[delivery.status] || 0) + 1;
      return acc;
    }, {});

    const report = {
      period: type || "daily",
      startDate: startDate,
      endDate: endDate,
      totalDeliveries: deliveries.length,
      statistics: {
        assigned: statusCounts["assigned"] || 0,
        delivered: statusCounts["delivered"] || 0,
        returned: statusCounts["returned"] || 0,
      },
      deliveries: deliveries.map((delivery) => ({
        id: delivery._id,
        rentalId: delivery.rentalId?._id,
        rentalCost: delivery.rentalId?.totalCost || 0,
        deliveryPerson: delivery.deliveryPersonId?.name || "Unassigned",
        deliveryPersonPhone: delivery.deliveryPersonId?.phone || "N/A",
        status: delivery.status,
        address: delivery.address,
        deliveryNotes: delivery.deliveryNotes,
        deliveredAt: delivery.deliveredAt,
        returnedAt: delivery.returnedAt,
        createdAt: delivery.createdAt,
      })),
    };

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Get deliveries report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating deliveries report",
      error: error.message,
    });
  }
};

// Get deliveries CSV report (Admin only)
exports.getDeliveriesCSV = async (req, res) => {
  try {
    const { type } = req.query;
    const now = new Date();
    let startDate;
    let filename;

    if (type === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      filename = `deliveries_monthly_${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}.csv`;
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filename = `deliveries_daily_${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}.csv`;
    }

    const deliveries = await Delivery.find({
      createdAt: { $gte: startDate },
    })
      .populate("rentalId", "totalCost")
      .populate("deliveryPersonId", "name email phone");

    const csvData = deliveries.map((delivery) => ({
      id: delivery._id.toString(),
      rentalId: delivery.rentalId?._id.toString() || "N/A",
      deliveryPerson: delivery.deliveryPersonId?.name || "Unassigned",
      deliveryPersonEmail: delivery.deliveryPersonId?.email || "N/A",
      deliveryPersonPhone: delivery.deliveryPersonId?.phone || "N/A",
      status: delivery.status,
      address: delivery.address,
      deliveryNotes: delivery.deliveryNotes || "",
      deliveredAt: delivery.deliveredAt?.toISOString().split("T")[0] || "N/A",
      returnedAt: delivery.returnedAt?.toISOString().split("T")[0] || "N/A",
      createdAt: delivery.createdAt?.toISOString().split("T")[0] || "",
    }));

    const headers = [
      { id: "id", title: "ID" },
      { id: "rentalId", title: "Rental ID" },
      { id: "deliveryPerson", title: "Delivery Person" },
      { id: "deliveryPersonEmail", title: "Email" },
      { id: "deliveryPersonPhone", title: "Phone" },
      { id: "status", title: "Status" },
      { id: "address", title: "Address" },
      { id: "deliveryNotes", title: "Notes" },
      { id: "deliveredAt", title: "Delivered At" },
      { id: "returnedAt", title: "Returned At" },
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
    console.error("Get deliveries CSV error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating CSV report",
      error: error.message,
    });
  }
};

// Get payments report (Admin only)
exports.getPaymentsReport = async (req, res) => {
  try {
    const { type } = req.query;

    const now = new Date();
    let startDate;
    let endDate = new Date();

    if (type === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const payments = await Payment.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate("rentalId", "totalCost")
      .populate("userId", "name email phone");

    const statusCounts = payments.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, {});

    const methodCounts = payments.reduce((acc, payment) => {
      acc[payment.method] = (acc[payment.method] || 0) + 1;
      return acc;
    }, {});

    const totalAmount = payments.reduce(
      (sum, payment) => sum + (payment.amount || 0),
      0
    );

    const completedPayments = payments.filter((p) => p.status === "completed");
    const completedAmount = completedPayments.reduce(
      (sum, payment) => sum + (payment.amount || 0),
      0
    );

    const report = {
      period: type || "daily",
      startDate: startDate,
      endDate: endDate,
      totalPayments: payments.length,
      totalAmount: totalAmount,
      completedAmount: completedAmount,
      averagePayment: payments.length > 0 ? totalAmount / payments.length : 0,
      statistics: {
        pending: statusCounts["pending"] || 0,
        completed: statusCounts["completed"] || 0,
        failed: statusCounts["failed"] || 0,
        refunded: statusCounts["refunded"] || 0,
      },
      paymentMethods: {
        card: methodCounts["card"] || 0,
        cash: methodCounts["cash"] || 0,
        bank_transfer: methodCounts["bank_transfer"] || 0,
      },
      payments: payments.map((payment) => ({
        id: payment._id,
        rentalId: payment.rentalId?._id,
        customerName: payment.userId?.name || "N/A",
        customerEmail: payment.userId?.email || "N/A",
        customerPhone: payment.userId?.phone || "N/A",
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        transactionId: payment.transactionId,
        notes: payment.notes,
        processedAt: payment.processedAt,
        createdAt: payment.createdAt,
      })),
    };

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Get payments report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating payments report",
      error: error.message,
    });
  }
};

// Get payments CSV report (Admin only)
exports.getPaymentsCSV = async (req, res) => {
  try {
    const { type } = req.query;
    const now = new Date();
    let startDate;
    let filename;

    if (type === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      filename = `payments_monthly_${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}.csv`;
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filename = `payments_daily_${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}.csv`;
    }

    const payments = await Payment.find({
      createdAt: { $gte: startDate },
    })
      .populate("rentalId", "totalCost")
      .populate("userId", "name email phone");

    const csvData = payments.map((payment) => ({
      id: payment._id.toString(),
      rentalId: payment.rentalId?._id.toString() || "N/A",
      customerName: payment.userId?.name || "N/A",
      customerEmail: payment.userId?.email || "N/A",
      customerPhone: payment.userId?.phone || "N/A",
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      transactionId: payment.transactionId || "N/A",
      notes: payment.notes || "",
      processedAt: payment.processedAt?.toISOString().split("T")[0] || "N/A",
      createdAt: payment.createdAt?.toISOString().split("T")[0] || "",
    }));

    const headers = [
      { id: "id", title: "ID" },
      { id: "rentalId", title: "Rental ID" },
      { id: "customerName", title: "Customer" },
      { id: "customerEmail", title: "Email" },
      { id: "customerPhone", title: "Phone" },
      { id: "amount", title: "Amount" },
      { id: "method", title: "Method" },
      { id: "status", title: "Status" },
      { id: "transactionId", title: "Transaction ID" },
      { id: "notes", title: "Notes" },
      { id: "processedAt", title: "Processed At" },
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
    console.error("Get payments CSV error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating CSV report",
      error: error.message,
    });
  }
};

module.exports = exports;
