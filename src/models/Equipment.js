const pool = require("../config/db");

class Equipment {
  // Create new equipment
  static async create(
    name,
    description,
    category,
    dailyRate,
    qtyTotal,
    qtyAvailable
  ) {
    const query =
      "INSERT INTO equipment (name, description, category, daily_rate, qty_total, qty_available) VALUES (?, ?, ?, ?, ?, ?)";
    const [result] = await pool.execute(query, [
      name,
      description,
      category,
      dailyRate,
      qtyTotal,
      qtyAvailable,
    ]);
    return result.insertId;
  }

  // Get equipment by ID
  static async findById(id) {
    const query =
      "SELECT id, name, description, category, daily_rate, qty_total, qty_available FROM equipment WHERE id = ?";
    const [rows] = await pool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Get all equipment
  static async findAll() {
    const query =
      "SELECT id, name, description, category, daily_rate, qty_total, qty_available FROM equipment";
    const [rows] = await pool.execute(query);
    return rows;
  }

  // Get equipment by category
  static async findByCategory(category) {
    const query =
      "SELECT id, name, description, category, daily_rate, qty_total, qty_available FROM equipment WHERE category = ?";
    const [rows] = await pool.execute(query, [category]);
    return rows;
  }

  // Update equipment
  static async update(
    id,
    name,
    description,
    category,
    dailyRate,
    qtyTotal,
    qtyAvailable
  ) {
    const query =
      "UPDATE equipment SET name = ?, description = ?, category = ?, daily_rate = ?, qty_total = ?, qty_available = ? WHERE id = ?";
    const [result] = await pool.execute(query, [
      name,
      description,
      category,
      dailyRate,
      qtyTotal,
      qtyAvailable,
      id,
    ]);
    return result.affectedRows > 0;
  }

  // Update available quantity
  static async updateAvailableQty(id, qtyAvailable) {
    const query = "UPDATE equipment SET qty_available = ? WHERE id = ?";
    const [result] = await pool.execute(query, [qtyAvailable, id]);
    return result.affectedRows > 0;
  }

  // Delete equipment
  static async delete(id) {
    const query = "DELETE FROM equipment WHERE id = ?";
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Check available quantity
  static async checkAvailability(id, qty) {
    const query = "SELECT qty_available FROM equipment WHERE id = ?";
    const [rows] = await pool.execute(query, [id]);
    if (rows.length === 0) return false;
    return rows[0].qty_available >= qty;
  }

  // Get all categories
  static async getCategories() {
    const query = "SELECT DISTINCT category FROM equipment ORDER BY category";
    const [rows] = await pool.execute(query);
    return rows;
  }
}

module.exports = Equipment;
