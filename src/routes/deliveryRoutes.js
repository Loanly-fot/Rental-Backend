const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/deliveryController");
const {
  verifyToken,
  verifyDelivery,
  verifyAdmin,
} = require("../middleware/authMiddleware");

// Get assigned deliveries (Delivery role)
router.get(
  "/assigned",
  verifyToken,
  verifyDelivery,
  deliveryController.getAssigned
);

// Mark delivery as delivered (Delivery role)
router.post(
  "/:id/delivered",
  verifyToken,
  verifyDelivery,
  deliveryController.markDelivered
);

// Mark delivery as returned (Delivery role)
router.post(
  "/:id/returned",
  verifyToken,
  verifyDelivery,
  deliveryController.markReturned
);

// Create delivery (Admin only)
router.post("/", verifyToken, verifyAdmin, deliveryController.create);

// Get all deliveries (Admin only)
router.get("/", verifyToken, verifyAdmin, deliveryController.getAll);

module.exports = router;
