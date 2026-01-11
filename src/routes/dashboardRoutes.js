const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const {
  verifyToken,
  verifyAdmin,
  verifyDelivery,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Admin dashboard
router.get(
  "/admin",
  verifyToken,
  verifyAdmin,
  dashboardController.getAdminDashboard
);

// User dashboard
router.get("/user", verifyToken, dashboardController.getUserDashboard);

// Delivery dashboard
router.get(
  "/delivery",
  verifyToken,
  verifyDelivery,
  dashboardController.getDeliveryDashboard
);

module.exports = router;
