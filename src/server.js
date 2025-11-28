const app = require("./app");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          Equipment Rental Management API Server               ║
╚═══════════════════════════════════════════════════════════════╝

📍 Server running on: http://localhost:${PORT}
🌍 Environment: ${NODE_ENV}
📚 API Documentation: http://localhost:${PORT}/api-docs
❤️  Health Check: http://localhost:${PORT}/health

API Endpoints:
  🔐 Auth: http://localhost:${PORT}/api/auth
  🛠️  Equipment: http://localhost:${PORT}/api/equipment
  📦 Rentals: http://localhost:${PORT}/api/rentals
  📊 Reports: http://localhost:${PORT}/api/reports

═══════════════════════════════════════════════════════════════
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

module.exports = server;
