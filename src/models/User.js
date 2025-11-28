const pool = require("../config/db");

class User {
  // Create a new user
  static async create(name, email, passwordHash, role = "user") {
    const query =
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)";
    const [result] = await pool.execute(query, [
      name,
      email,
      passwordHash,
      role,
    ]);
    return result.insertId;
  }

  // Get user by ID
  static async findById(id) {
    const query =
      "SELECT id, name, email, password_hash, role FROM users WHERE id = ?";
    const [rows] = await pool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Get user by email
  static async findByEmail(email) {
    const query =
      "SELECT id, name, email, password_hash, role FROM users WHERE email = ?";
    const [rows] = await pool.execute(query, [email]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Get all users
  static async findAll() {
    const query = "SELECT id, name, email, role FROM users";
    const [rows] = await pool.execute(query);
    return rows;
  }

  // Update user
  static async update(id, name, email, role) {
    const query = "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?";
    const [result] = await pool.execute(query, [name, email, role, id]);
    return result.affectedRows > 0;
  }

  // Delete user
  static async delete(id) {
    const query = "DELETE FROM users WHERE id = ?";
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Check if user exists
  static async exists(email) {
    const query = "SELECT id FROM users WHERE email = ?";
    const [rows] = await pool.execute(query, [email]);
    return rows.length > 0;
  }
}

module.exports = User;
