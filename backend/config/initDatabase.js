const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_pg',
};

let dbConnected = false;

async function testConnection() {
  try {
    const conn = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
    });
    await conn.query('SELECT 1');
    await conn.end();
    dbConnected = true;
    return true;
  } catch {
    dbConnected = false;
    return false;
  }
}

async function initDatabase() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
    });

    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
    await conn.query(`USE \`${config.database}\``);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role ENUM('student', 'owner', 'admin') DEFAULT 'student',
        avatar VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
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
        room_pricing JSON,
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
      )
    `);

    await conn.query(`
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
      )
    `);

    await conn.query(`
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
      )
    `);

    await conn.query(`
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
      )
    `);

    const DEMO_HASH = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

    const [userRows] = await conn.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      await conn.query(`
        INSERT INTO users (name, email, password, role, phone) VALUES
        ('Admin User', 'admin@smartpg.com', ?, 'admin', NULL),
        ('Rajesh Kumar', 'owner@smartpg.com', ?, 'owner', '9876543210'),
        ('Anita Desai', 'anita@smartpg.com', ?, 'owner', '9876543212'),
        ('Priya Sharma', 'student@smartpg.com', ?, 'student', '9876543211')
      `, [DEMO_HASH, DEMO_HASH, DEMO_HASH, DEMO_HASH]);
      console.log('  Seeded default users (password: password)');
    }

    const [pgRows] = await conn.query('SELECT COUNT(*) as count FROM pgs');
    if (pgRows[0].count === 0) {
      await seedPGs(conn);
      console.log('  Seeded sample PG listings');
    }

    dbConnected = true;
    console.log(`  MySQL connected: ${config.database}@${config.host}`);
    return true;
  } catch (err) {
    dbConnected = false;
    console.error(`  MySQL FAILED: ${err.message}`);
    console.error('  Set DB_PASSWORD in .env file and restart the server.');
    console.error('  Users will NOT be saved until MySQL is connected.\n');
    return false;
  } finally {
    if (conn) await conn.end();
  }
}

async function seedPGs(conn) {
  const pgs = [
    [2, 'Sunshine PG for Girls', 'Premium PG with homely food near college.', 'Koramangala, Bangalore', '123 5th Block', 12.9352, 77.6245, 7500, 20, '{"double": 7500}', 'female', 1, 1, 1, 1, 1, 0, '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"]', 1, 4.5, 28],
    [2, 'Elite Boys Hostel', 'Modern hostel with gym and WiFi.', 'Indiranagar, Bangalore', '456 100 Feet Road', 12.9784, 77.6408, 6500, 30, '{"triple": 6500}', 'male', 1, 1, 0, 0, 1, 1, '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]', 1, 4.2, 45],
    [2, 'Comfort Stay PG', 'Budget PG near metro.', 'HSR Layout, Bangalore', '789 Sector 2', 12.9116, 77.6473, 5500, 15, '{"shared": 5500}', 'any', 0, 1, 0, 0, 0, 0, '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]', 0, 3.8, 12],
    [2, 'Premium Living Spaces', 'Luxury PG with AC and food.', 'Whitefield, Bangalore', '321 ITPL Road', 12.9698, 77.7500, 12000, 10, '{"single": 12000}', 'any', 1, 1, 1, 1, 1, 1, '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"]', 1, 4.8, 56],
    [2, 'Student Hub PG', 'Library and mess for students.', 'Jayanagar, Bangalore', '567 4th Block', 12.9308, 77.5838, 6000, 25, '{"double": 6000}', 'any', 1, 1, 0, 1, 1, 0, '["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"]', 0, 4.0, 33],
    [3, 'Campus Connect PG', 'Near RV College with mess.', 'Jayanagar, Bangalore', 'RV College Road', 12.9230, 77.5680, 7800, 22, '{"triple": 7800}', 'any', 1, 1, 0, 1, 1, 0, '["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800"]', 1, 4.4, 37],
    [3, 'Silicon Stay PG', 'Near Bellandur tech parks.', 'Bellandur, Bangalore', 'ORR Gate', 12.9250, 77.6762, 9500, 16, '{"double": 9500}', 'any', 1, 1, 1, 1, 1, 1, '["https://images.unsplash.com/photo-1505693416388-ac5ce068fe5?w=800"]', 1, 4.7, 52],
  ];

  for (const pg of pgs) {
    await conn.query(
      `INSERT INTO pgs (owner_id, name, description, location, address, latitude, longitude, rent, rooms, room_pricing, gender_preference, food_available, wifi, ac, attached_bathroom, laundry, parking, images, is_featured, rating, total_reviews) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      pg
    );
  }
}

function isDbConnected() {
  return dbConnected;
}

module.exports = { initDatabase, testConnection, isDbConnected, config };
