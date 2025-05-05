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
    role ENUM('DONOR', 'ADMIN') DEFAULT 'DONOR',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
);

-- Donors table
CREATE TABLE IF NOT EXISTS donors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    blood_type VARCHAR(5) NOT NULL,
    last_donation_date DATE,
    eligible_to_donate BOOLEAN DEFAULT TRUE,
    total_donations INT DEFAULT 0,
    medical_conditions TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Donation Centers table
CREATE TABLE IF NOT EXISTS donation_centers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    operating_hours TEXT,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    INDEX idx_city (city)
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donor_id BIGINT NOT NULL,
    center_id BIGINT NOT NULL,
    donation_date DATETIME NOT NULL,
    amount_ml INT NOT NULL,
    notes TEXT,
    status ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE,
    FOREIGN KEY (center_id) REFERENCES donation_centers(id),
    INDEX idx_donor_id (donor_id),
    INDEX idx_donation_date (donation_date)
);

-- Blood Requests table
CREATE TABLE IF NOT EXISTS blood_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_name VARCHAR(255) NOT NULL,
    blood_type VARCHAR(5) NOT NULL,
    units_needed INT NOT NULL,
    urgency ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    status ENUM('OPEN', 'FULFILLED', 'EXPIRED') DEFAULT 'OPEN',
    notes TEXT,
    INDEX idx_blood_type (blood_type),
    INDEX idx_status (status)
);

-- Pending Requests table (new)
CREATE TABLE IF NOT EXISTS pending_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donor_id BIGINT NOT NULL,
    blood_request_id BIGINT NOT NULL,
    applied_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE,
    FOREIGN KEY (blood_request_id) REFERENCES blood_requests(id) ON DELETE CASCADE,
    INDEX idx_donor_id (donor_id),
    INDEX idx_blood_request_id (blood_request_id)
);
select * from pending_requests;
-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donor_id BIGINT NOT NULL,
    center_id BIGINT NOT NULL,
    appointment_date DATETIME NOT NULL,
    status ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'MISSED') DEFAULT 'SCHEDULED',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE,
    FOREIGN KEY (center_id) REFERENCES donation_centers(id),
    INDEX idx_donor_id (donor_id),
    INDEX idx_appointment_date (appointment_date)
);

-- Health Tips table
CREATE TABLE IF NOT EXISTS health_tips (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('BEFORE_DONATION', 'AFTER_DONATION', 'GENERAL') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category)
);

SELECT * from users;
SELECT * from donors;
DELETE from users where id = 4;
-- Sample data
INSERT INTO users (email, password, first_name, last_name, username, dob, gender, role)
VALUES ('admin@reddrop.com','$2a$10$TR5iy0fnx/4X79N97ZbYVu8LeFsbP8TMvlgu0GtVb2EK9MIW0FWgW','Admin','User','admin','1990-01-01','MALE','ADMIN');

truncate donation_centers;
INSERT INTO donation_centers (name, address, city, state, phone, email, operating_hours, latitude, longitude) VALUES
('Central Blood Bank', '123 Health St.', 'Metropolis', 'NY', '555-123-4567', 'contact@centralbb.org', 'Mon-Fri: 8AM-5PM', 40.7128, -74.0060),
('Jamshed Hospital', '123 Health St.', 'Metropolis', 'NY', '555-123-4567', 'contact@centralbb.org', 'Mon-Fri: 8AM-5PM', 40.7128, -74.0060),
('Bachon wala haspital', '123 Health St.', 'Metropolis', 'NY', '555-123-4567', 'contact@centralbb.org', 'Mon-Fri: 8AM-5PM', 40.7128, -74.0060),
('Community Blood Drive', '456 Wellness Ave.', 'Gotham', 'NJ', '555-987-6543', 'info@communitybd.org', 'Mon-Sat: 9AM-6PM', 40.7357, -74.1724);

select* from donation_centers;
select * from health_tips;
INSERT INTO health_tips (title, content, category) VALUES
('Stay Hydrated', 'Drink plenty of water before and after donation to help your body recover quickly.', 'BEFORE_DONATION'),
('Eat Iron-Rich Foods', 'Include foods like spinach, red meat, and beans in your diet to maintain healthy iron levels.', 'BEFORE_DONATION'),
('Rest Properly', 'Get a good night\'s sleep before donation and avoid strenuous activity for 24 hours after.', 'AFTER_DONATION');

INSERT INTO blood_requests (hospital_name, blood_type, units_needed, urgency, request_date, contact_name, contact_phone, contact_email, status, notes)
VALUES
('City Hospital', 'A+', 2, 'HIGH', NOW(), 'Dr. Smith', '555-111-2222', 'smith@cityhospital.com', 'OPEN', 'Urgent need for surgery'),
('Metro Clinic', 'O-', 1, 'CRITICAL', NOW(), 'Nurse Jane', '555-333-4444', 'jane@metroclinic.com', 'OPEN', 'Accident case'),
('Red Cross Center', 'B+', 3, 'MEDIUM', NOW(), 'Coordinator Lee', '555-555-6666', 'lee@redcross.org', 'OPEN', 'Routine stock replenishment');

-- Insert dummy donation history
INSERT INTO donations (donor_id, center_id, donation_date, amount_ml, notes, status, created_at)
VALUES
  (1, 1, '2024-05-01 10:00:00', 450, 'First donation', 'COMPLETED', NOW()),
  (1, 2, '2024-04-01 09:30:00', 450, 'Second donation', 'COMPLETED', NOW());
  
SELECT * FROM donation_centers;
 select * from blood_requests;
 select * from appointments;
 select * from pending_requests;
 truncate appointments;
 truncate blood_requests;
 truncate pending_requests;
 
 select * from blood_requests;
 
INSERT INTO appointments (donor_id, center_id, appointment_date, status, notes)
VALUES
(1, 1, DATE_ADD(NOW(), INTERVAL 2 DAY), 'SCHEDULED', 'First appointment'),
(1, 2, DATE_ADD(NOW(), INTERVAL 10 DAY), 'SCHEDULED', 'Second appointment');