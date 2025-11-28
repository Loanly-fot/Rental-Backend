const express = require("express");
const rentalController = require("../controllers/rentalController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Protected routes
router.post("/checkout", verifyToken, rentalController.checkout);
router.post("/return", verifyToken, rentalController.returnEquipment);

// Get user's own rentals
router.get("/user/active", verifyToken, rentalController.getUserActiveRentals);
router.get("/user/all", verifyToken, rentalController.getUserRentals);

// Admin routes
router.get("/", verifyToken, verifyAdmin, rentalController.getAll);
router.get(
  "/admin/overdue",
  verifyToken,
  verifyAdmin,
  rentalController.getOverdue
);
router.get(
  "/admin/active",
  verifyToken,
  verifyAdmin,
  rentalController.getActive
);
router.get(
  "/equipment/:equipment_id",
  verifyToken,
  verifyAdmin,
  rentalController.getByEquipmentId
);
router.get(
  "/admin/user/:user_id",
  verifyToken,
  verifyAdmin,
  rentalController.getByUserId
);
router.get("/:id", verifyToken, rentalController.getById);

module.exports = router;
