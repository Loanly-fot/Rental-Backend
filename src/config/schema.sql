-- Equipment Rental Management System - MySQL Schema

-- Create database
CREATE DATABASE IF NOT EXISTS rental_db;
USE rental_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  daily_rate DECIMAL(10, 2) DEFAULT 0.00,
  qty_total INT NOT NULL CHECK (qty_total > 0),
  qty_available INT NOT NULL CHECK (qty_available >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_availability (qty_available),
  CONSTRAINT check_qty CHECK (qty_available <= qty_total)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rentals table
CREATE TABLE IF NOT EXISTS rentals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  equipment_id INT NOT NULL,
  checkout_date DATETIME NOT NULL,
  return_date DATETIME NOT NULL,
  status ENUM('active', 'returned') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_equipment_id (equipment_id),
  INDEX idx_status (status),
  INDEX idx_checkout_date (checkout_date),
  INDEX idx_return_date (return_date),
  CONSTRAINT check_dates CHECK (return_date > checkout_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Logs table
CREATE TABLE IF NOT EXISTS logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_action_length (action(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample admin user (password: admin123 hashed with bcrypt)
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin User', 'admin@rental.com', '$2b$10$YourHashedPasswordHere', 'admin')
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash);

-- Insert sample users
INSERT INTO users (name, email, password_hash, role) VALUES 
('John Doe', 'john@example.com', '$2b$10$YourHashedPasswordHere', 'user'),
('Jane Smith', 'jane@example.com', '$2b$10$YourHashedPasswordHere', 'user')
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash);

-- Insert sample equipment
INSERT INTO equipment (name, description, category, daily_rate, qty_total, qty_available) VALUES 
('Laptop Dell XPS', 'High performance laptop with 16GB RAM', 'Electronics', 50.00, 10, 10),
('Projector Epson', '4K projector for presentations', 'Electronics', 75.00, 5, 5),
('Whiteboard Standard', 'Standard whiteboard 4x8 ft', 'Office', 10.00, 20, 20),
('Conference Chair', 'Ergonomic conference chair', 'Furniture', 25.00, 30, 30),
('Standing Desk', 'Adjustable standing desk', 'Furniture', 30.00, 15, 15),
('Camera Canon EOS', 'Professional DSLR camera', 'Photography', 80.00, 3, 3),
('Microphone Shure', 'Professional microphone', 'Audio', 40.00, 8, 8),
('Video Tripod', 'Heavy duty video tripod', 'Photography', 35.00, 12, 12)
ON DUPLICATE KEY UPDATE qty_available=VALUES(qty_available);

-- Create views for common queries
CREATE OR REPLACE VIEW active_rentals AS
SELECT 
  r.id,
  r.user_id,
  u.name AS user_name,
  u.email,
  r.equipment_id,
  e.name AS equipment_name,
  e.category,
  r.checkout_date,
  r.return_date,
  r.status,
  DATEDIFF(r.return_date, NOW()) AS days_remaining
FROM rentals r
JOIN users u ON r.user_id = u.id
JOIN equipment e ON r.equipment_id = e.id
WHERE r.status = 'active'
ORDER BY r.return_date ASC;

CREATE OR REPLACE VIEW overdue_rentals AS
SELECT 
  r.id,
  r.user_id,
  u.name AS user_name,
  u.email,
  r.equipment_id,
  e.name AS equipment_name,
  e.category,
  r.checkout_date,
  r.return_date,
  r.status,
  DATEDIFF(NOW(), r.return_date) AS days_overdue
FROM rentals r
JOIN users u ON r.user_id = u.id
JOIN equipment e ON r.equipment_id = e.id
WHERE r.status = 'active' AND r.return_date < NOW()
ORDER BY r.return_date ASC;

CREATE OR REPLACE VIEW equipment_utilization AS
SELECT 
  e.id,
  e.name,
  e.category,
  e.qty_total,
  e.qty_available,
  (e.qty_total - e.qty_available) AS qty_checked_out,
  ROUND(((e.qty_total - e.qty_available) / e.qty_total * 100), 2) AS utilization_rate
FROM equipment e
ORDER BY utilization_rate DESC;

CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(r.id) AS total_rentals,
  SUM(CASE WHEN r.status = 'active' THEN 1 ELSE 0 END) AS active_rentals,
  SUM(CASE WHEN r.status = 'returned' THEN 1 ELSE 0 END) AS completed_rentals,
  COUNT(l.id) AS total_actions
FROM users u
LEFT JOIN rentals r ON u.id = r.user_id
LEFT JOIN logs l ON u.id = l.user_id
GROUP BY u.id, u.name, u.email;

-- Create stored procedures
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS GetDailyRentalReport(IN report_date DATE)
BEGIN
  SELECT 
    r.id,
    u.name AS user_name,
    u.email,
    e.name AS equipment_name,
    e.category,
    r.checkout_date,
    r.return_date,
    r.status
  FROM rentals r
  JOIN users u ON r.user_id = u.id
  JOIN equipment e ON r.equipment_id = e.id
  WHERE DATE(r.checkout_date) = report_date
  ORDER BY r.checkout_date DESC;
END //

CREATE PROCEDURE IF NOT EXISTS GetMonthlyRentalReport(IN report_month INT, IN report_year INT)
BEGIN
  SELECT 
    r.id,
    u.name AS user_name,
    u.email,
    e.name AS equipment_name,
    e.category,
    r.checkout_date,
    r.return_date,
    r.status
  FROM rentals r
  JOIN users u ON r.user_id = u.id
  JOIN equipment e ON r.equipment_id = e.id
  WHERE MONTH(r.checkout_date) = report_month 
    AND YEAR(r.checkout_date) = report_year
  ORDER BY r.checkout_date DESC;
END //

CREATE PROCEDURE IF NOT EXISTS LogUserAction(IN p_user_id INT, IN p_action TEXT)
BEGIN
  INSERT INTO logs (user_id, action) VALUES (p_user_id, p_action);
END //

CREATE PROCEDURE IF NOT EXISTS CheckoutEquipment(
  IN p_user_id INT,
  IN p_equipment_id INT,
  IN p_return_date DATETIME
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Checkout failed';
  END;

  START TRANSACTION;

  -- Check if equipment is available
  IF NOT EXISTS (SELECT 1 FROM equipment WHERE id = p_equipment_id AND qty_available > 0) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Equipment not available';
  END IF;

  -- Create rental record
  INSERT INTO rentals (user_id, equipment_id, checkout_date, return_date, status)
  VALUES (p_user_id, p_equipment_id, NOW(), p_return_date, 'active');

  -- Update equipment availability
  UPDATE equipment SET qty_available = qty_available - 1 WHERE id = p_equipment_id;

  -- Log action
  INSERT INTO logs (user_id, action) 
  VALUES (p_user_id, CONCAT('Checked out equipment ID: ', p_equipment_id));

  COMMIT;
END //

CREATE PROCEDURE IF NOT EXISTS ReturnEquipment(IN p_rental_id INT)
BEGIN
  DECLARE v_equipment_id INT;
  DECLARE v_user_id INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Return failed';
  END;

  START TRANSACTION;

  -- Get rental details
  SELECT equipment_id, user_id INTO v_equipment_id, v_user_id 
  FROM rentals WHERE id = p_rental_id;

  IF v_equipment_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Rental not found';
  END IF;

  -- Update rental status
  UPDATE rentals SET status = 'returned' WHERE id = p_rental_id;

  -- Update equipment availability
  UPDATE equipment SET qty_available = qty_available + 1 WHERE id = v_equipment_id;

  -- Log action
  INSERT INTO logs (user_id, action) 
  VALUES (v_user_id, CONCAT('Returned rental ID: ', p_rental_id));

  COMMIT;
END //

DELIMITER ;

-- Display schema summary
SELECT 'Schema created successfully!' AS message;
