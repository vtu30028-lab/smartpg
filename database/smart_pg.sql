CREATE DATABASE IF NOT EXISTS smart_pg;
USE smart_pg;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('student', 'owner', 'admin') DEFAULT 'student',
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pgs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rent DECIMAL(10, 2) NOT NULL,
  rooms INT DEFAULT 1,
  room_type ENUM('single', 'double', 'triple', 'shared') DEFAULT 'single',
  gender_preference ENUM('male', 'female', 'any') DEFAULT 'any',
  food_available BOOLEAN DEFAULT FALSE,
  wifi BOOLEAN DEFAULT FALSE,
  ac BOOLEAN DEFAULT FALSE,
  attached_bathroom BOOLEAN DEFAULT FALSE,
  laundry BOOLEAN DEFAULT FALSE,
  parking BOOLEAN DEFAULT FALSE,
  images JSON,
  amenities JSON,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  pg_id INT NOT NULL,
  room_type VARCHAR(50),
  move_in_date DATE,
  duration_months INT DEFAULT 1,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pg_id) REFERENCES pgs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  booking_id INT,
  pg_id INT,
  amount DECIMAL(10, 2) NOT NULL,
  payment_type ENUM('booking', 'rent', 'deposit') DEFAULT 'rent',
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
  receipt_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  FOREIGN KEY (pg_id) REFERENCES pgs(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  pg_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pg_id) REFERENCES pgs(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_pg_review (user_id, pg_id)
);

-- Sample admin user (password: password)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@smartpg.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Sample owners
INSERT INTO users (name, email, password, role, phone) VALUES
('Rajesh Kumar', 'owner@smartpg.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner', '9876543210'),
('Anita Desai', 'anita@smartpg.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner', '9876543212');

-- Sample student
INSERT INTO users (name, email, password, role, phone) VALUES
('Priya Sharma', 'student@smartpg.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', '9876543211');

-- Sample PGs (showcase listings — filters, map, AI search)
INSERT INTO pgs (owner_id, name, description, location, address, latitude, longitude, rent, rooms, room_type, gender_preference, food_available, wifi, ac, attached_bathroom, laundry, parking, images, is_featured, rating, total_reviews) VALUES
(2, 'Sunshine PG for Girls', 'Premium PG with homely food and 24/7 security near Christ University campus.', 'Koramangala, Bangalore', '123 5th Block, Koramangala', 12.9352, 77.6245, 7500, 20, 'double', 'female', TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]', TRUE, 4.5, 28),
(2, 'Elite Boys Hostel', 'Modern hostel with gym, study room and high-speed WiFi near college area.', 'Indiranagar, Bangalore', '456 100 Feet Road, Indiranagar', 12.9784, 77.6408, 6500, 30, 'triple', 'male', TRUE, TRUE, FALSE, FALSE, TRUE, TRUE, '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]', TRUE, 4.2, 45),
(2, 'Comfort Stay PG', 'Budget friendly PG with WiFi near HSR metro station. Great for interns.', 'HSR Layout, Bangalore', '789 Sector 2, HSR Layout', 12.9116, 77.6473, 5500, 15, 'shared', 'any', FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]', FALSE, 3.8, 12),
(2, 'Premium Living Spaces', 'Luxury PG with AC rooms, attached bathroom and premium food near ITPL.', 'Whitefield, Bangalore', '321 ITPL Road, Whitefield', 12.9698, 77.7500, 12000, 10, 'single', 'any', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"]', TRUE, 4.8, 56),
(2, 'Student Hub PG', 'Perfect for college students with library, mess facility and study hall.', 'Jayanagar, Bangalore', '567 4th Block, Jayanagar', 12.9308, 77.5838, 6000, 25, 'double', 'any', TRUE, TRUE, FALSE, TRUE, TRUE, FALSE, '["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"]', FALSE, 4.0, 33),
(2, 'Green Valley Girls PG', 'Safe and clean PG for working women and students. Home-style food included.', 'BTM Layout, Bangalore', '12th Main, BTM 2nd Stage', 12.9166, 77.6101, 7200, 18, 'double', 'female', TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '["https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=800"]', TRUE, 4.6, 41),
(2, 'Metro View PG', 'Walking distance from MG Road metro. Ideal for office-goers and students.', 'MG Road, Bangalore', '45 Brigade Road, MG Road', 12.9750, 77.6063, 8500, 12, 'single', 'any', TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, '["https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800"]', TRUE, 4.3, 19),
(2, 'Budget Nest PG', 'Affordable shared rooms under 5000. Basic amenities, great location near college.', 'Marathahalli, Bangalore', 'Outer Ring Road, Marathahalli', 12.9591, 77.6974, 4500, 40, 'shared', 'any', FALSE, TRUE, FALSE, FALSE, FALSE, TRUE, '["https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800"]', FALSE, 3.5, 8),
(3, 'Campus Connect PG', 'Right next to RV College. Mess with North & South Indian food. WiFi 100 Mbps.', 'Jayanagar, Bangalore', 'RV College Road, Jayanagar', 12.9230, 77.5680, 7800, 22, 'triple', 'any', TRUE, TRUE, FALSE, TRUE, TRUE, FALSE, '["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800"]', TRUE, 4.4, 37),
(3, 'Silicon Stay PG', 'Tech park friendly PG near Bellandur. AC rooms, food, laundry & parking.', 'Bellandur, Bangalore', 'ORR Bellandur Gate', 12.9250, 77.6762, 9500, 16, 'double', 'any', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["https://images.unsplash.com/photo-1505693416388-ac5ce068fe5?w=800"]', TRUE, 4.7, 52),
(3, 'Royal Gents Hostel', 'Boys only hostel near Electronic City. Gym, mess, and 24/7 water supply.', 'Electronic City, Bangalore', 'Phase 1, Electronic City', 12.8456, 77.6603, 5800, 35, 'triple', 'male', TRUE, TRUE, FALSE, FALSE, TRUE, TRUE, '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"]', FALSE, 4.1, 24),
(3, 'Cozy Corner PG', 'Small family-run PG with homely atmosphere. Food available, near college bus stop.', 'Malleshwaram, Bangalore', '8th Cross, Malleshwaram', 13.0035, 77.5640, 5200, 8, 'double', 'female', TRUE, TRUE, FALSE, TRUE, FALSE, FALSE, '["https://images.unsplash.com/photo-1560448075-bb485b067938?w=800"]', FALSE, 4.2, 15),
(3, 'Skyline Premium PG', 'Top-floor rooms with city view. AC, attached bath, premium food — all inclusive.', 'Indiranagar, Bangalore', 'CMH Road, Indiranagar', 12.9719, 77.6412, 11000, 8, 'single', 'any', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]', TRUE, 4.9, 63),
(3, 'Scholar\'s Den PG', 'Quiet PG for exam prep. Study room, WiFi, food under 8000 near college area.', 'Rajajinagar, Bangalore', 'Near Rajajinagar Metro', 13.0104, 77.5514, 6800, 14, 'double', 'any', TRUE, TRUE, FALSE, TRUE, TRUE, FALSE, '["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"]', FALSE, 4.0, 21),
(3, 'Urban Oasis PG', 'Modern co-living style PG with shared kitchen and high-speed internet.', 'Koramangala, Bangalore', '80 Feet Road, Koramangala 6th Block', 12.9380, 77.6220, 8200, 20, 'double', 'any', FALSE, TRUE, TRUE, TRUE, TRUE, FALSE, '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"]', FALSE, 4.3, 17),
(3, 'Pocket Friendly PG', 'Best value PG in HSR — under 6000 with WiFi. Perfect for first-year students.', 'HSR Layout, Bangalore', 'Sector 7, HSR Layout', 12.9080, 77.6510, 4800, 30, 'shared', 'any', FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, '["https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800"]', FALSE, 3.9, 11),
(2, 'Ladies First PG', 'Women-only PG with CCTV, biometric entry, and nutritious mess meals.', 'Whitefield, Bangalore', 'Hope Farm Junction, Whitefield', 12.9960, 77.7580, 7000, 24, 'double', 'female', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=800"]', TRUE, 4.5, 38);

-- Sample reviews (showcase ratings on PG detail pages)
INSERT INTO reviews (user_id, pg_id, rating, comment) VALUES
(4, 1, 5, 'Amazing food and very safe for girls. Close to my college!'),
(4, 2, 4, 'Good WiFi for online classes. Gym is a nice bonus.'),
(4, 5, 4, 'Library timings are perfect for exam season. Mess food is decent.'),
(4, 9, 5, 'Best PG near RV College. Mess has great variety.'),
(4, 10, 5, 'AC rooms are worth it. Very close to tech parks.');

-- Sample booking (showcase student dashboard)
INSERT INTO bookings (user_id, pg_id, room_type, move_in_date, duration_months, status, total_amount) VALUES
(4, 5, 'double', '2026-07-01', 3, 'confirmed', 18000),
(4, 9, 'triple', '2026-08-15', 1, 'pending', 7800);

-- Sample payment (showcase payment history)
INSERT INTO payments (user_id, booking_id, pg_id, amount, payment_type, razorpay_order_id, razorpay_payment_id, status) VALUES
(4, 1, 5, 18000, 'booking', 'order_demo001', 'pay_demo001', 'success');
