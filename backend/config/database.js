const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = process.env.DATABASE_URL 
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'smart_pg',
      port: process.env.DB_PORT || 5432,
    });

// Mock mysql2/promise API
const originalQuery = pool.query.bind(pool);

pool.query = async (sql, params = []) => {
  let paramIndex = 1;
  // Convert ? to $1, $2, etc. (Naive replacement, but works for our simple parameterized queries)
  let pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
  
  // Convert basic INSERT statements to include RETURNING id so we can mock insertId
  if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
    pgSql += ' RETURNING id';
  }

  try {
    const res = await originalQuery(pgSql, params);
    
    // In mysql2, INSERT responses have an `insertId`.
    if (res.command === 'INSERT' && res.rows && res.rows.length > 0) {
      res.rows.insertId = res.rows[0].id;
    }
    
    // Return array tuple [rows, fields]
    return [res.rows, res.fields || []];
  } catch (err) {
    throw err;
  }
};

module.exports = pool;
