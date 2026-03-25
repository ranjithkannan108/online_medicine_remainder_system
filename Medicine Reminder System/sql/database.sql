-- =============================================
-- MedReminder Database Schema
-- MySQL Database
-- =============================================

CREATE DATABASE IF NOT EXISTS medicineremainder;
USE medicineremainder;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medicines Table
CREATE TABLE IF NOT EXISTS medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50),
    quantity INT DEFAULT 0,
    frequency VARCHAR(50),
    start_date DATE,
    end_date DATE,
    times VARCHAR(200),
    notes TEXT,
    min_stock_alert INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- History Table
CREATE TABLE IF NOT EXISTS history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    medicine_id INT,
    medicine_name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50),
    action_type VARCHAR(50) DEFAULT 'Taken',
    taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE SET NULL
);

-- Dismissed Alerts Table
CREATE TABLE IF NOT EXISTS dismissed_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    medicine_id INT NOT NULL,
    alert_time VARCHAR(10) NOT NULL,
    alert_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    UNIQUE KEY unique_alert (user_id, medicine_id, alert_time, alert_date)
);

-- Default admin user (password: 123)
INSERT IGNORE INTO users (username, password, name) VALUES ('admin', '123', 'Admin User');



ALTER TABLE history ADD COLUMN action_type VARCHAR(50) DEFAULT 'Taken' AFTER dosage;
