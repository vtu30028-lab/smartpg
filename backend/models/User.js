const db = require('../config/database');

const User = {
  findByEmail: (email) => db.query('SELECT * FROM users WHERE email = ?', [email]),
  findById: (id) => db.query('SELECT id, name, email, role, phone, avatar, created_at FROM users WHERE id = ?', [id]),
  findAll: () => db.query('SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC'),
  create: (data) => db.query(
    'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
    [data.name, data.email, data.password, data.role, data.phone]
  ),
  delete: (id) => db.query('DELETE FROM users WHERE id = ?', [id]),
};

module.exports = User;
