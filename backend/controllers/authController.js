const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isDbConnected } = require('../config/initDatabase');

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'smartpg_secret',
    { expiresIn: '7d' }
  );

const dbError = () => ({
  message: 'Database not connected. Set DB_PASSWORD in .env and restart the server.',
  hint: 'Open .env and add your MySQL root password: DB_PASSWORD=your_password',
});

exports.register = async (req, res) => {
  const { name, email, password, role = 'student', phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: 'Name, email, phone, and password are required.' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const validRole = ['student', 'owner'].includes(role) ? role : 'student';

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, validRole, phone || null]
    );

    const user = { id: result.insertId, name, email, role: validRole, phone: phone || null };
    const token = generateToken(user);

    res.status(201).json({ message: 'Registration successful.', token, user });
  } catch (error) {
    console.error('Register error:', error.message);
    if (!isDbConnected()) {
      return res.status(503).json(dbError());
    }
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const [users] = await db.query(
      'SELECT id, name, email, password, role, phone FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    res.json({ message: 'Login successful.', token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error.message);
    if (!isDbConnected()) {
      return res.status(503).json(dbError());
    }
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, phone, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Profile error:', error.message);
    res.status(500).json({ message: 'Could not fetch profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { avatar } = req.body;
    
    if (avatar !== undefined) {
      await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatar, req.user.id]);
    }
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Could not update profile.' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error.message);
    res.status(500).json({ message: 'Could not fetch users.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account.' });
    }
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    res.status(500).json({ message: 'Could not delete user.' });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q, role } = req.query;
    let sql = 'SELECT id, name, email, role, phone, created_at FROM users WHERE 1=1';
    const params = [];

    if (q) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const term = `%${q}%`;
      params.push(term, term, term);
    }
    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    sql += ' ORDER BY created_at DESC';
    const [users] = await db.query(sql, params);
    res.json(users);
  } catch (error) {
    console.error('Search users error:', error.message);
    res.status(500).json({ message: 'Could not search users.' });
  }
};
