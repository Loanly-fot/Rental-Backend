const express = require("express");
const authController = require("../controllers/authController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.get("/me", verifyToken, authController.getCurrentUser);
router.post("/change-password", verifyToken, authController.changePassword);

// Admin routes
router.get("/users", verifyToken, verifyAdmin, authController.getAllUsers);
router.get("/users/:id", verifyToken, verifyAdmin, authController.getUserById);
router.patch("/users/:id", verifyToken, verifyAdmin, authController.updateUser);
router.delete(
  "/users/:id",
  verifyToken,
  verifyAdmin,
  authController.deleteUser
);
router.patch(
  "/users/:id/password",
  verifyToken,
  verifyAdmin,
  authController.resetUserPassword
);

module.exports = router;
