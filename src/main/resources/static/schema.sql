-- Database creation
CREATE DATABASE IF NOT EXISTS blood_donation_db;
USE blood_donation_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    dob DATE,
    gender VARCHAR(20),
    role ENUM('DONOR', 'ADMIN') DEFAULT 'DONOR'
);

-- Donors table (updated with more fields)
CREATE TABLE IF NOT EXISTS donors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    blood_type VARCHAR(5) NOT NULL,
    last_donation_date DATE,
    eligible_to_donate BOOLEAN DEFAULT TRUE,
    total_donations INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- New: Blood Donation Centers table
CREATE TABLE IF NOT EXISTS donation_centers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    operating_hours TEXT
);

-- New: Donations table (to track each donation)
CREATE TABLE IF NOT EXISTS donations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donor_id BIGINT NOT NULL,
    center_id BIGINT NOT NULL,
    donation_date DATETIME NOT NULL,
    amount_ml INT NOT NULL,
    notes TEXT,
    status ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
    FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE,
    FOREIGN KEY (center_id) REFERENCES donation_centers(id)
);

-- New: Blood Requests table
CREATE TABLE IF NOT EXISTS blood_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_name VARCHAR(255) NOT NULL,
    blood_type VARCHAR(5) NOT NULL,
    units_needed INT NOT NULL,
    urgency ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20),
    status ENUM('OPEN', 'FULFILLED', 'EXPIRED') DEFAULT 'OPEN'
);

-- New: Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donor_id BIGINT NOT NULL,
    center_id BIGINT NOT NULL,
    appointment_date DATETIME NOT NULL,
    status ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'MISSED') DEFAULT 'SCHEDULED',
    notes TEXT,
    FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE,
    FOREIGN KEY (center_id) REFERENCES donation_centers(id)
);

-- New: Health Tips table
CREATE TABLE IF NOT EXISTS health_tips (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (email, password, first_name, last_name, username, dob, gender, role) VALUES
('aoun@gmail.com', '1234', 'Admin', 'User', 'admin', '1980-01-01', 'Male', 'ADMIN');

select * from users;