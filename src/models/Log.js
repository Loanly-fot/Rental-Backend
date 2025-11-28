const pool = require("../config/db");

class Log {
  // Create new log entry
  static async create(userId, action) {
    const query =
      "INSERT INTO logs (user_id, action, timestamp) VALUES (?, ?, NOW())";
    const [result] = await pool.execute(query, [userId, action]);
    return result.insertId;
  }

  // Get log by ID
  static async findById(id) {
    const query =
      "SELECT id, user_id, action, timestamp FROM logs WHERE id = ?";
    const [rows] = await pool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Get all logs
  static async findAll() {
    const query =
      "SELECT id, user_id, action, timestamp FROM logs ORDER BY timestamp DESC";
    const [rows] = await pool.execute(query);
    return rows;
  }

  // Get logs by user ID
  static async findByUserId(userId) {
    const query =
      "SELECT id, user_id, action, timestamp FROM logs WHERE user_id = ? ORDER BY timestamp DESC";
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  }

  // Get logs by date range
  static async findByDateRange(startDate, endDate) {
    const query =
      "SELECT id, user_id, action, timestamp FROM logs WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC";
    const [rows] = await pool.execute(query, [startDate, endDate]);
    return rows;
  }

  // Get logs by action
  static async findByAction(action) {
    const query =
      "SELECT id, user_id, action, timestamp FROM logs WHERE action = ? ORDER BY timestamp DESC";
    const [rows] = await pool.execute(query, [action]);
    return rows;
  }

  // Get recent logs (last N entries)
  static async findRecent(limit = 50) {
    const query =
      "SELECT id, user_id, action, timestamp FROM logs ORDER BY timestamp DESC LIMIT ?";
    const [rows] = await pool.execute(query, [limit]);
    return rows;
  }

  // Get logs with user details
  static async findAllWithUserDetails() {
    const query = `
      SELECT l.id, l.user_id, l.action, l.timestamp, u.name AS user_name, u.email
      FROM logs l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.timestamp DESC
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }

  // Get logs for user with details
  static async findByUserIdWithDetails(userId) {
    const query = `
      SELECT l.id, l.user_id, l.action, l.timestamp, u.name AS user_name, u.email
      FROM logs l
      JOIN users u ON l.user_id = u.id
      WHERE l.user_id = ?
      ORDER BY l.timestamp DESC
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  }

  // Delete old logs (older than specified days)
  static async deleteOlderThan(days) {
    const query =
      "DELETE FROM logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)";
    const [result] = await pool.execute(query, [days]);
    return result.affectedRows;
  }

  // Get action summary
  static async getActionSummary() {
    const query = `
      SELECT action, COUNT(*) AS count
      FROM logs
      GROUP BY action
      ORDER BY count DESC
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }
}

module.exports = Log;
