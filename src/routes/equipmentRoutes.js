const express = require("express");
const equipmentController = require("../controllers/equipmentController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Public/Protected routes
router.get("/", equipmentController.getAll);
router.get("/:id", equipmentController.getById);

// Protected routes (Admin/User can create)
router.post("/", verifyToken, equipmentController.create);

// Update: Owner or Admin
router.put("/:id", verifyToken, equipmentController.update);

// Admin-only routes
router.delete("/:id", verifyToken, verifyAdmin, equipmentController.delete);
router.post(
  "/:id/approve",
  verifyToken,
  verifyAdmin,
  equipmentController.approve
);

module.exports = router;
