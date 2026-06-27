const db = require('../config/database');

const Booking = {
  findByUser: (userId) =>
    db.query('SELECT b.*, p.name as pg_name, p.location FROM bookings b JOIN pgs p ON b.pg_id = p.id WHERE b.user_id = ?', [userId]),
  findByOwner: (ownerId) =>
    db.query('SELECT b.*, p.name as pg_name, u.name as user_name FROM bookings b JOIN pgs p ON b.pg_id = p.id JOIN users u ON b.user_id = u.id WHERE p.owner_id = ?', [ownerId]),
  create: (data) => db.query(
    'INSERT INTO bookings (user_id, pg_id, room_type, move_in_date, duration_months, status, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
    Object.values(data)
  ),
  updateStatus: (id, status) => db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]),
};

module.exports = Booking;
