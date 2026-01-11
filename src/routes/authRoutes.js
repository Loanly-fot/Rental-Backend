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
router.post(
  "/users/:id/update",
  verifyToken,
  verifyAdmin,
  authController.updateUser
); // Alternative POST route
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

// Admin management routes
router.post(
  "/admin/create",
  verifyToken,
  verifyAdmin,
  authController.createAdmin
);
router.get("/admins", verifyToken, verifyAdmin, authController.getAllAdmins);

module.exports = router;
