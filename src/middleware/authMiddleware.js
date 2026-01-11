const jwt = require("jsonwebtoken");
require("dotenv").config();

// Verify JWT token
exports.verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_secret_key"
    );
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

// Verify admin role
exports.verifyAdmin = (req, res, next) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }
    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying admin role",
      error: error.message,
    });
  }
};

// Verify normal user role
exports.verifyNormalUser = (req, res, next) => {
  try {
    if (req.user?.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "User access required",
      });
    }
    next();
  } catch (error) {
    console.error("Normal user verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying user role",
      error: error.message,
    });
  }
};

// Verify delivery role
exports.verifyDelivery = (req, res, next) => {
  try {
    if (req.user?.role !== "delivery") {
      return res.status(403).json({
        success: false,
        message: "Delivery access required",
      });
    }
    next();
  } catch (error) {
    console.error("Delivery verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying delivery role",
      error: error.message,
    });
  }
};

// Verify specific role(s)
exports.verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role(s): ${allowedRoles.join(
            ", "
          )}`,
        });
      }
      next();
    } catch (error) {
      console.error("Role verification error:", error);
      return res.status(500).json({
        success: false,
        message: "Error verifying role",
        error: error.message,
      });
    }
  };
};

// Verify resource ownership (user can only access their own resources)
exports.verifyResourceOwner = async (req, res, next) => {
  try {
    const resourceUserId =
      parseInt(req.body.userId) || parseInt(req.params.userId);
    const currentUserId = req.user?.id;
    const userRole = req.user?.role;

    // Admins can access any resource; normal users can only access their own
    if (userRole !== "admin" && currentUserId !== resourceUserId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }
    next();
  } catch (error) {
    console.error("Resource ownership verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying resource ownership",
      error: error.message,
    });
  }
};

// Optional token verification (doesn't fail if no token)
exports.optionalToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_secret_key"
      );
      req.user = decoded;
    }

    next();
  } catch (error) {
    console.warn("Optional token verification skipped:", error.message);
    next();
  }
};
