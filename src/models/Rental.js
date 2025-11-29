const pool = require("../config/db");

class Rental {
  // Create new rental
  static async create(userId, equipmentId, checkoutDate, returnDate, status = "active", quantity = 1, totalCost = 0) {
    const query =
      "INSERT INTO rentals (user_id, equipment_id, checkout_date, return_date, status, quantity, total_cost) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const [result] = await pool.execute(query, [
      userId,
      equipmentId,
      checkoutDate,
      returnDate,
      status,
      quantity,
      totalCost,
    ]);
    return { id: result.insertId };
  }

  // Get rental by ID
  static async findById(id) {
    const query = `
      SELECT r.id, r.user_id, r.equipment_id, r.checkout_date, r.return_date, r.status, r.quantity, r.total_cost,
             u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
             e.name AS equipment_name, e.daily_rate
      FROM rentals r
      JOIN users u ON r.user_id = u.id
      JOIN equipment e ON r.equipment_id = e.id
      WHERE r.id = ?
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Get all rentals with details
  static async findAllWithDetails() {
    const query = `
      SELECT r.id, r.user_id, r.equipment_id, r.checkout_date, r.return_date, r.status, r.quantity, r.total_cost,
             u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
             e.name AS equipment_name, e.daily_rate
      FROM rentals r
      JOIN users u ON r.user_id = u.id
      JOIN equipment e ON r.equipment_id = e.id
      ORDER BY r.id DESC
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }

  // Get rentals by user ID
  static async findByUserId(userId) {
    const query = `
      SELECT r.id, r.user_id, r.equipment_id, r.checkout_date, r.return_date, r.status, r.quantity, r.total_cost,
             u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
             e.name AS equipment_name, e.daily_rate
      FROM rentals r
      JOIN users u ON r.user_id = u.id
      JOIN equipment e ON r.equipment_id = e.id
      WHERE r.user_id = ?
      ORDER BY r.id DESC
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  }

  // Get active rentals
  static async findActive() {
    const query = `
      SELECT r.id, r.user_id, r.equipment_id, r.checkout_date, r.return_date, r.status, r.quantity, r.total_cost,
             u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
             e.name AS equipment_name, e.daily_rate
      FROM rentals r
      JOIN users u ON r.user_id = u.id
      JOIN equipment e ON r.equipment_id = e.id
      WHERE r.status = 'active'
      ORDER BY r.return_date ASC
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }

  // Get active rentals for user
  static async findActiveByUserId(userId) {
    const query = `
      SELECT r.id, r.user_id, r.equipment_id, r.checkout_date, r.return_date, r.status, r.quantity, r.total_cost,
             u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
             e.name AS equipment_name, e.daily_rate
      FROM rentals r
      JOIN users u ON r.user_id = u.id
      JOIN equipment e ON r.equipment_id = e.id
      WHERE r.user_id = ? AND r.status = 'active'
      ORDER BY r.return_date ASC
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  }

  // Get overdue rentals
  static async findOverdue() {
    const query = `
      SELECT r.id, r.user_id, r.equipment_id, r.checkout_date, r.return_date, r.status, r.quantity, r.total_cost,
             u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
             e.name AS equipment_name, e.daily_rate
      FROM rentals r
      JOIN users u ON r.user_id = u.id
      JOIN equipment e ON r.equipment_id = e.id
      WHERE r.status = 'active' AND r.return_date < NOW()
      ORDER BY r.return_date ASC
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }

  // Update rental status
  static async updateStatus(id, status) {
    const query = "UPDATE rentals SET status = ? WHERE id = ?";
    const [result] = await pool.execute(query, [status, id]);
    return result.affectedRows > 0;
  }

  // Update rental
  static async update(id, userId, equipmentId, checkoutDate, returnDate, status, quantity, totalCost) {
    const query = `
      UPDATE rentals
      SET user_id = ?, equipment_id = ?, checkout_date = ?, return_date = ?, status = ?, quantity = ?, total_cost = ?
      WHERE id = ?
    `;
    const [result] = await pool.execute(query, [
      userId,
      equipmentId,
      checkoutDate,
      returnDate,
      status,
      quantity,
      totalCost,
      id,
    ]);
    return result.affectedRows > 0;
  }

  // Delete rental
  static async delete(id) {
    const query = "DELETE FROM rentals WHERE id = ?";
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Get rentals by equipment ID
  static async findByEquipmentId(equipmentId) {
    const query = `
      SELECT r.id, r.user_id, r.equipment_id, r.checkout_date, r.return_date, r.status, r.quantity, r.total_cost,
             u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
             e.name AS equipment_name, e.daily_rate
      FROM rentals r
      JOIN users u ON r.user_id = u.id
      JOIN equipment e ON r.equipment_id = e.id
      WHERE r.equipment_id = ?
      ORDER BY r.id DESC
    `;
    const [rows] = await pool.execute(query, [equipmentId]);
    return rows;
  }
}

module.exports = Rental;
