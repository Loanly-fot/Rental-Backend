const express = require("express");
const equipmentController = require("../controllers/equipmentController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes (read-only)
router.get("/", equipmentController.getAll);
router.get("/categories", equipmentController.getCategories);
router.get("/:id", equipmentController.getById);
router.get("/category/:category", equipmentController.getByCategory);

// Protected routes (admin only)
router.post("/", verifyToken, verifyAdmin, equipmentController.create);
router.put("/:id", verifyToken, verifyAdmin, equipmentController.update);
router.put(
  "/:id/availability",
  verifyToken,
  verifyAdmin,
  equipmentController.updateAvailableQty
);
router.delete("/:id", verifyToken, verifyAdmin, equipmentController.delete);

module.exports = router;
