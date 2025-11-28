const Rental = require("../models/Rental");
const Equipment = require("../models/Equipment");
const User = require("../models/User");
const Log = require("../models/Log");
const {
  generatePDFReport,
  generateCSVReport,
} = require("../utils/generatePDF");
const path = require("path");

// Get date ranges
const getDailyDateRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { start: today, end: tomorrow };
};

const getMonthlyDateRange = () => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  return { start, end };
};

// Daily Rental Report (CSV)
exports.getDailyRentalReportCSV = async (req, res) => {
  try {
    const { start, end } = getDailyDateRange();

    // Get rentals for the day
    const allRentals = await Rental.findAllWithDetails();
    const dailyRentals = allRentals.filter((rental) => {
      const checkoutDate = new Date(rental.checkout_date);
      return checkoutDate >= start && checkoutDate < end;
    });

    const columns = [
      { key: "id", label: "Rental ID", width: 1 },
      { key: "user_name", label: "User Name", width: 1.5 },
      { key: "equipment_name", label: "Equipment", width: 1.5 },
      { key: "category", label: "Category", width: 1 },
      { key: "checkout_date", label: "Checkout Date", width: 1.5 },
      { key: "return_date", label: "Return Date", width: 1.5 },
      { key: "status", label: "Status", width: 1 },
    ];

    const filename = `daily_rentals_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    const filePath = await generateCSVReport(
      filename,
      "Daily Rental Report",
      dailyRentals,
      columns
    );

    res.download(filePath, filename);
  } catch (error) {
    console.error("Daily rental report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating daily rental report",
      error: error.message,
    });
  }
};

// Daily Rental Report (PDF)
exports.getDailyRentalReportPDF = async (req, res) => {
  try {
    const { start, end } = getDailyDateRange();

    // Get rentals for the day
    const allRentals = await Rental.findAllWithDetails();
    const dailyRentals = allRentals.filter((rental) => {
      const checkoutDate = new Date(rental.checkout_date);
      return checkoutDate >= start && checkoutDate < end;
    });

    const columns = [
      { key: "id", label: "ID", width: 0.8 },
      { key: "user_name", label: "User", width: 1.2 },
      { key: "equipment_name", label: "Equipment", width: 1.2 },
      { key: "status", label: "Status", width: 0.8 },
    ];

    const filename = `daily_rentals_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    const filePath = await generatePDFReport(
      filename,
      `Daily Rental Report - ${new Date().toLocaleDateString()}`,
      dailyRentals,
      columns
    );

    res.download(filePath, filename);
  } catch (error) {
    console.error("Daily rental report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating daily rental report",
      error: error.message,
    });
  }
};

// Monthly Rental Report (CSV)
exports.getMonthlyRentalReportCSV = async (req, res) => {
  try {
    const { start, end } = getMonthlyDateRange();

    // Get rentals for the month
    const allRentals = await Rental.findAllWithDetails();
    const monthlyRentals = allRentals.filter((rental) => {
      const checkoutDate = new Date(rental.checkout_date);
      return checkoutDate >= start && checkoutDate < end;
    });

    const columns = [
      { key: "id", label: "Rental ID", width: 1 },
      { key: "user_name", label: "User Name", width: 1.5 },
      { key: "email", label: "Email", width: 1.5 },
      { key: "equipment_name", label: "Equipment", width: 1.5 },
      { key: "category", label: "Category", width: 1 },
      { key: "checkout_date", label: "Checkout Date", width: 1.5 },
      { key: "return_date", label: "Return Date", width: 1.5 },
      { key: "status", label: "Status", width: 1 },
    ];

    const monthYear = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
    const filename = `monthly_rentals_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    const filePath = await generateCSVReport(
      filename,
      `Monthly Rental Report - ${monthYear}`,
      monthlyRentals,
      columns
    );

    res.download(filePath, filename);
  } catch (error) {
    console.error("Monthly rental report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating monthly rental report",
      error: error.message,
    });
  }
};

// Monthly Rental Report (PDF)
exports.getMonthlyRentalReportPDF = async (req, res) => {
  try {
    const { start, end } = getMonthlyDateRange();

    // Get rentals for the month
    const allRentals = await Rental.findAllWithDetails();
    const monthlyRentals = allRentals.filter((rental) => {
      const checkoutDate = new Date(rental.checkout_date);
      return checkoutDate >= start && checkoutDate < end;
    });

    const columns = [
      { key: "id", label: "ID", width: 0.8 },
      { key: "user_name", label: "User", width: 1.2 },
      { key: "equipment_name", label: "Equipment", width: 1.2 },
      { key: "status", label: "Status", width: 0.8 },
    ];

    const monthYear = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
    const filename = `monthly_rentals_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    const filePath = await generatePDFReport(
      filename,
      `Monthly Rental Report - ${monthYear}`,
      monthlyRentals,
      columns
    );

    res.download(filePath, filename);
  } catch (error) {
    console.error("Monthly rental report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating monthly rental report",
      error: error.message,
    });
  }
};

// Equipment Inventory Report (CSV)
exports.getInventoryReportCSV = async (req, res) => {
  try {
    const equipment = await Equipment.findAll();

    const columns = [
      { key: "id", label: "Equipment ID", width: 1 },
      { key: "name", label: "Equipment Name", width: 1.5 },
      { key: "category", label: "Category", width: 1.5 },
      { key: "qty_total", label: "Total Quantity", width: 1.2 },
      { key: "qty_available", label: "Available Quantity", width: 1.2 },
    ];

    const filename = `inventory_report_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    const filePath = await generateCSVReport(
      filename,
      "Equipment Inventory Report",
      equipment,
      columns
    );

    res.download(filePath, filename);
  } catch (error) {
    console.error("Inventory report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating inventory report",
      error: error.message,
    });
  }
};

// Equipment Inventory Report (PDF)
exports.getInventoryReportPDF = async (req, res) => {
  try {
    const equipment = await Equipment.findAll();

    const columns = [
      { key: "id", label: "ID", width: 0.8 },
      { key: "name", label: "Equipment Name", width: 1.5 },
      { key: "category", label: "Category", width: 1 },
      { key: "qty_total", label: "Total", width: 0.8 },
      { key: "qty_available", label: "Available", width: 0.8 },
    ];

    const filename = `inventory_report_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    const filePath = await generatePDFReport(
      filename,
      "Equipment Inventory Report",
      equipment,
      columns
    );

    res.download(filePath, filename);
  } catch (error) {
    console.error("Inventory report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating inventory report",
      error: error.message,
    });
  }
};

// Activity Log Report (CSV)
exports.getActivityLogReportCSV = async (req, res) => {
  try {
    const logs = await Log.findAllWithUserDetails();

    const columns = [
      { key: "id", label: "Log ID", width: 1 },
      { key: "user_name", label: "User Name", width: 1.5 },
      { key: "email", label: "Email", width: 1.5 },
      { key: "action", label: "Action", width: 2 },
      { key: "timestamp", label: "Timestamp", width: 1.5 },
    ];

    const filename = `activity_log_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    const filePath = await generateCSVReport(
      filename,
      "Activity Log Report",
      logs,
      columns
    );

    res.download(filePath, filename);
  } catch (error) {
    console.error("Activity log report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating activity log report",
      error: error.message,
    });
  }
};

// Activity Log Report (PDF)
exports.getActivityLogReportPDF = async (req, res) => {
  try {
    const logs = await Log.findAllWithUserDetails();

    const columns = [
      { key: "id", label: "ID", width: 0.6 },
      { key: "user_name", label: "User", width: 1 },
      { key: "action", label: "Action", width: 2.4 },
      { key: "timestamp", label: "Time", width: 1 },
    ];

    const filename = `activity_log_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    const filePath = await generatePDFReport(
      filename,
      "Activity Log Report",
      logs,
      columns
    );

    res.download(filePath, filename);
  } catch (error) {
    console.error("Activity log report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating activity log report",
      error: error.message,
    });
  }
};

// Overdue Rentals Report (CSV)
exports.getOverdueReportCSV = async (req, res) => {
  try {
    const overdueRentals = await Rental.findOverdue();

    // Enhance with user and equipment details
    const enrichedRentals = await Promise.all(
      overdueRentals.map(async (rental) => {
        const user = await User.findById(rental.user_id);
        const equipment = await Equipment.findById(rental.equipment_id);
        const daysOverdue = Math.floor(
          (new Date() - new Date(rental.return_date)) / (1000 * 60 * 60 * 24)
        );
        return {
          ...rental,
          user_name: user?.name || "Unknown",
          user_email: user?.email || "Unknown",
          equipment_name: equipment?.name || "Unknown",
          days_overdue: daysOverdue,
        };
      })
    );

    const columns = [
      { key: "id", label: "Rental ID", width: 1 },
      { key: "user_name", label: "User Name", width: 1.5 },
      { key: "user_email", label: "Email", width: 1.5 },
      { key: "equipment_name", label: "Equipment", width: 1.5 },
      { key: "checkout_date", label: "Checkout Date", width: 1.3 },
      { key: "return_date", label: "Due Date", width: 1.3 },
      { key: "days_overdue", label: "Days Overdue", width: 1 },
    ];

    const filename = `overdue_rentals_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    const filePath = await generateCSVReport(
      filename,
      "Overdue Rentals Report",
      enrichedRentals,
      columns
    );

    res.download(filePath, filename);
  } catch (error) {
    console.error("Overdue report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating overdue report",
      error: error.message,
    });
  }
};

// Overdue Rentals Report (PDF)
exports.getOverdueReportPDF = async (req, res) => {
  try {
    const overdueRentals = await Rental.findOverdue();

    // Enhance with user and equipment details
    const enrichedRentals = await Promise.all(
      overdueRentals.map(async (rental) => {
        const user = await User.findById(rental.user_id);
        const equipment = await Equipment.findById(rental.equipment_id);
        const daysOverdue = Math.floor(
          (new Date() - new Date(rental.return_date)) / (1000 * 60 * 60 * 24)
        );
        return {
          ...rental,
          user_name: user?.name || "Unknown",
          equipment_name: equipment?.name || "Unknown",
          days_overdue: daysOverdue,
        };
      })
    );

    const columns = [
      { key: "id", label: "ID", width: 0.8 },
      { key: "user_name", label: "User", width: 1.2 },
      { key: "equipment_name", label: "Equipment", width: 1.2 },
      { key: "return_date", label: "Due Date", width: 1.2 },
      { key: "days_overdue", label: "Days Late", width: 0.8 },
    ];

    const filename = `overdue_rentals_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    const filePath = await generatePDFReport(
      filename,
      "Overdue Rentals Report",
      enrichedRentals,
      columns
    );

    res.download(filePath, filename);
  } catch (error) {
    console.error("Overdue report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating overdue report",
      error: error.message,
    });
  }
};

// Get report summary
exports.getReportSummary = async (req, res) => {
  try {
    const allRentals = await Rental.findAll();
    const activeRentals = await Rental.findActive();
    const overdueRentals = await Rental.findOverdue();
    const allEquipment = await Equipment.findAll();
    const allUsers = await User.findAll();

    const totalQty = allEquipment.reduce((sum, eq) => sum + eq.qty_total, 0);
    const availableQty = allEquipment.reduce(
      (sum, eq) => sum + eq.qty_available,
      0
    );
    const checkedOutQty = totalQty - availableQty;

    res.status(200).json({
      success: true,
      summary: {
        total_rentals: allRentals.length,
        active_rentals: activeRentals.length,
        overdue_rentals: overdueRentals.length,
        completed_rentals: allRentals.filter((r) => r.status === "returned")
          .length,
        total_users: allUsers.length,
        total_equipment: allEquipment.length,
        total_quantity: totalQty,
        available_quantity: availableQty,
        checked_out_quantity: checkedOutQty,
        utilization_rate: ((checkedOutQty / totalQty) * 100).toFixed(2) + "%",
      },
    });
  } catch (error) {
    console.error("Report summary error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating report summary",
      error: error.message,
    });
  }
};
