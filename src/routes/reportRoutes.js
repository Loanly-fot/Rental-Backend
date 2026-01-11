const express = require("express");
const reportController = require("../controllers/reportController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin reports
router.get("/admin", verifyToken, verifyAdmin, reportController.getAdminReport);
router.get(
  "/admin/daily",
  verifyToken,
  verifyAdmin,
  reportController.getAdminDailyReport
);
router.get(
  "/admin/monthly",
  verifyToken,
  verifyAdmin,
  reportController.getAdminMonthlyReport
);
router.get(
  "/admin/csv",
  verifyToken,
  verifyAdmin,
  reportController.getAdminCSV
);

// User reports
router.get("/user", verifyToken, reportController.getUserReport);
router.get("/user/daily", verifyToken, reportController.getUserDailyReport);
router.get("/user/monthly", verifyToken, reportController.getUserMonthlyReport);
router.get("/user/csv", verifyToken, reportController.getUserCSV);

// Equipment reports (Admin only)
router.get(
  "/equipment",
  verifyToken,
  verifyAdmin,
  reportController.getEquipmentReport
);
router.get(
  "/equipment/csv",
  verifyToken,
  verifyAdmin,
  reportController.getEquipmentCSV
);

// Deliveries reports (Admin only)
router.get(
  "/deliveries",
  verifyToken,
  verifyAdmin,
  reportController.getDeliveriesReport
);
router.get(
  "/deliveries/csv",
  verifyToken,
  verifyAdmin,
  reportController.getDeliveriesCSV
);

// Payments reports (Admin only)
router.get(
  "/payments",
  verifyToken,
  verifyAdmin,
  reportController.getPaymentsReport
);
router.get(
  "/payments/csv",
  verifyToken,
  verifyAdmin,
  reportController.getPaymentsCSV
);

// Activity logs (Admin only)
router.get("/logs", verifyToken, verifyAdmin, reportController.getActivityLogs);

module.exports = router;
