const express = require("express");
const rentalController = require("../controllers/rentalController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin routes - get all rentals
router.get("/", verifyToken, verifyAdmin, rentalController.getAll);

// User routes - get own rentals (must come before /:id)
router.get("/me", verifyToken, rentalController.getMyRentals);

// Get rental by ID (user can view own, admin can view all)
router.get("/:id", verifyToken, rentalController.getRentalById);

// Create rental
router.post("/:equipmentId", verifyToken, rentalController.createRental);

// Update rental status (Admin)
router.put(
  "/:id/status",
  verifyToken,
  verifyAdmin,
  rentalController.updateStatus
);

// Cancel rental (User can cancel their own)
router.post("/:id/cancel", verifyToken, rentalController.cancelRental);

module.exports = router;

module.exports = router;
