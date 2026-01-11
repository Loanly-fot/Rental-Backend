const Log = require("../models/Log");

// Request logging middleware
exports.requestLogger = async (req, res, next) => {
  try {
    // Store original send function
    const originalSend = res.send;

    // Override send to capture response
    res.send = function (data) {
      res.send = originalSend;

      const method = req.method;
      const path = req.path;
      const statusCode = res.statusCode;
      const userId = req.user?.id || null;

      // Build action description
      let action = `${method} ${path} - Status: ${statusCode}`;

      // Add request body info if present
      if (req.body && Object.keys(req.body).length > 0) {
        action += ` - Body: ${JSON.stringify(req.body)}`;
      }

      // Add query params if present
      if (req.query && Object.keys(req.query).length > 0) {
        action += ` - Query: ${JSON.stringify(req.query)}`;
      }

      // Log to database asynchronously (non-blocking)
      if (userId) {
        Log.create({ userId, action }).catch((error) => {
          console.error("Error logging request:", error);
        });
      }

      // Log to console
      const logMessage = `[${new Date().toISOString()}] ${method} ${path} - ${statusCode}${
        userId ? ` - User: ${userId}` : ""
      }`;
      if (statusCode >= 400) {
        console.error(logMessage);
      } else {
        console.log(logMessage);
      }

      return res.send(data);
    };

    next();
  } catch (error) {
    console.error("Logger middleware error:", error);
    next();
  }
};

// Error logging middleware (should be placed after all other middleware/routes)
exports.errorLogger = async (err, req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const method = req.method;
    const path = req.path;
    const statusCode = err.statusCode || 500;

    const action = `ERROR - ${method} ${path} - ${statusCode} - ${err.message}`;

    // Log to database
    if (userId) {
      await Log.create(userId, action);
    }

    // Log to console
    console.error(
      `[ERROR] [${new Date().toISOString()}] ${method} ${path} - ${statusCode} - ${
        err.message
      }`
    );

    res.status(statusCode).json({
      success: false,
      message: err.message || "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err : {},
    });
  } catch (error) {
    console.error("Error logger middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Activity logger - logs specific user actions
exports.activityLogger = (actionName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id || null;

      if (userId) {
        await Log.create(userId, actionName);
      }

      next();
    } catch (error) {
      console.error("Activity logger error:", error);
      next();
    }
  };
};

// Request duration logger
exports.requestDurationLogger = (req, res, next) => {
  const startTime = Date.now();

  // Store original send function
  const originalSend = res.send;

  res.send = function (data) {
    res.send = originalSend;

    const duration = Date.now() - startTime;
    const method = req.method;
    const path = req.path;
    const statusCode = res.statusCode;

    const logMessage = `[${new Date().toISOString()}] ${method} ${path} - ${statusCode} - ${duration}ms`;

    if (duration > 5000) {
      console.warn(`[SLOW REQUEST] ${logMessage}`);
    } else {
      console.log(logMessage);
    }

    return res.send(data);
  };

  next();
};
