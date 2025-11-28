const pool = require("../config/db");

class Rental {
  // Create new rental
  static async create(
    userId,
    equipmentId,
    checkoutDate,
    returnDate,
    status = "active"
  ) {
    const query =
      "INSERT INTO rentals (user_id, equipment_id, checkout_date, return_date, status) VALUES (?, ?, ?, ?, ?)";
    const [result] = await pool.execute(query, [
      userId,
      equipmentId,
      checkoutDate,
      returnDate,
      status,
    ]);
    return result.insertId;
  }

  // Get rental by ID
  static async findById(id) {
    const query =
      "SELECT id, user_id, equipment_id, checkout_date, return_date, status FROM rentals WHERE id = ?";
    const [rows] = await pool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Get all rentals
  static async findAll() {
    const query =
      "SELECT id, user_id, equipment_id, checkout_date, return_date, status FROM rentals";
    const [rows] = await pool.execute(query);
    return rows;
  }

  // Get rentals by user ID
  static async findByUserId(userId) {
    const query =
      "SELECT id, user_id, equipment_id, checkout_date, return_date, status FROM rentals WHERE user_id = ?";
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  }

  // Get rentals by equipment ID
  static async findByEquipmentId(equipmentId) {
    const query =
      "SELECT id, user_id, equipment_id, checkout_date, return_date, status FROM rentals WHERE equipment_id = ?";
    const [rows] = await pool.execute(query, [equipmentId]);
    return rows;
  }

  // Get active rentals
  static async findActive() {
    const query =
      "SELECT id, user_id, equipment_id, checkout_date, return_date, status FROM rentals WHERE status = ?";
    const [rows] = await pool.execute(query, ["active"]);
    return rows;
  }

  // Get active rentals for user
  static async findActiveByUserId(userId) {
    const query =
      "SELECT id, user_id, equipment_id, checkout_date, return_date, status FROM rentals WHERE user_id = ? AND status = ?";
    const [rows] = await pool.execute(query, [userId, "active"]);
    return rows;
  }

  // Update rental status
  static async updateStatus(id, status) {
    const query = "UPDATE rentals SET status = ? WHERE id = ?";
    const [result] = await pool.execute(query, [status, id]);
    return result.affectedRows > 0;
  }

  // Update rental
  static async update(
    id,
    userId,
    equipmentId,
    checkoutDate,
    returnDate,
    status
  ) {
    const query =
      "UPDATE rentals SET user_id = ?, equipment_id = ?, checkout_date = ?, return_date = ?, status = ? WHERE id = ?";
    const [result] = await pool.execute(query, [
      userId,
      equipmentId,
      checkoutDate,
      returnDate,
      status,
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

  // Get rentals with user and equipment details
  static async findAllWithDetails() {
    const query = `
      SELECT r.id, r.user_id, r.equipment_id, r.checkout_date, r.return_date, r.status,
             u.name AS user_name, u.email, e.name AS equipment_name, e.category
      FROM rentals r
      JOIN users u ON r.user_id = u.id
      JOIN equipment e ON r.equipment_id = e.id
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }

  // Get overdue rentals
  static async findOverdue() {
    const query = `
      SELECT id, user_id, equipment_id, checkout_date, return_date, status 
      FROM rentals 
      WHERE status = 'active' AND return_date < NOW()
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }
}

module.exports = Rental;
