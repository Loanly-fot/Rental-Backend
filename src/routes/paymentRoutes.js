const express = require("express");
const paymentController = require("../controllers/paymentController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// User and Admin routes
router.post("/", verifyToken, paymentController.createPayment);
router.get("/", verifyToken, paymentController.getPayments);
router.get("/:id", verifyToken, paymentController.getPaymentById);

// Admin only routes
router.put(
  "/:id/status",
  verifyToken,
  verifyAdmin,
  paymentController.updatePaymentStatus
);

module.exports = router;
