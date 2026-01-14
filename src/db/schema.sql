-- Disable foreign key checks to allow dropping tables
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS service_records;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS cars;
DROP TABLE IF EXISTS company_settings;
DROP TABLE IF EXISTS delivery_areas;

SET FOREIGN_KEY_CHECKS = 1;

-- Company Settings
CREATE TABLE IF NOT EXISTS company_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(100) DEFAULT 'Car Rental Co.',
    address TEXT,
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    website VARCHAR(100),
    tax_number VARCHAR(50),
    footer_text TEXT,
    facebook_url VARCHAR(150),
    twitter_url VARCHAR(150),
    instagram_url VARCHAR(150),
    opening_hours VARCHAR(255),
    registration_fee DECIMAL(10, 2) DEFAULT 0.00,
    local_tax_percent DECIMAL(5, 2) DEFAULT 0.00,
    standard_included_kms INT DEFAULT 2000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO company_settings (
    company_name, address, contact_email, contact_phone, website, tax_number, 
    footer_text, facebook_url, twitter_url, instagram_url, opening_hours, 
    registration_fee, local_tax_percent, standard_included_kms
) VALUES (
    'Riyadh Safe Drive Rentals', 
    '123 Olaya Street, Al Olaya, Riyadh 12211, Saudi Arabia', 
    'support@riyadh-drive.sa', 
    '+966 11 123 4567',
    'https://www.riyadh-drive.sa',
    'VAT-300012345600003',
    '© 2024 Riyadh Safe Drive Rentals. All rights reserved. Driving excellence in the Kingdom.',
    'https://facebook.com/riyadhdrive',
    'https://twitter.com/riyadhdrive',
    'https://instagram.com/riyadhdrive',
    'Sat-Thu: 08:00 AM - 10:00 PM, Fri: 04:00 PM - 10:00 PM',
    100.00, 
    15.00, 
    2500
);

-- Cars Table
CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT,
    type VARCHAR(20) COMMENT 'SUV, Sedan, Hatchback, etc.',
    plate_number VARCHAR(20) UNIQUE,
    status ENUM('available', 'booked', 'maintenance') DEFAULT 'available',
    
    -- Car Details
    color VARCHAR(30),
    fuel_type ENUM('Petrol', 'Diesel', 'Hybrid', 'Electric') DEFAULT 'Petrol',
    fuel_efficiency VARCHAR(50) COMMENT 'e.g. 15 km/l',
    interior_details TEXT COMMENT 'Description of room/condition',
    
    image_url VARCHAR(255),
    base_price_offline DECIMAL(10, 2) NOT NULL,
    base_price_online DECIMAL(10, 2) NOT NULL,
    registration_fee DECIMAL(10, 2) DEFAULT 0.00,
    local_tax DECIMAL(10, 2) DEFAULT 0.00,
    included_kms INT DEFAULT 2000,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO cars (make, model, year, type, plate_number, color, fuel_type, fuel_efficiency, interior_details, base_price_offline, base_price_online, registration_fee, local_tax, included_kms, description, status) VALUES
('Toyota', 'Camry', 2024, 'Sedan', 'KSA-1001', 'White', 'Hybrid', '26 km/l', 'Spacious, clean fabric seats, excellent cooling AC. Normal condition.', 250.00, 230.00, 50.00, 0.00, 2000, 'Reliable sedan, perfect for city driving in Riyadh.', 'available'),
('Hyundai', 'Tucson', 2023, 'SUV', 'KSA-2020', 'Silver', 'Petrol', '14 km/l', 'Premium leather interior, panoramic sunroof. Very Good condition.', 350.00, 320.00, 50.00, 0.00, 2000, 'Spacious SUV, great for families and desert edge trips.', 'booked'),
('Mazda', '6', 2024, 'Sedan', 'KSA-3030', 'Soul Red', 'Petrol', '16 km/l', 'Luxury leather finish, Bose sound system. Excellent condition.', 280.00, 260.00, 50.00, 0.00, 2000, 'Stylish executive sedan with premium interior.', 'available'),
('GMC', 'Yukon', 2023, 'SUV', 'KSA-4040', 'Black', 'Petrol', '8 km/l', 'Huge legroom, 7-seater, captain seats. Premium VIP condition.', 800.00, 750.00, 100.00, 0.00, 2500, 'Luxury full-size SUV for VIP travel and comfort.', 'maintenance'),
('Nissan', 'Sunny', 2023, 'Sedan', 'KSA-5050', 'White', 'Petrol', '18 km/l', 'Basic clean interior, cloth seats. Good standard condition.', 150.00, 140.00, 50.00, 0.00, 2000, 'Economical and fuel-efficient for daily commute.', 'available');

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    status ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled') DEFAULT 'pending',
    
    -- Rental Options
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    with_driver BOOLEAN DEFAULT FALSE,
    additional_driver BOOLEAN DEFAULT FALSE,
    
    -- Pricing
    total_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'SAR',
    
    -- Customer Details
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    driver_age INT NOT NULL COMMENT 'Must be > 21',
    
    -- Billing Address
    company_name VARCHAR(150),
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    address_line_3 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (car_id) REFERENCES cars(id)
);

INSERT INTO bookings (car_id, status, start_date, end_date, with_driver, total_price, first_name, last_name, email, mobile_number, driver_age, address_line_1, city, postcode, country) VALUES
(2, 'active', DATE_ADD(NOW(), INTERVAL -2 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY), FALSE, 1600.00, 'Ahmed', 'Al-Farsi', 'ahmed@mock.com', '+966500000001', 35, 'King Fahd Rd', 'Riyadh', '12211', 'Saudi Arabia'),
(1, 'completed', DATE_ADD(NOW(), INTERVAL -10 DAY), DATE_ADD(NOW(), INTERVAL -5 DAY), TRUE, 1500.00, 'John', 'Doe', 'john@mock.com', '+1555000000', 40, '123 Pine St', 'London', 'SW1', 'UK'),
(3, 'confirmed', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), FALSE, 520.00, 'Sarah', 'Connor', 'sarah@mock.com', '+966500000002', 29, 'Olaya St', 'Riyadh', '12212', 'Saudi Arabia');


-- Delivery Areas
CREATE TABLE IF NOT EXISTS delivery_areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    area_name VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20),
    delivery_charge DECIMAL(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO delivery_areas (area_name, zip_code, delivery_charge, is_active) VALUES
('King Khalid International Airport (RUH)', '11564', 50.00, TRUE),
('Olaya District', '12211', 20.00, TRUE),
('Al Malqa', '13521', 25.00, TRUE),
('Diplomatic Quarter', '12512', 30.00, TRUE),
('Al Nakheel', '12381', 0.00, TRUE);

-- Service Records
CREATE TABLE IF NOT EXISTS service_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    cost DECIMAL(10, 2),
    status ENUM('scheduled', 'in_progress', 'completed') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id)
);

INSERT INTO service_records (car_id, start_date, end_date, description, cost, status) VALUES
(4, DATE_ADD(NOW(), INTERVAL -1 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY), 'Regular oil change and brake check', 450.00, 'in_progress'),
(1, DATE_ADD(NOW(), INTERVAL -30 DAY), DATE_ADD(NOW(), INTERVAL -29 DAY), 'Tire replacement', 1200.00, 'completed');
