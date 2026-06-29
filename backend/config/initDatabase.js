const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_pg',
  port: process.env.DB_PORT || 5432,
  connectionString: process.env.DATABASE_URL,
};

let dbConnected = false;

async function testConnection() {
  try {
    const conn = config.connectionString 
      ? new Client({ connectionString: config.connectionString })
      : new Client({
          host: config.host,
          user: config.user,
          password: config.password,
          database: config.database,
          port: config.port,
        });
    await conn.connect();
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
  let initialConn;
  let conn;
  try {
    if (config.connectionString) {
      // If a DATABASE_URL is provided (e.g. Supabase), the database is already created for us.
      // We just connect directly to it to initialize the schema.
      conn = new Client({ connectionString: config.connectionString });
      await conn.connect();
    } else {
      // Local Postgres setup
      // 1. Connect to default postgres DB to check/create the target database
      initialConn = new Client({
        host: config.host,
        user: config.user,
        password: config.password,
        database: 'postgres',
        port: config.port,
      });
      
      await initialConn.connect();
      const dbRes = await initialConn.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [config.database]);
      
      if (dbRes.rows.length === 0) {
        await initialConn.query(`CREATE DATABASE "${config.database}"`);
      }
      await initialConn.end();
      
      // 2. Connect to the target database to initialize schema
      conn = new Client({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database,
        port: config.port,
      });
      await conn.connect();
    }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'owner', 'admin')),
        avatar VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS pgs (
        id SERIAL PRIMARY KEY,
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
        gender_preference VARCHAR(20) DEFAULT 'any' CHECK (gender_preference IN ('male', 'female', 'any')),
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
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        pg_id INT NOT NULL,
        room_type VARCHAR(50),
        move_in_date DATE,
        duration_months INT DEFAULT 1,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
        total_amount DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (pg_id) REFERENCES pgs(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        booking_id INT,
        pg_id INT,
        amount DECIMAL(10, 2) NOT NULL,
        payment_type VARCHAR(20) DEFAULT 'rent' CHECK (payment_type IN ('booking', 'rent', 'deposit')),
        razorpay_order_id VARCHAR(100),
        razorpay_payment_id VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
        receipt_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
        FOREIGN KEY (pg_id) REFERENCES pgs(id) ON DELETE SET NULL
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        pg_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (pg_id) REFERENCES pgs(id) ON DELETE CASCADE,
        UNIQUE (user_id, pg_id)
      )
    `);

    const DEMO_HASH = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

    const userRows = await conn.query('SELECT COUNT(*) as count FROM users');
    if (parseInt(userRows.rows[0].count, 10) === 0) {
      await conn.query(`
        INSERT INTO users (name, email, password, role, phone) VALUES
        ('Admin User', 'admin@smartpg.com', $1, 'admin', NULL),
        ('Rajesh Kumar', 'owner@smartpg.com', $2, 'owner', '9876543210'),
        ('Anita Desai', 'anita@smartpg.com', $3, 'owner', '9876543212'),
        ('Priya Sharma', 'student@smartpg.com', $4, 'student', '9876543211')
      `, [DEMO_HASH, DEMO_HASH, DEMO_HASH, DEMO_HASH]);
      console.log('  Seeded default users (password: password)');
    }

    const pgRows = await conn.query('SELECT COUNT(*) as count FROM pgs');
    if (parseInt(pgRows.rows[0].count, 10) === 0) {
      await seedPGs(conn);
      console.log('  Seeded sample PG listings');
    }

    dbConnected = true;
    if (config.connectionString) {
      console.log(`  PostgreSQL connected via Supabase (DATABASE_URL)`);
    } else {
      console.log(`  PostgreSQL connected: ${config.database}@${config.host}`);
    }
    return true;
  } catch (err) {
    dbConnected = false;
    console.error(`  PostgreSQL FAILED:`, err);
    console.error('  Ensure PostgreSQL is running and DB credentials in .env are correct.');
    console.error('  Users will NOT be saved until PostgreSQL is connected.\n');
    return false;
  } finally {
    if (conn) await conn.end();
  }
}

async function seedPGs(conn) {
  const pgs = [
    [2, 'Sunshine PG for Girls', 'Premium PG with homely food near college.', 'Koramangala, Bangalore', '123 5th Block', 12.9352, 77.6245, 7500, 20, '{"double": 7500}', 'female', true, true, true, true, true, false, '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"]', true, 4.5, 28],
    [2, 'Elite Boys Hostel', 'Modern hostel with gym and WiFi.', 'Indiranagar, Bangalore', '456 100 Feet Road', 12.9784, 77.6408, 6500, 30, '{"triple": 6500}', 'male', true, true, false, false, true, true, '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]', true, 4.2, 45],
    [2, 'Comfort Stay PG', 'Budget PG near metro.', 'HSR Layout, Bangalore', '789 Sector 2', 12.9116, 77.6473, 5500, 15, '{"shared": 5500}', 'any', false, true, false, false, false, false, '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]', false, 3.8, 12],
    [2, 'Premium Living Spaces', 'Luxury PG with AC and food.', 'Whitefield, Bangalore', '321 ITPL Road', 12.9698, 77.7500, 12000, 10, '{"single": 12000}', 'any', true, true, true, true, true, true, '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"]', true, 4.8, 56],
    [2, 'Student Hub PG', 'Library and mess for students.', 'Jayanagar, Bangalore', '567 4th Block', 12.9308, 77.5838, 6000, 25, '{"double": 6000}', 'any', true, true, false, true, true, false, '["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"]', false, 4.0, 33],
    [3, 'Campus Connect PG', 'Near RV College with mess.', 'Jayanagar, Bangalore', 'RV College Road', 12.9230, 77.5680, 7800, 22, '{"triple": 7800}', 'any', true, true, false, true, true, false, '["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800"]', true, 4.4, 37],
    [3, 'Silicon Stay PG', 'Near Bellandur tech parks.', 'Bellandur, Bangalore', 'ORR Gate', 12.9250, 77.6762, 9500, 16, '{"double": 9500}', 'any', true, true, true, true, true, true, '["https://images.unsplash.com/photo-1505693416388-ac5ce068fe5?w=800"]', true, 4.7, 52],
  ];

  for (const pg of pgs) {
    // Note: Use $1, $2, etc., because we are bypassing the `database.js` adapter here and using native `pg.Client` directly!
    await conn.query(
      `INSERT INTO pgs (owner_id, name, description, location, address, latitude, longitude, rent, rooms, room_pricing, gender_preference, food_available, wifi, ac, attached_bathroom, laundry, parking, images, is_featured, rating, total_reviews) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
      pg
    );
  }
}

function isDbConnected() {
  return dbConnected;
}

module.exports = { initDatabase, testConnection, isDbConnected, config };
