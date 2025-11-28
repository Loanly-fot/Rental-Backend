const express = require("express");
const reportController = require("../controllers/reportController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Public summary (optional auth)
router.get("/summary", reportController.getReportSummary);

// Protected routes (admin only)
router.get(
  "/daily/csv",
  verifyToken,
  verifyAdmin,
  reportController.getDailyRentalReportCSV
);
router.get(
  "/daily/pdf",
  verifyToken,
  verifyAdmin,
  reportController.getDailyRentalReportPDF
);

router.get(
  "/monthly/csv",
  verifyToken,
  verifyAdmin,
  reportController.getMonthlyRentalReportCSV
);
router.get(
  "/monthly/pdf",
  verifyToken,
  verifyAdmin,
  reportController.getMonthlyRentalReportPDF
);

router.get(
  "/inventory/csv",
  verifyToken,
  verifyAdmin,
  reportController.getInventoryReportCSV
);
router.get(
  "/inventory/pdf",
  verifyToken,
  verifyAdmin,
  reportController.getInventoryReportPDF
);

router.get(
  "/activity/csv",
  verifyToken,
  verifyAdmin,
  reportController.getActivityLogReportCSV
);
router.get(
  "/activity/pdf",
  verifyToken,
  verifyAdmin,
  reportController.getActivityLogReportPDF
);

router.get(
  "/overdue/csv",
  verifyToken,
  verifyAdmin,
  reportController.getOverdueReportCSV
);
router.get(
  "/overdue/pdf",
  verifyToken,
  verifyAdmin,
  reportController.getOverdueReportPDF
);

module.exports = router;
