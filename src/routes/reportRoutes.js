const express = require("express");
const reportController = require("../controllers/reportController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin reports
router.get("/admin", verifyToken, verifyAdmin, reportController.getAdminReport);
router.get(
  "/admin/csv",
  verifyToken,
  verifyAdmin,
  reportController.getAdminCSV
);

// User reports
router.get("/user", verifyToken, reportController.getUserReport);
router.get("/user/csv", verifyToken, reportController.getUserCSV);

// Activity logs (Admin only)
router.get("/logs", verifyToken, verifyAdmin, reportController.getActivityLogs);

module.exports = router;
