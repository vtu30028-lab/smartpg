const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function migrate() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'smart_pg',
    });

    console.log('Connected to DB');

    // Add room_pricing column if it doesn't exist
    try {
      await conn.query('ALTER TABLE pgs ADD COLUMN room_pricing JSON');
      console.log('Added room_pricing column');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('room_pricing column already exists');
      } else {
        throw e;
      }
    }

    // Convert existing data
    const [pgs] = await conn.query('SELECT id, rent, room_type FROM pgs WHERE room_pricing IS NULL');
    for (const pg of pgs) {
      const roomType = pg.room_type || 'single';
      const rent = Number(pg.rent) || 5000;
      const pricing = {};
      pricing[roomType] = rent;
      
      await conn.query('UPDATE pgs SET room_pricing = ? WHERE id = ?', [JSON.stringify(pricing), pg.id]);
    }
    console.log(`Migrated ${pgs.length} rows`);

    // Drop old room_type column
    try {
      await conn.query('ALTER TABLE pgs DROP COLUMN room_type');
      console.log('Dropped old room_type column');
    } catch (e) {
      console.log('room_type column already dropped or does not exist', e.message);
    }

    console.log('Migration successful');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    if (conn) await conn.end();
  }
}

migrate();
